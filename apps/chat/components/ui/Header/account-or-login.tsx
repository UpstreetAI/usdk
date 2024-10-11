'use server'

import { AccountButton } from '@/components/ui/Header/account-button'
import * as React from 'react'
import { LoginButton } from '@/components/ui/Header/login-button'


export async function AccountOrLogin({user}: any) {

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
