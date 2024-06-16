import * as React from 'react'
// import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat/chat-history'
import { HeaderLoginButton } from '@/components/header-login-button'
import { SidebarMobile } from '@/components/sidebar-mobile'
import { SidebarToggle } from '@/components/sidebar-toggle'
// import { Session } from '@/lib/types'
import { getUser } from '@/utils/supabase/server'


export async function UserOrLogin() {
  const user = await getUser();

  return (
    <>
      {user ? (
        <>
          <SidebarMobile>
            <ChatHistory />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <HeaderLoginButton/>
      )}
    </>
  )
}
