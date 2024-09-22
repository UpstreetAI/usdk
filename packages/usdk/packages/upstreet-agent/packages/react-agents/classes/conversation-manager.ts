import type {
  ConversationObject,
  ConversationAddEventData,
  ConversationRemoveEventData,
} from '../types';

export class ConversationManager extends EventTarget {
  conversations = new Set<ConversationObject>();
  loadedConversations: ConversationObject[] = [];
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
}