'use client';

import Link from 'next/link';
import { routes } from '@/routes';
import { IconPlus } from '@/components/ui/icons';
import Dev from '../../development';
import { isValidUrl } from '@/lib/utils';
import { Icon, IconButton } from 'ucom';
import { logout } from '@/lib/logout';
import { Credits } from '@/components/credits';

export interface AccountButtonProps {
  user: any
  credits: number
}
export function AccountButton({ user, credits }: AccountButtonProps) {
  return (
    <div className='flex mr-2 md:mr-4 h-12 -mt-6'>

      <Dev>
        <div className='mt-1 mr-2'>
          <IconButton href="/new" icon="Plus" variant='ghost' />
        </div>
      </Dev>

      <Credits user={user} />

      <a
        className="flex flex-row items-right p-2 h-full rounded text-sm cursor-pointer"
        href={routes.account}
      >
        <div className="-mt-1 size-10 min-w-10 md:size-[52px] md:-mt-2 md:min-w-[52px] bg-gray-100 p-1 overflow-hidden flex items-center justify-center border-2 border-gray-900">
          <div
            className="w-full h-full bg-cover bg-top"
            style={{
              backgroundImage: isValidUrl(user.preview_url) ? `url(${user.preview_url})` : 'none',
              backgroundColor: isValidUrl(user.preview_url) ? 'transparent' : '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            {!isValidUrl(user.preview_url) && user.name.charAt(0)}
          </div>
        </div>

        <div className="hidden md:flex items-center max-w-16">
          <div className='bg-gray-100 text-black px-2 py-1 pr-6 font-bold'>
            {user.name}
          </div>
        </div>
      </a>
      
      <IconButton onClick={logout} icon="Logout" variant='ghost' size='small' />

    </div>
  )
}
