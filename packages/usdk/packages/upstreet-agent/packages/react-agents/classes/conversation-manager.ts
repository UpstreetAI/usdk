import { useState, useEffect } from 'react';
import type {
  AgentRegistry,
  ConversationObject,
  ConversationAddEventData,
  ConversationRemoveEventData,
} from '../types';
import { ExtendableMessageEvent } from '../util/extendable-message-event';

type ConversationLoadData = {
  conversation: ConversationObject,
};

export class ConversationManager extends EventTarget {
  registry: AgentRegistry;
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
  addConversation(conversation: ConversationObject) {
    this.conversations.add(conversation);
    this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
      data: {
        conversation,
      },
    }));
  }
  removeConversation(conversation: ConversationObject) {
    this.conversations.delete(conversation);
    this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
        data: {
        conversation,
        },
    }));
  }
  useDeferRender(conversation: ConversationObject) {
    const [deferRender, setDeferRender] = useState(() => !!this.loadedConversations.get(conversation));

    useEffect(() => {
      const conversationload = (e: ExtendableMessageEvent<ConversationLoadData>) => {
        if (e.data.conversation === conversation) {
          e.waitUntil((async () => {
            setDeferRender(true);
            await this.registry.waitForUpdate();
          })());
        }
      };
      this.addEventListener('conversationload', conversationload);

      return () => {
        this.removeEventListener('conversationload', conversationload);
      };
    }, []);

    return deferRender;
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