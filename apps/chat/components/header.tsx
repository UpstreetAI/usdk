import { ChatHistory } from '@/components/chat/chat-history'
import { SidebarMobile } from '@/components/sidebar-mobile'
import * as React from 'react'
import Link from 'next/link'

import { IconUpstreet, IconUpstreetChat } from '@/components/ui/icons'
import { AccountOrLogin } from '@/components/account-or-login'
import { SearchBar } from '@/components/searchbar'



export function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between h-16 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center h-full">
        <SidebarMobile>
          <ChatHistory />
        </SidebarMobile>
        <div className='m-w-12'>
        <Link href="/" rel="nofollow" className='hidden md:block w-44 ml-4'>
          <IconUpstreetChat className="mr-2 fill-black size-9 w-auto dark:hidden" inverted/>
          <IconUpstreetChat className="hidden mr-2 fill-white size-9 w-auto dark:block"/>
        </Link>
        <Link href="/" rel="nofollow" className='block md:hidden w-10'>
          <IconUpstreet className="mr-2 fill-black size-9 w-auto dark:hidden" inverted/>
          <IconUpstreet className="hidden mr-2 fill-white size-9 w-auto dark:block"/>
        </Link>
        </div>
      </div>
      <SearchBar/>
      <React.Suspense fallback={<div className="flex-1 overflow-auto"/>}>
        <AccountOrLogin/>
      </React.Suspense>
    </header>
  )
}
