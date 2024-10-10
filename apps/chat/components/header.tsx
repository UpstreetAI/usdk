import * as React from 'react';
import Link from 'next/link';

import { IconUpstreet, IconUpstreetChat } from '@/components/ui/icons';
import { AccountOrLogin } from '@/components/account-or-login';
import { SearchBar } from '@/components/searchbar';
import { IconButton } from 'ucom';


export function Header() {
  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between h-16 border-b shrink-0 bg-background backdrop-blur-xl">
      <div className="flex items-center h-full">
        <div className='md:m-w-[160px] md:w-[160px] pr-4 md:pr-0'>
          <a href="/" rel="nofollow" className='hidden md:block w-44 ml-4'>
            <IconUpstreetChat className="mr-2 fill-black size-9 w-auto dark:hidden" inverted />
            <IconUpstreetChat className="hidden mr-2 fill-white size-9 w-auto dark:block" />
          </a>
          <a href="/" rel="nofollow" className='block md:hidden w-10 ml-4'>
            <IconUpstreet className="mr-2 fill-black size-9 w-auto dark:hidden" inverted />
            <IconUpstreet className="hidden mr-2 fill-white size-9 w-auto dark:block" />
          </a>
        </div>
        <div className='flex gap-4'>
          <IconButton href="/agents" icon="Users" />
          {/* <IconButton href="/rooms" icon="Room" /> */}
          <IconButton href="/accounts" icon="Head" />
        </div>
      </div>
      {/* <div className='md:m-w-[250px] md:w-[250px]'> */}
      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <AccountOrLogin />
      </React.Suspense>
      {/* </div> */}
    </header>
  );
}
