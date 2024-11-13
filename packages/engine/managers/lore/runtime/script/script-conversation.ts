import { Conversation } from '../../conversation.js';
import type { ChatManager } from '../../../chat/chat-manager.js';
import type { EmbodimentManager } from '../../../embodiment/embodiment-manager.js';
import type { QueueManager } from '../../../queue/queue-manager.js';
import type { StoryManager } from '../../../story/story-manager.js';
import type { LoreManager } from '../../lore-manager.js';

export class MessageQueue {
  queue = [];
  eventTarget = new EventTarget();
  push(message) {
    // console.log('push message', {
    //   message,
    // });
    if (!message) {
      console.error('no message to push');
    }
    this.queue.push(message);
    this.eventTarget.dispatchEvent(new MessageEvent('push'));
  }
  pull() {
    // console.log('pull message 1');
    if (this.queue.length > 0) {
      // console.log('pull message 2');
      return this.queue.shift();
    } else {
      // console.log('pull message 3');
      return new Promise((resolve) => {
        // console.log('pull message 4');
        const push = () => {
          cleanup();
          resolve(this.queue.shift());
        };
        const cleanup = () => {
          this.eventTarget.removeEventListener('push', push);
        };
        this.eventTarget.addEventListener('push', push);
      });
    }
  }
}

export class ScriptConversation extends Conversation {
  loreManager: LoreManager;
  storyManager: StoryManager;
  embodimentManager: EmbodimentManager;
  voiceQueueManager: QueueManager;
  chatManager: ChatManager;
  messageQueue: MessageQueue;

  constructor({
    loreManager,
    storyManager,
    embodimentManager,
    voiceQueueManager,
    chatManager,
  }: {
    loreManager: LoreManager;
    storyManager: StoryManager;
    embodimentManager: EmbodimentManager;
    voiceQueueManager: QueueManager;
    chatManager: ChatManager;
    messageQueue: MessageQueue;
  }) {
    super({
      loreManager,
      storyManager,
      embodimentManager,
      voiceQueueManager,
      chatManager,
      isScript: true,
    });

    this.loreManager = loreManager;
    this.storyManager = storyManager;
    this.embodimentManager = embodimentManager;
    this.voiceQueueManager = voiceQueueManager;
    this.chatManager = chatManager;
    this.messageQueue = new MessageQueue();

    this.startPreload();
    this.startComplete(({ conversation }) => {
      return async () => {
        const message = await this.messageQueue.pull();
        console.log('pulled message to queue', {
          message,
        });
        conversation.queueMessage(message);
      };
    });
  }

  pushMessage(message) {
    const lore = this.loreManager.getLore();
    if (message.bindLore(lore)) {
      this.messageQueue.push(message);
    } else {
      console.warn('could not bind lore to message', {
        content: message.getContent(),
        message,
        lore,
      });
      throw new Error('could not bind lore to message');
    }
  }
}
