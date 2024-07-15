import { createContext } from 'react';
import {
  AppContextValue,
  // AgentContextValue,
  ActiveAgentObject,
  GenerativeAgentObject,
  ConversationObject,
  ConfigurationContextValue,
  // AgentRegistry,
} from './types';
import {
  AgentRegistry,
} from './classes/render-registry';

export const AppContext = createContext<AppContextValue | null>(null);
export const AgentContext = createContext<ActiveAgentObject | null>(null);
export const AgentRegistryContext = createContext<AgentRegistry>(new AgentRegistry());
export const ConversationContext = createContext<ConversationObject | null>(null);
export const ConversationsContext = createContext<ConversationObject[]>([]);
export const ConfigurationContext = createContext<ConfigurationContextValue>({
  get: (key: string) => null,
  set: (key: string, value: any) => {},
});
