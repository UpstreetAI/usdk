import type {
  GenerativeAgentObject,
  PerceptionEventData,
  PerceptionMessage,
  AgentObject,
} from '../types';
import {
  AbortableMessageEvent,
} from './abortable-message-event';

export class AbortablePerceptionEvent extends AbortableMessageEvent<PerceptionEventData> {
  constructor({
    targetAgent,
    sourceAgent,
    message,
  }: {
    targetAgent: GenerativeAgentObject;
    sourceAgent: AgentObject;
    message: PerceptionMessage;
  }) {
    super('abortableperception', {
      data: {
        targetAgent,
        sourceAgent,
        message,
      },
    });
  }
}