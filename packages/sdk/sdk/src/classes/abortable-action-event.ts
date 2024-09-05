import type {
  GenerativeAgentObject,
  PendingActionEventData,
  PendingActionMessage,
} from '../types';
import {
  AbortableMessageEvent,
} from './abortable-message-event';

export class AbortableActionEvent extends AbortableMessageEvent<PendingActionEventData> {
  constructor({
    agent,
    message,
  }: {
    agent: GenerativeAgentObject;
    message: PendingActionMessage;
  }) {
    super('abortableaction', {
      data: {
        agent,
        message,
      },
    });
  }
}