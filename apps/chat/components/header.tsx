import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconUpstreetChat,
  IconSearch,
  IconUser,
  IconVercel
} from '@/components/ui/icons'
import { UserMenu } from '@/components/user-menu'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { SearchBar } from './searchbar'
import { SearchToggle } from './searchtoggle'
import { ChatHistory } from './chat-history'
import { Session } from '@/lib/types'

async function UserOrLogin() {
  const session = (await auth()) as Session
  return (
    <>
      {session?.user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={session.user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <Link href="/new" rel="nofollow">
          <IconUpstreetChat className="mr-2 fill-black size-9 w-auto dark:hidden" inverted/>
          <IconUpstreetChat className="hidden mr-2 fill-white size-9 w-auto dark:block" />
        </Link>
      )}
    </>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
          <UserOrLogin />
        </React.Suspense>
      </div>
      <SearchBar />
      <div className="flex items-center justify-end space-x-2">
        <SearchToggle />
        <Link href="/login" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline' }))}>
          <IconUser />
          <span className="hidden ml-2 md:flex">Login</span>
        </Link>
      </div>
    </header>
  )
}
