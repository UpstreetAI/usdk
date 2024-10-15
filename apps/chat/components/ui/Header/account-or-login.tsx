'use client'

import * as React from 'react'
import { LoginButton } from '@/components/ui/Header/login-button'
import { AccountButton } from '@/components/ui/Header/account-button'

export function AccountOrLogin({user, credits = 0}: any) {
  return (
    <>
      {user ? (
        <AccountButton user={user} credits={credits} />
      ) : (
        <LoginButton className='mr-4' text={"Login"} />
      )}
    </>
  );
}
