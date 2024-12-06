'use client'

import { Loading } from '@/components/loading'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { cn } from '@/lib/utils'
import React from 'react'

interface MainProps {
  children: React.ReactNode
}

export function Body({ children }: MainProps) {
  const { isFetchingUser } = useSupabase();

  return (
    <main className={cn("flex flex-col flex-1")}>
      {isFetchingUser ? (
        <Loading />
      ) : (
        React.Children.map(children, child =>
          React.isValidElement(child) ? React.cloneElement(child, { ...child.props, mode: 'mode', wrapperClass: 'wrapperClass' }) : child
        )
      )}
    </main>
  );
}
