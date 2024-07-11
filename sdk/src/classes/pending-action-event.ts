import type {
  ActiveAgentObject,
  PendingActionEventData,
  PendingActionMessage,
  Conversation,
} from '../types';

export class PendingActionEvent extends MessageEvent<PendingActionEventData> {
  constructor({
    agent,
    message,
    conversation,
  }: {
    agent: ActiveAgentObject;
    message: PendingActionMessage;
    conversation: Conversation;
  }) {
    super('pendingaction', {
      data: {
        agent,
        message,
        conversation,
      },
    });
  }
  async commit() {
    // console.log('handle agent commit 1', newMessage);
    const {
      agent,
      message,
      conversation,
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
    conversation.addLocalAndRemoteMessage(newMessage);
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