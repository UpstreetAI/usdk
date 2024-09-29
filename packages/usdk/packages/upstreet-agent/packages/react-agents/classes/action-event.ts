import type {
  GenerativeAgentObject,
  PendingActionEventData,
  PendingActionMessage,
} from '../types';

export class ActionEvent extends MessageEvent<PendingActionEventData> {
  constructor({
    agent,
    message,
  }: {
    agent: GenerativeAgentObject;
    message: PendingActionMessage;
  }) {
    super('action', {
      data: {
        agent,
        message,
      },
    });
  }
}