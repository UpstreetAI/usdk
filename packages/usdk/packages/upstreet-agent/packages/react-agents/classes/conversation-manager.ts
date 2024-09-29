import { useState, useEffect } from 'react';
import type {
  RenderRegistry,
  ConversationObject,
  ConversationEventData,
} from '../types';
import { ExtendableMessageEvent } from '../util/extendable-message-event';

type ConversationLoadData = {
  conversation: ConversationObject,
};

export class ConversationManager extends EventTarget {
  registry: RenderRegistry;
  conversations = new Set<ConversationObject>();
  loadedConversations = new WeakMap<ConversationObject, boolean>();
  constructor({
    registry,
  }) {
    super();
    this.registry = registry;
  }
  getConversations() {
    return Array.from(this.conversations);
  }
  async addConversation(conversation: ConversationObject) {
    this.conversations.add(conversation);

    const e = new ExtendableMessageEvent<ConversationEventData>('conversationadd', {
      data: {
        conversation,
      },
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
  }
  async removeConversation(conversation: ConversationObject) {
    this.conversations.delete(conversation);

    const e = new ExtendableMessageEvent<ConversationEventData>('conversationremove', {
      data: {
        conversation,
      },
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
  }
  useDeferRender(conversation: ConversationObject) {
    const [doRender, setDoRender] = useState(() => !!this.loadedConversations.get(conversation));

    useEffect(() => {
      const conversationload = (e: ExtendableMessageEvent<ConversationLoadData>) => {
        if (e.data.conversation === conversation) {
          e.waitUntil((async () => {
            setDoRender(true);
            await this.registry.waitForUpdate();
          })());
        }
      };
      this.addEventListener('conversationload', conversationload);

      return () => {
        this.removeEventListener('conversationload', conversationload);
      };
    }, []);

    return doRender;
  }
  async waitForConversationLoad(conversation: ConversationObject) {
    if (!this.loadedConversations.get(conversation)) {
      this.loadedConversations.set(conversation, true);
      const e = new ExtendableMessageEvent<ConversationLoadData>('conversationload', {
        data: {
          conversation,
        },
      });
      this.dispatchEvent(e);
      await e.waitForFinish();
    }
  }
}