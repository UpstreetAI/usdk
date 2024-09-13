import type {
  GenerativeAgentObject,
  PerceptionEventData,
  PerceptionMessage,
} from '../types';
import {
  AgentObject,
} from './agent-object';

export class PerceptionEvent extends MessageEvent<PerceptionEventData> {
  constructor({
    targetAgent,
    sourceAgent,
    message,
  }: {
    targetAgent: GenerativeAgentObject;
    sourceAgent: AgentObject;
    message: PerceptionMessage;
  }) {
    super('perception', {
      data: {
        targetAgent,
        sourceAgent,
        message,
      },
    });
  }
}