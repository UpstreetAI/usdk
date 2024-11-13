import { QueueManager } from '../queue/queue-manager.js';
import type { EmbodimentManager } from '../embodiment/embodiment-manager.js';
import type { StoryManager } from '../story/story-manager.js';
import type { LoreManager } from './lore-manager.js';
import type { ChatManager } from '../chat/chat-manager.js';
import type { AudioManager } from '../../audio/audio-manager.js';

const defaultMessageCompleteBufferLength = 10;
const defaultMessagePreloadBufferLength = 3;
const abortError = new Error('abort');

export class Conversation extends EventTarget {
  loreManager: LoreManager;
  storyManager: StoryManager;
  embodimentManager: EmbodimentManager;
  voiceQueueManager: QueueManager;
  chatManager: ChatManager;

  constructor({
    loreManager,
    storyManager,
    embodimentManager,
    voiceQueueManager,
    chatManager,
    audioManager,
    messages = [],
    messageCompleteBufferLength = defaultMessageCompleteBufferLength,
    messagePreloadBufferLength = defaultMessagePreloadBufferLength,
    isScript = false,
  }: {
    loreManager?: LoreManager;
    storyManager?: StoryManager;
    embodimentManager?: EmbodimentManager;
    voiceQueueManager?: QueueManager;
    chatManager?: ChatManager;
    audioManager: AudioManager;
    messages?: any[];
    messageCompleteBufferLength?: number;
    messagePreloadBufferLength?: number;
    isScript?: boolean;
  }) {
    super();

    if (!loreManager) {
      console.warn('missing loreManager', {
        loreManager,
      });
      throw new Error('missing loreManager');
    }

    this.#chatManager = chatManager;
    this.#embodimentManager = embodimentManager;
    this.#voiceQueueManager = voiceQueueManager;
    this.#storyManager = storyManager;
    this.#loreManager = loreManager;
    this.#audioManager = audioManager;
    this.#messageCompleteBufferLength = messageCompleteBufferLength;
    this.#messagePreloadBufferLength = messagePreloadBufferLength;

    // completion
    this.#completeAbortController = new AbortController();

    // preload
    this.#preloadAbortController = new AbortController();

    // execution
    this.#executeAbortController = new AbortController();
    this.#executeQueueManager = new QueueManager();
    this.#queuedMessages = messages; // messages ready to execute
    this.#executingMessageIndex = 0; // one more than the message being executed
    this.#executingMessages = []; // messages currently being executed

    this.#executeQueueManager.addEventListener('idlechange', (e) => {
      const { idle } = e.data;
      this.dispatchEvent(
        new MessageEvent('runningchange', {
          data: {
            running: !idle,
          },
        }),
      );
    });

    this.#numWaits = 0;
    this.#waitQueue = new QueueManager();
    this.#isScript = isScript;
  }

  #chatManager;
  #embodimentManager;
  #voiceQueueManager;
  #storyManager;
  #loreManager;
  #audioManager;
  #messageCompleteBufferLength;
  #messagePreloadBufferLength;

  #executeAbortController;
  #completerGeneratorFn;
  #completeAbortController;

  #preloadAbortController;

  #executeQueueManager;
  #queuedMessages;
  #executingMessageIndex;
  #executingMessages;

  #numWaits;
  #waitQueue;

  #isScript;

  // getters

  // whether we are currently executing messages
  isRunning() {
    return !this.#executeQueueManager.isIdle();
  }

  // get the messages not yet executed
  getPendingMessages() {
    return this.#queuedMessages.slice(this.#executingMessageIndex);
  }
  // get the number of messages not yet executed
  getNumPendingMessages() {
    return this.#queuedMessages.length - this.#executingMessageIndex;
  }
  // get the number of messages we have room for to queue for execution
  getQueueCapacityRemaining() {
    return Math.max(
      this.#messageCompleteBufferLength +
        this.#numWaits -
        this.getNumPendingMessages(),
      0,
    );
  }

  appendUserMessage({ msgRuntime, signal }) {
    const lore = this.#loreManager.getLore();
    if (msgRuntime.bindLore(lore)) {
      //added preload here for that message, because it's not getting preloaded without that
      msgRuntime.preload({ signal });
      this.queueMessage(msgRuntime);
    } else {
      console.warn('could not bind lore to message', {
        content: msgRuntime.getContent(),
        message: msgRuntime,
        lore,
      });
      throw new Error('could not bind lore to message');
    }

    this.executeOne();
  }
  startComplete(completerGeneratorFn) {
    this.#completerGeneratorFn = completerGeneratorFn;

    const nextFn = completerGeneratorFn({
      conversation: this,
      storyManager: this.#storyManager,
    });
    if (typeof nextFn !== 'function') {
      console.error('completer generator did not return a function');
    }

    const { signal } = this.#completeAbortController;
    const pred = () => this.getQueueCapacityRemaining() > 0;
    (async () => {
      while (!signal.aborted) {
        if (pred()) {
          // console.log('next 1');
          await nextFn();
          // console.log('next 2');
        } else {
          // console.log('wait for pending remove 1');
          console.log('complete wait');
          await new Promise((accept) => {
            const release = () => {
              accept(null);
              cleanup();
            };
            this.addEventListener('pendingremove', release);
            this.addEventListener('waitadd', release);
            signal.addEventListener('abort', release);

            const cleanup = () => {
              this.removeEventListener('pendingremove', release);
              this.removeEventListener('waitadd', release);
              signal.removeEventListener('abort', release);
            };
          });
          console.log('complete wake');
          // console.log('wait for pending remove 2');
        }
      }
      // console.log('message executer aborted');
    })();
  }
  stopComplete() {
    const oldCompleterGeneratorFn = this.#completerGeneratorFn;
    this.#completerGeneratorFn = null;

    this.#completeAbortController.abort(abortError);
    this.#completeAbortController = new AbortController();

    return oldCompleterGeneratorFn;
  }
  restartComplete() {
    const completerGeneratorFn = this.stopComplete();
    this.startComplete(completerGeneratorFn);
  }
  getCompleteSignal() {
    return this.#completeAbortController.signal;
  }

  // preload

  startPreload() {
    const { signal } = this.#preloadAbortController;

    (async () => {
      while (!signal.aborted) {
        const candidateMessages = this.#queuedMessages
          .slice(this.#executingMessageIndex)
          .filter((message) => message.isMajor());
        const preloadedMessages = [];
        const preloadableMessages = [];
        for (const message of candidateMessages) {
          if (message.isPreloaded() || message.isPreloading()) {
            preloadedMessages.push(message);
          } else {
            preloadableMessages.push(message);
          }
        }

        const numMessagesToPreload = Math.max(
          this.#messagePreloadBufferLength - preloadedMessages.length,
          0,
        );
        const messagesToPreload = preloadableMessages.slice(
          0,
          numMessagesToPreload,
        );
        if (messagesToPreload.length > 0) {
          for (const message of messagesToPreload) {
            // abort preload when message aborts
            if (!message.getRaw().is_rvc) {
              const signal = message.getSignal();
              message.preload({
                signal,
              });
            }
          }
        }

        // wait for pendingadd or pendingremove
        await new Promise((accept) => {
          const advance = () => {
            accept(null);
            cleanup();
          };
          const cleanup = () => {
            this.removeEventListener('pendingadd', advance);
            this.removeEventListener('pendingremove', advance);
            signal.removeEventListener('abort', advance);
          };
          this.addEventListener('pendingadd', advance);
          this.addEventListener('pendingremove', advance);
          signal.addEventListener('abort', advance);
        });
      }
    })();
  }
  stopPreload() {
    this.#preloadAbortController.abort(abortError);
    this.#preloadAbortController = new AbortController();
  }
  getPreloadSignal() {
    return this.#preloadAbortController.signal;
  }

  // execution

  // queue message for execution
  async queueMessage(message) {
    // execution
    this.#queuedMessages.push(message);

    const pendingMessages = this.getNumPendingMessages();
    this.dispatchEvent(
      new MessageEvent('pendingadd', {
        data: {
          message,
        },
      }),
    );
    console.log('up pending messages', pendingMessages);
  }
  async #pullPendingMessageForExecution({ signal }) {
    const unexecutedMessages = this.#queuedMessages.slice(
      this.#executingMessageIndex,
    );
    if (unexecutedMessages.length === 0) {
      // wait for pendingadd event

      this.#numWaits++;
      this.dispatchEvent(new MessageEvent('waitadd'));
      await this.#waitQueue.waitForTurn(
        () =>
          new Promise((accept) => {
            const cleanupFns = [];
            const cleanup = () => {
              for (const fn of cleanupFns) {
                fn();
              }
            };

            const pendingadd = (e: any) => {
              accept(null);
              cleanup();
            };
            this.addEventListener('pendingadd', pendingadd);

            if (signal) {
              const abort = (e: any) => {
                accept(null);
                cleanup();
              };
              signal.addEventListener('abort', abort);

              cleanupFns.push(() => {
                signal.removeEventListener('abort', abort);
              });
            }
          }),
      );
      this.#numWaits--;
      this.dispatchEvent(new MessageEvent('waitremove'));
    }
    if (signal.aborted) {
      return null;
    }

    const message = this.#queuedMessages[this.#executingMessageIndex];
    this.#executingMessageIndex++;

    // dispatch pending remove event
    const pendingMessages = this.getNumPendingMessages();
    this.dispatchEvent(
      new MessageEvent('pendingremove', {
        data: {
          message,
        },
      }),
    );
    console.log('down pending messages', pendingMessages);

    return message;
  }
  async #next({ signal }) {
    const message = await this.#pullPendingMessageForExecution({
      signal,
    });

    if (message) {
      this.#executingMessages.push(message);
      await this.#executeQueueManager.waitForTurn(async () => {
        try {
          await this.#voiceQueueManager.waitForTurn(async () => {
            if (message.isAborted()) {
              return;
            }
            this.dispatchEvent(
              new MessageEvent('messageplay', {
                data: {
                  message,
                },
              }),
            );

            if (!message.getRaw().id) {
              message.setId(crypto.randomUUID());
            }
            if (this.#isScript) {
              message.setCreatedAt(new Date().toISOString());
            }
            console.log('execute message', message);

            if (!message.getRaw().is_rvc) {
              message.execute({
                voiceQueueManager: this.#voiceQueueManager,
                embodimentManager: this.#embodimentManager,
                chatManager: this.#chatManager,
                audioManager: this.#audioManager,
              });
              message.addEventListener('playEnd', () => {
                this.#executingMessages = this.#executingMessages.filter(
                  (m) => m.getRaw().id !== message.getRaw().id,
                );
              });
            }
            if (signal?.aborted) return;

            this.dispatchEvent(
              new MessageEvent('messagestop', {
                data: {
                  message,
                },
              }),
            );
          });
        } catch (e) {
          console.log(e);
        }
      });
    }
    if (this.getNumPendingMessages() === 0) {
      // Dispatch an event indicating conversation completion
      if (this.#chatManager) {
        this.#chatManager.dispatchEvent(new MessageEvent('conversationscomplete'));
      }
    }
    return message;
  }
  /* async startExecute({
    abortController = new AbortController(),
  } = {}) {
    this.#executeAbortController = abortController;
    const {signal} = this.#executeAbortController;

    for (;;) {
      await this.#next({
        signal,
      });
    }
  } */
  stopExecute() {
    this.#executeAbortController.abort(abortError);
    this.#executeAbortController = new AbortController();
  }
  async executeOne() {
    this.#executeAbortController = new AbortController();
    const { signal } = this.#executeAbortController;
    for (;;) {
      const message = await this.#next({
        signal,
      });
      if (signal.aborted) return;
      console.log('execute message', {
        message,
        isBlocking: !!message?.isBlocking(this.#storyManager),
      });
      if (message) {
        if (message.isBlocking(this.#storyManager)) {
          console.log('stop since message was blocking');
          break;
        } else {
          console.log('continue since message was not blocking');
          continue;
        }
      } else {
        console.error('stop since no message (probably broke out via signal)', {
          message,
        });
        break;
      }
    }
  }
  getExecuteSignal() {
    return this.#executeAbortController.signal;
  }

  // management

  // fast forward past the current message
  interruptOne() {
    this.#executingMessages.forEach((m) => {
      m.abort(abortError);
    });
  }
  // flush the completion message cache
  clipTail() {
    for (
      let i = this.#executingMessageIndex;
      i < this.#queuedMessages.length;
      i++
    ) {
      const message = this.#queuedMessages[i];
      message.abort(abortError);

      const pendingMessages = this.getNumPendingMessages();
      this.dispatchEvent(
        new MessageEvent('pendingremove', {
          data: {
            message,
          },
        }),
      );
      console.log('down pending messages due to clip', pendingMessages);
    }
    this.#queuedMessages.length = this.#executingMessageIndex;
  }
  close() {
    this.stopComplete();
    this.stopPreload();
    this.stopExecute();
    this.interruptOne();

    this.dispatchEvent(new MessageEvent('close'));
  }
}
