'use client'

import * as React from 'react'

interface DirectMessageActionsContextType {
  popoverMessageId: string;
  togglePopoverMessageId: (id: string) => void;
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
  const [popoverMessageId, setPopoverMessageId] = React.useState<string>('');
  const [dmsOpen, setDmsOpen] = React.useState<string[]>([]);

  const togglePopoverMessageId = (id: string) => {
    if (popoverMessageId !== id) {
      setPopoverMessageId(id);
    } else {
      setPopoverMessageId('');
    }
  };
  const toggleOpenDm = (userId: string) => {
    const index = dmsOpen.indexOf(userId);
    if (index !== -1) {
      // nothing
    } else {
      setDmsOpen([...dmsOpen, userId]);
    }
  };

  return (
    <DirectMessageActionsContext.Provider
      value={{ popoverMessageId, togglePopoverMessageId, dmsOpen, toggleOpenDm, }}
    >
      {children}
    </DirectMessageActionsContext.Provider>
  )
}
