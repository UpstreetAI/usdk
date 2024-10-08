'use client'

import * as React from 'react'

interface LoadingContext {
  isAgentLoading: boolean
  setIsAgentLoading: React.Dispatch<React.SetStateAction<boolean>>
}

const LoadingContext = React.createContext<LoadingContext | undefined>(
  undefined
)

export function useLoading() {
  const context = React.useContext(LoadingContext)
  if (!context) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: React.ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {

  const [isAgentLoading, setIsAgentLoading] = React.useState(false)


  return (
    <LoadingContext.Provider
      value={{ isAgentLoading, setIsAgentLoading }}
    >
      {children}
    </LoadingContext.Provider>
  )
}
