'use client';

import * as React from 'react';
import { AccountOrLogin } from './account-or-login';
import { HeaderMenu } from './header-menu';
import { usePathname } from 'next/navigation';

export interface HeaderNavigationProps {
  user: any
  credits: number
}

export function HeaderNavigation({ user, credits }: HeaderNavigationProps) {

  const pathname = usePathname();
  // HIDE NAVIGATION WHEN USER IS ON FOLLOWING PAGES
  if(pathname.startsWith('/new') || pathname.startsWith('/rooms/')) return null;

  return (
    <header className="sticky top-0 z-[10] flex items-center justify-between h-12 pt-6 border-b shrink-0 bg-background">
      <HeaderMenu />
      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <AccountOrLogin user={user} credits={credits} />
      </React.Suspense>
    </header>
  )
}
