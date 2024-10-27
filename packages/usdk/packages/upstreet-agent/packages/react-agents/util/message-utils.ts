import {
  PendingActionMessage,
  AgentSpec,
  // AgentObject,
  // ActiveAgentObject,
} from '../types';
import { PlayerType } from 'react-agents/constants.mjs';

export const formatConversationMessage = (rawMessage: PendingActionMessage, {
  agent,
}: {
  agent: AgentSpec,
}) => {
  const { id: userId, name } = agent;
  const { method, args, attachments } = rawMessage;
  
  const timestamp = new Date();
  const newMessage = {
    userId,
    name,
    method,
    args: {...args, playerType: PlayerType.Agent},
    attachments,
    timestamp,
    hidden: false,
  };
  return newMessage;
};