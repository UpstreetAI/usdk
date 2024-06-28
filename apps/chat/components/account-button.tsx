import Link from 'next/link';
import { IconUser } from '@/components/ui/icons';
import { routes } from '@/routes';
import { LogoutButton } from './logout-button';


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
          {user.name}
        </div>
      </Link>
      <LogoutButton />
    </div>
  )
}
