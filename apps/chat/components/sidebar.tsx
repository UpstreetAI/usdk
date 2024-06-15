'use client'

import { createClient, getUser } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import * as React from 'react'

import { LogoutButton } from '@/components/logout-button'
import { useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'


export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ className, children }: SidebarProps) {
  const
    { isSidebarOpen, isLoading } = useSidebar(),
    [ user, setUser ] = useState()

  let isGettingUser = false

  useEffect( () => {
    if (!isGettingUser) {
      isGettingUser = true;
      getUser()
        .then( u => setUser( u ))
        .catch(console.error);
    }
  }, [])

  return (
    <div
      data-state={isSidebarOpen && !isLoading ? 'open' : 'closed'}
      className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
    >
      {children}
      {
        user
          ? <LogoutButton />
          : null
      }
    </div>
  )
}
