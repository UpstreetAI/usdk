import {
  PendingActionMessage,
  AgentSpec,
  ActionMessage,
  // AgentObject,
  // ActiveAgentObject,
} from '../types';

export const formatConversationMessage = (rawMessage: PendingActionMessage, {
  agent,
}: {
  agent: AgentSpec,
}): ActionMessage => {
  const { id: userId, name } = agent;
  const { text, method, metadata, attachments } = rawMessage;
  const timestamp = new Date();
  const actionMessage: ActionMessage = {
    id: crypto.randomUUID(),
    userId,
    name,
    method,
    hidden: false,
    human: false,
    timestamp,
    text,
    attachments,
    metadata,
  };
  return actionMessage;
};
