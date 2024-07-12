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
    // console.log('handle agent commit 2', newMessage);

    // XXX move this to the conversation itself
    /* const { id: userId, name } = this;
    const { method, args } = pendingActionMessage;
    const timestamp = new Date();
    const actionMessage = {
      userId,
      name,
      method,
      args,
      timestamp,
    };
    const conversation = opts?.conversation;
    conversation?.addLocalAndRemoteMessage(actionMessage);
    // XXX emit update method and handle externally
    await self.rerenderAsync(); */
  }
}