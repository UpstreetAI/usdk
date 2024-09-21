'use server'

import { AccountButton } from '@/components/account-button'
import { getUserForJwt } from '@/utils/supabase/supabase-client'
import * as React from 'react'
import { LoginButton } from '@/components/login-button'
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
          <AccountButton user={user}/>
        </>
      ) : (
        <>
          <LoginButton className='mr-4' text={"Login"} />
        </>
      )}
    </>
  );
}
