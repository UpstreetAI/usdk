'use server'

import { AccountButton } from '@/components/account-button'
import { getUserForJwt } from '@/utils/supabase/supabase-client'
import * as React from 'react'
// import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat/chat-history'
import { HeaderLoginButton } from '@/components/header-login-button'
import { SidebarMobile } from '@/components/sidebar-mobile'
import { SidebarToggle } from '@/components/sidebar-toggle'
// import { Session } from '@/lib/types'
import { getJWT } from '@/utils/supabase/server'

import { logout } from '@/lib/logout'


export async function AccountOrLogin() {
  const user = await (async () => {
    const jwt = getJWT();
    if (jwt) {
      return getUserForJwt(jwt);
    } else {
      return null;
    }
  })();

  return (
    <>
      {user ? (
        <>
          <AccountButton user={user}/>
        </>
      ) : (
        <HeaderLoginButton />
      )}
    </>
  )
}
