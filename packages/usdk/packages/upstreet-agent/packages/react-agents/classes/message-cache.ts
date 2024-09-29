import type {
  ActionMessage,
  MessageCacheUpdateArgs,
} from '../types';
import { ExtendableMessageEvent } from '../util/extendable-message-event';

export const CACHED_MESSAGES_LIMIT = 50;

type MessageCacheArgs = {
  loader: () => Promise<ActionMessage[]>;
};
export class MessageCache extends EventTarget {
  #messages: ActionMessage[] = [];
  #loadPromise: Promise<void> | null = null;
  loader: () => Promise<ActionMessage[]>;

  constructor({
    loader,
  }: MessageCacheArgs) {
    super();

    this.loader = loader;
  }
  getMessages() {
    return this.#messages;
  }
  async pushMessage(message: ActionMessage) {
    this.#messages.push(message);
    this.trim();
    await this.tickUpdate();
  }
  trim() {
    if (this.#messages.length > CACHED_MESSAGES_LIMIT) {
      this.#messages.splice(0, this.#messages.length - CACHED_MESSAGES_LIMIT);
    }
  }
  async tickUpdate() {
    const e = new ExtendableMessageEvent<MessageCacheUpdateArgs>('update', {
      data: null,
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
  }
  async #prependMessages(messages: ActionMessage[]) {
    this.#messages.unshift(...messages);
    this.trim();
    await this.tickUpdate();
  }
  async waitForLoad() {
    if (!this.#loadPromise) {
      this.#loadPromise = (async () => {
        const messages = await this.loader();
        await this.#prependMessages(messages);
      })();
    }
    await this.#loadPromise;
  }
}