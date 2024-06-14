'use client'

import * as React from 'react'

interface ActionsContext {
  isSearchOpen: boolean
  toggleSearch: () => void
}

const ActionsContext = React.createContext<ActionsContext | undefined>(
  undefined
)

export function useActions() {
  const context = React.useContext(ActionsContext)
  if (!context) {
    throw new Error('useActions must be used within a ActionsProvider')
  }
  return context
}

interface ActionsProviderProps {
  children: React.ReactNode
}

export function ActionsProvider({ children }: ActionsProviderProps) {
  const [isSearchOpen, setSearchOpen] = React.useState(false)

  const toggleSearch = () => {
    setSearchOpen(value => !value)
  }

  return (
    <ActionsContext.Provider
      value={{ isSearchOpen, toggleSearch }}
    >
      {children}
    </ActionsContext.Provider>
  )
}
