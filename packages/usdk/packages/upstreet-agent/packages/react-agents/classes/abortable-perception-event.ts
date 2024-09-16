import type {
  GenerativeAgentObject,
  PerceptionEventData,
  PerceptionMessage,
} from '../types';
import {
  AbortableMessageEvent,
} from './abortable-message-event';
import {
  AgentObject,
} from './agent-object';

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