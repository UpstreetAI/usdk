import { createContext } from 'react';
import {
  AppContextValue,
  ConfigurationContextValue,
} from './types';

export const AppContext = createContext<AppContextValue | null>(null);
export const EpochContext = createContext<number>(0);
export const ConfigurationContext = createContext<ConfigurationContextValue>({
  get: (key: string) => null,
  set: (key: string, value: any) => {},
});
