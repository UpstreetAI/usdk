'use client'

import { Loading } from '@/components/loading'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import React from 'react'


interface MainProps {
  children: React.ReactNode
}


export function Body( {children}: MainProps) {

  const pathname = usePathname()

  let mode = 'web';

  const getWrapperClass = () => {
    // Wrapper class is used to set a main background for now in different use cases
    if (pathname.startsWith('/embed')) {
      // Embed route styles
      mode = 'embed'
      return 'bg-[url("/images/backgrounds/main-background.jpg")] bg-center bg-cover'
    } else if (pathname.startsWith('/desktop')) {
      // Desktop route styles
      return 'desktop'
    } else {
      // Web route styles
      mode = 'web'
      return 'bg-[url("/images/backgrounds/main-background.jpg")] bg-center bg-cover'
    }
  }
  const {isFetchingUser} = useSupabase();

  return (
    <main className={cn("flex flex-col flex-1", getWrapperClass())}>
      {isFetchingUser ? (
        <Loading mode={mode} />
      ) : children}
    </main>
  )
}
