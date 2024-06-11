import { useContext } from 'react';
import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionProps,
  ActionMessages,
} from './types';
import { AppContext } from './context';

export const useScene: () => SceneObject = () => {
  // const AppContext = useUpstreetSdkAppContext();
  const appContextValue = useContext(AppContext);
  return appContextValue.useScene();
};
export const useAgents: () => Array<AgentObject> = () => {
  // const AppContext = useUpstreetSdkAppContext();
  const appContextValue = useContext(AppContext);
  return appContextValue.useAgents();
};
export const useCurrentAgent: () => ActiveAgentObject = () => {
  // const AppContext = useUpstreetSdkAppContext();
  const appContextValue = useContext(AppContext);
  return appContextValue.useCurrentAgent();
};
export const useActions: () => Array<ActionProps> = () => {
  // const AppContext = useUpstreetSdkAppContext();
  const appContextValue = useContext(AppContext);
  return appContextValue.useActions();
};
export const useActionHistory: (agents: Array<AgentObject> | AgentObject) => ActionMessages = (agents) => {
  // const AppContext = useUpstreetSdkAppContext();
  const appContextValue = useContext(AppContext);
  return appContextValue.useActionHistory(agents);
};
