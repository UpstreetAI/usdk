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
    <main
      className="flex flex-col flex-1"
      style={{
      backgroundImage: 'url(/images/backgrounds/main-background.jpg)',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      }}
    >
      {isFetchingUser ? (
      <Loading />
      ) : children}
    </main>
  )
}
