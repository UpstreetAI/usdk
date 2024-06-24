'use client';

import Link from 'next/link';
import { IconLogout, IconUser } from '@/components/ui/icons';
import { routes } from '@/routes';
import { logout } from '@/lib/logout';


export interface AccountButtonProps {
  user: any
}
export function AccountButton({ user }: AccountButtonProps) {
  return (
    <div className='flex'>
      <Link
        className="flex flex-row items-right pr-4 h-full rounded-none text-sm"
        href={routes.account}
      >
        <IconUser className="mr-2 size-5" />
        <div className="hidden md:block max-w-16 truncate ...">
          {/*<div className="max-w-32 truncate ...">*/}
          {user.name}
        </div>
      </Link>
      <a
        className="flex flex-row items-right pr-4 h-full rounded-none text-sm"
        onClick={() => logout()}
      >
        <IconLogout className="mr-2 size-5" />
        <div className="hidden md:block">
          Logout
        </div>
      </a>
    </div>
  )
}
