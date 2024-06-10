import { createContext } from 'react';
import {
  AppContextValue,
} from './types';

export const AppContext = createContext<AppContextValue | null>(null);
export const EpochContext = createContext<number>(0);