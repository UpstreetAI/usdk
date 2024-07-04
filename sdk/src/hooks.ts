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
import { AppContext } from './context';

export const useAuthToken: () => string = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useAuthToken();
};
export const useScene: () => SceneObject = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useScene();
};
export const useAgents: () => Array<AgentObject> = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useAgents();
};
export const useCurrentAgent: () => ActiveAgentObject = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useCurrentAgent();
};

export const useActions: () => Array<ActionProps> = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useActions();
};
export const useFormatters: () => Array<FormatterProps> = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useFormatters();
};

export const useNames: () => Array<NameProps> = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useNames();
};
export const usePersonalities: () => Array<PersonalityProps> = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.usePersonalities();
};

export const useName: () => string = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useName();
};
export const usePersonality: () => string = () => {
  const appContextValue = useContext(AppContext);
  return appContextValue.usePersonality();
};

export const useActionHistory: (opts?: ActionHistoryQuery) => ActionMessages = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useActionHistory(opts);
};

export const useTts: (opts?: TtsArgs) => Tts = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useTts(opts);
};
export const useChat: (opts?: ChatArgs) => Chat = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useChat(opts);
};
