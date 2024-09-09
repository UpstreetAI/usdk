'use client';

import { useGlobalState } from "@/contexts/GlobalContext";

interface ChatLayoutProps {
  children: React.ReactNode
}

export function DevMode({ children }: ChatLayoutProps)  {
  const [globalState] = useGlobalState();

  return globalState.isDevMode ? children : null;
}