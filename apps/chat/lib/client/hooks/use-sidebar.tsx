'use client'

import * as React from 'react'

interface SidebarContext {
  isLeftSidebarOpen: boolean
  toggleLeftSidebar: () => void
  isRightSidebarOpen: boolean
  toggleRightSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | undefined>(
  undefined
)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isLeftSidebarOpen, setLeftSidebarOpen] = React.useState(false)
  const [isRightSidebarOpen, setRightSidebarOpen] = React.useState(false)

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(value => {
      const newState = !value
      return newState
    })
  }
  const toggleRightSidebar = () => {
    setRightSidebarOpen(value => {
      const newState = !value
      return newState
    })
  }

  return (
    <SidebarContext.Provider
      value={{ isLeftSidebarOpen, toggleLeftSidebar, isRightSidebarOpen, toggleRightSidebar/*, isLoading*/ }}
    >
      {children}
    </SidebarContext.Provider>
  )
}
