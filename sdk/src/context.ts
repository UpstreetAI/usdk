import { createContext } from 'react';
import {
  AppContextValue,
  // AgentContextValue,
  ActiveAgentObject,
  GenerativeAgentObject,
  ConversationObject,
  ConfigurationContextValue,
} from './types';

export const AppContext = createContext<AppContextValue | null>(null);
export const EpochContext = createContext<number>(0);
export const AgentContext = createContext<ActiveAgentObject | null>(null);
export const ConversationContext = createContext<ConversationObject | null>(null);
export const ConversationsContext = createContext<ConversationObject[]>([]);
export const ConfigurationContext = createContext<ConfigurationContextValue>({
  get: (key: string) => null,
  set: (key: string, value: any) => {},
});
