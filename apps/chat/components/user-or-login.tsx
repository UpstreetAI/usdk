import { loadJWT } from '@/lib/loadJWT'
import * as React from 'react'
import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'
import { HeaderLoginButton } from '@/components/header-login-button'
import { SidebarMobile } from '@/components/sidebar-mobile'
import { SidebarToggle } from '@/components/sidebar-toggle'
import { Session } from '@/lib/types'
import { createClient } from '@/utils/supabase/server'


export async function UserOrLogin() {
  const supabase = createClient();
  // console.log( 'SUPABASE USER:', await supabase.auth.getUser(loadJWT()))

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
        <HeaderLoginButton/>
      )}
    </>
  )
}
