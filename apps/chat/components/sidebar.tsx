'use client'

// import type { User } from '@supabase/supabase-js'
import { useSupabase } from '@/lib/hooks/use-supabase'
// import { useEffect, useState } from 'react'
import * as React from 'react'

import { LogoutButton } from '@/components/logout-button'
import { useSidebar } from '@/lib/client/hooks/use-sidebar'
import { cn } from '@/lib/utils'


export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ className, children }: SidebarProps) {
  const { isSidebarOpen, isLoading } = useSidebar();
  // const [ user, setUser ] = useState<User|null>(null);

  const { user } = useSupabase();
  // let isGettingUser = false
  // useEffect( () => {
  //   if (!isGettingUser) {
  //     isGettingUser = true;
  //     getUser()
  //       .then( user => {
  //         if ( user ) setUser( user )
  //       })
  //       .catch(console.error);
  //   }
  // }, [])

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
