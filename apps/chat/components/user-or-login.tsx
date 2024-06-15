import * as React from 'react'
import { cookies } from 'next/headers'
// import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'
import { HeaderLoginButton } from '@/components/header-login-button'
import { SidebarMobile } from '@/components/sidebar-mobile'
import { SidebarToggle } from '@/components/sidebar-toggle'
// import { Session } from '@/lib/types'
import { createClient } from '@/utils/supabase/server'


export async function UserOrLogin() {
  // const session = (await auth()) as Session
  const
    client = createClient(),
    user = await client.auth.getUser();

  return (
    <>
      {user ? (
        <>
          <SidebarMobile>
            <ChatHistory userId={user.id} />
          </SidebarMobile>
          <SidebarToggle />
        </>
      ) : (
        <HeaderLoginButton/>
      )}
    </>
  )
}
