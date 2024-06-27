import { useContext } from 'react';
import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionProps,
  FormatterProps,
  ActionMessages,
  ActionHistoryQuery,
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
export const useActionHistory: (opts?: ActionHistoryQuery) => ActionMessages = (opts) => {
  const appContextValue = useContext(AppContext);
  return appContextValue.useActionHistory(opts);
};
