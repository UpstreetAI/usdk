'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IconUser } from '@/components/ui/icons'
import { routes } from '@/routes'
import { redirect } from 'next/navigation'


export interface AccountButtonProps {
  user: any
}

export function AccountButton({user}: AccountButtonProps) {
  return (
    <Link
      className="flex flex-row items-center pr-4 h-full rounded-none text-sm"
      href={routes.account}
    >
      <IconUser className="mr-2 size-5"/>
      <div className="truncate ...">
      {/*<div className="max-w-32 truncate ...">*/}
        {user.name}
      </div>
    </Link>
  )
}
