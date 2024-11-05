'use client'

import * as React from 'react'
import { LoginButton } from '@/components/ui/Header/login-button'
import { AccountButton } from '@/components/ui/Header/account-button'

export function AccountOrLogin({user}: any) {
  return (
    <>
      {user ? (
        <AccountButton user={user} />
      ) : (
        <LoginButton className='mr-4 -mt-5'>Sign In</LoginButton>
      )}
    </>
  );
}
