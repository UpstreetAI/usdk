'use client';

import { useGlobalState } from "@/contexts/GlobalContext";
import { redirect } from 'next/navigation';

interface ChatLayoutProps {
  children: React.ReactNode
}

export function Dev({ children }: ChatLayoutProps) {
  const [globalState] = useGlobalState();

  return globalState.isDevMode ? children : null;
}

export function DevRedirect() {
  const [globalState] = useGlobalState();

  return !globalState.isDevMode ? redirect('/') : null;
}