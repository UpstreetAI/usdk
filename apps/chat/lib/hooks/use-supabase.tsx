'use client'

import * as React from 'react'

const LOCAL_STORAGE_KEY = 'sidebar'

interface SupabaseContext {
  user: object | null;
  supabase: any | null;
}

const SupabaseContext = React.createContext<SupabaseContext | undefined>(
  undefined
)

export function useSupabase() {
  const context = React.useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SupabaseProvider({ children }: SidebarProviderProps) {
  // const [isLoading, setLoading] = React.useState(true)
  const [user, setUser] = React.useState(null)
  const [supabase, setSupabase] = React.useState(null)

  // if (isLoading) {
  //   return null
  // }

  return (
    <SupabaseContext.Provider
      value={{ user, supabase }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}
