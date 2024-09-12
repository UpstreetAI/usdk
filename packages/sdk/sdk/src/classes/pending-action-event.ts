import type {
  ActiveAgentObject,
  GenerativeAgentObject,
  PendingActionEventData,
  PendingActionMessage,
  ConversationObject,
} from '../types';

export class PendingActionEvent extends MessageEvent<PendingActionEventData> {
  constructor({
    agent,
    message,
  }: {
    agent: GenerativeAgentObject;
    message: PendingActionMessage;
  }) {
    super('pendingaction', {
      data: {
        agent,
        message,
      },
    });
  }
  async commit() {
    const {
      agent: generativeAgent,
      message,
    } = this.data;
    await generativeAgent.addMessage(message);
  }
}