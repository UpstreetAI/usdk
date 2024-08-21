'use server'

import { AccountButton } from '@/components/account-button'
import { getUserForJwt } from '@/utils/supabase/supabase-client'
import * as React from 'react'
import { HeaderLoginButton } from '@/components/header-login-button'
import { getJWT } from '@/utils/supabase/server'
import { SearchBar } from './searchbar'


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
          <SearchBar/>
          <AccountButton user={user}/>
        </>
      ) : (
        <>
          <SearchBar disabled />
          <HeaderLoginButton />
        </>
      )}
    </>
  )
}
