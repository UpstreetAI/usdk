import { Message } from './message.js';
import { MessageBindings } from './message-bindings.js';
import type { StoryManager } from '../story/story-manager.js';

export class RuntimeMessage extends Message {
  constructor(opts) {
    super(opts);

    const { messageRuntime } = opts;
    if (!messageRuntime) {
      console.warn('missing arguments', {
        messageRuntime,
      });
      throw new Error('missing arguments');
    }

    this.#messageRuntime = messageRuntime;
    this.#visible = true;
    this.#bindings = new MessageBindings();
    this.#preloadPromise = null;
    this.#preloaded = false;
    this.#abortController = new AbortController();
  }

  #messageRuntime;
  #visible;
  #bindings;
  #preloadPromise;
  #preloaded;
  #abortController;

  static fromRawRuntime(raw, messageRuntime) {
    return new RuntimeMessage({
      raw,
      messageRuntime,
    });
  }

  getBindings() {
    return this.#bindings;
  }

  isAborted() {
    return this.#abortController.signal.aborted;
  }

  isVisible() {
    return this.#visible;
  }

  setVisible(visible) {
    this.#visible = visible;

    this.dispatchEvent(
      new MessageEvent('visiblechange', {
        data: {
          visible,
        },
      }),
    );
  }

  flash() {
    this.setVisible(false);

    setTimeout(() => {
      this.setVisible(true);
    });
  }

  // XXX deprecated
  getName() {
    // XXX
    throw new Error('not implemented');
    // return this.#messageRuntime.messageToName(this);
  }

  getCommand() {
    // XXX
    throw new Error('not implemented');
    // return this.#messageRuntime.messageToCommand(this);
  }

  getMessage() {
    // XXX
    throw new Error('not implemented');
    // return this.#messageRuntime.messageToMessage(this);
  }

  toReact(opts) {
    return this.#messageRuntime.messageToReact(this, opts);
  }

  toText() {
    return this.#messageRuntime.messageToText(this);
  }

  bindLore(lore) {
    return this.#messageRuntime.bindLore(this, lore);
  }

  isBlocking(storyManager: StoryManager) {
    // need engine to determine conversation settings
    return this.#messageRuntime.isBlocking(this, storyManager);
  }

  isMajor() {
    // need engine to determine conversation settings
    return this.#messageRuntime.isMajor(this);
  }

  isAction() {
    return this.#messageRuntime.isAction(this);
  }

  isPreloading() {
    return !!this.#preloadPromise && !this.#preloaded;
  }

  isPreloaded() {
    return this.#preloaded;
  }

  async waitForPreload() {
    if (this.#preloadPromise) {
      return await this.#preloadPromise;
    } else {
      throw new Error('not preloading');
    }
  }

  async preload({ signal }) {
    if (!signal) {
      throw new Error('missing arguments');
    }

    if (!this.#preloadPromise) {
      this.#preloadPromise = this.#messageRuntime.preload(this, {
        signal,
      });
      this.#preloadPromise.then(() => {
        this.#preloaded = true;
      });
    }
    return await this.#preloadPromise;
  }

  async execute({ voiceQueueManager, embodimentManager, chatManager, audioManager, multiplayer = false }) {
    this.dispatchEvent(new MessageEvent('executestart'));

    try {
      const { signal } = this.#abortController;

      await new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject();
        });

        (async () => {
          await this.#messageRuntime.execute(this, {
            signal,
            voiceQueueManager,
            embodimentManager,
            chatManager,
            multiplayer,
            audioManager,
          });
          resolve(null);
        })();
      });
    } finally {
      this.dispatchEvent(new MessageEvent('executeend'));
    }
  }

  getSignal() {
    return this.#abortController.signal;
  }

  abort() {
    this.#abortController.abort();
  }
}
