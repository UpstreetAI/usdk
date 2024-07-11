import { useContext } from 'react';
import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionProps,
  FormatterProps,
  NameProps,
  PersonalityProps,
  ActionMessages,
  ActionHistoryQuery,
  ChatArgs,
  TtsArgs,
  Tts,
  Chat,
} from './types';
import {
  AppContext,
  AgentContext,
} from './context';

//

export const useAuthToken: () => string = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useAuthToken();
};

//

export const useCurrentAgent: () => ActiveAgentObject = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue;
};
export const useCurrentConversation = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useCurrentConversation();
};
/* export const useScene: () => SceneObject = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useScene();
};
export const useAgents: () => Array<AgentObject> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useAgents();
}; */

export const useActions: () => Array<ActionProps> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useActions();
};
export const useFormatters: () => Array<FormatterProps> = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useFormatters();
};

export const useName: () => string = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useName();
};
export const usePersonality: () => string = () => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.usePersonality();
};

export const useActionHistory: (opts?: ActionHistoryQuery) => ActionMessages = (opts) => {
  const agentContextValue = useContext(AgentContext);
  return agentContextValue.useActionHistory(opts);
};

export const useTts: (opts?: TtsArgs) => Tts = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useTts(opts);
};
export const useChat: (opts?: ChatArgs) => Chat = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useChat(opts);
};
