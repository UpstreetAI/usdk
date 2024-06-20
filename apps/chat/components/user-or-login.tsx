'use server'

import * as React from 'react'
// import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat/chat-history'
import { HeaderLoginButton } from '@/components/header-login-button'
import { SidebarMobile } from '@/components/sidebar-mobile'
import { SidebarToggle } from '@/components/sidebar-toggle'
// import { Session } from '@/lib/types'
import { getJWT, getUser } from '@/utils/supabase/server'


export async function UserOrLogin() {
  const user = await (async () => {
    const jwt = getJWT();
    if (jwt) {
      const user = await getUser(jwt);
      return user;
    } else {
      return null;
    }
  })();

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
