'use client'

import { getUser } from '@/utils/auth-helpers/getUser'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import * as React from 'react'

import { LogoutButton } from '@/components/logout-button'
import { useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'


const _getUser = async () => {
  const client = createClient()
  return getUser(client);
}


export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ className, children }: SidebarProps) {
  const { isSidebarOpen, isLoading } = useSidebar()
  const [ user, setUser ] = useState()

  let isGettingUser = false

  useEffect( () => {
    if (!isGettingUser) {
      isGettingUser = true;
      _getUser()
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
