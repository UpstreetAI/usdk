'use client';

import Link from 'next/link';
import { IconLogout, IconUser } from '@/components/ui/icons';
import { routes } from '@/routes';
import { logout } from '@/lib/logout';
import { IconPlus } from '@/components/ui/icons';

export interface AccountButtonProps {
  user: any
}
export function AccountButton({ user }: AccountButtonProps) {
  return (
    <div className='flex mr-4'>
      <Link
        className="flex flex-row items-right p-2 h-full rounded text-sm cursor-pointer hover:bg-primary/10"
        href={routes.new}
      >
        <IconPlus className="size-5" />
      </Link>
      <Link
        className="flex flex-row items-right p-2 h-full rounded text-sm cursor-pointer hover:bg-primary/10"
        href={routes.account}
      >
        <IconUser className="mr-2 size-5" />
        <div className="hidden md:block max-w-16 truncate ...">
          {/*<div className="max-w-32 truncate ...">*/}
          {user.name}
        </div>
      </Link>
      <a
        className="flex flex-row items-right p-2 h-full rounded text-sm cursor-pointer hover:bg-primary/10"
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
