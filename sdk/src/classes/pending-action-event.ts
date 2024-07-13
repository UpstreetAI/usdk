import type {
  ActiveAgentObject,
  GenerativeAgentObject,
  PendingActionEventData,
  PendingActionMessage,
  Conversation,
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
    // console.log('handle agent commit 1', newMessage);
    const {
      agent,
      message,
    } = super.data;

    const { id: userId, name } = agent;
    const { method, args } = message;
    const timestamp = new Date();
    const newMessage = {
      userId,
      name,
      method,
      args,
      timestamp,
      human: false,
      hidden: false,
    };
    agent.conversation.addLocalAndRemoteMessage(newMessage);
  }
}