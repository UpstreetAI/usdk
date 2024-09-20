'use client';

import { useGlobalState } from "@/contexts/GlobalContext";

interface ChatLayoutProps {
  children: React.ReactNode
}

export function Dev({ children }: ChatLayoutProps)  {
  const [globalState] = useGlobalState();

  return globalState.isDevMode ? children : null;
}