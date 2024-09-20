import { createContext } from 'react';
import {
  AppContextValue,
  // AgentContextValue,
  ActiveAgentObject,
  // GenerativeAgentObject,
  ConversationObject,
  // ConfigurationContextValue,
  // AgentRegistry,
} from './types';
import {
  AgentRegistry,
} from './classes/render-registry';

export const AppContext = createContext<AppContextValue | null>(null);
export const AgentContext = createContext<ActiveAgentObject | null>(null);
export const AgentRegistryContext = createContext<{agentRegistry: AgentRegistry}>({agentRegistry: new AgentRegistry()});
export const ConversationContext = createContext<{conversation: ConversationObject | null}>({conversation: null});
export const ConversationsContext = createContext<{conversations: ConversationObject[]}>({conversations: []});
