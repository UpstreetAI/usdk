'use client'

import * as React from 'react'

interface DirectMessageActionsContextType {
  popoverUserId: string;
  togglePopoverUserId: (userId: string) => void;
  dmsOpen: string[];
  toggleOpenDm: (userId: string) => void;
};

const DirectMessageActionsContext = React.createContext<DirectMessageActionsContextType | undefined>(
  undefined
)

export function useDirectMessageActions() {
  const context = React.useContext(DirectMessageActionsContext)
  if (!context) {
    throw new Error('useDirectMessageActions must be used within a DirectMessageActionsProvider')
  }
  return context
}

interface DirectMessageActionsProviderProps {
  children: React.ReactNode
}

export function DirectMessageActionsProvider({ children }: DirectMessageActionsProviderProps) {
  const [popoverUserId, setPopoverId] = React.useState<string>('');
  const [dmsOpen, setDmsOpen] = React.useState<string[]>([]);

  const togglePopoverUserId = (userId: string) => {
    if (popoverUserId !== userId) {
      setPopoverId(userId);
    } else {
      setPopoverId('');
    }
  };
  const toggleOpenDm = (userId: string) => {
    const index = dmsOpen.indexOf(userId);
    if (index !== -1) {
      setDmsOpen(dmsOpen.filter((id) => id !== userId));
    } else {
      setDmsOpen([...dmsOpen, userId]);
    }
  };

  return (
    <DirectMessageActionsContext.Provider
      value={{ popoverUserId, togglePopoverUserId, dmsOpen, toggleOpenDm, }}
    >
      {children}
    </DirectMessageActionsContext.Provider>
  )
}
