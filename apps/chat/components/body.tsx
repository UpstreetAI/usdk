'use client'

import { Loading } from '@/components/loading'
import { useSupabase } from '@/lib/hooks/use-supabase'
import React from 'react'


interface MainProps {
  children: React.ReactNode
}


export function Body( {children}: MainProps) {
  const {isFetchingUser} = useSupabase();

  return (
    <main className="flex flex-col flex-1 bg-muted/50">
      {isFetchingUser ? (
        <Loading />
      ) : children}
    </main>
  )
}
