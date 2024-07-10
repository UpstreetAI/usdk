import type {
  ActiveAgentObject,
  PendingActionEventData,
  PendingActionMessage,
} from '../types';

export class PendingActionEvent extends MessageEvent<PendingActionEventData> {
  constructor({
    agent,
    message,
  }: {
    agent: ActiveAgentObject;
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
    }: {
      agent: ActiveAgentObject;
      message: PendingActionMessage,
    } = super.data;
    await agent.addAction(message);
    // console.log('handle agent commit 2', newMessage);
  }
}