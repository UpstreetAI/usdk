'use client'

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { IconUpstreetStroke, IconUpstreetChatStroke } from '@/components/ui/icons';
import { IconButton } from 'ucom';


export function HeaderMenu() {
  const pathname = usePathname();

  return (
    <div className="flex items-center h-full -mt-6 md:mt-0">
      <div className='md:m-w-[160px] md:w-[160px] pr-4 md:pr-0'>
        <a href="/" rel="nofollow" className='hidden md:block w-44 ml-4'>
          <IconUpstreetChatStroke className="mr-2 fill-black size-12 w-auto dark:hidden" inverted />
          <IconUpstreetChatStroke className="hidden mr-2 fill-white size-12 w-auto dark:block" />
        </a>
        <a href="/" rel="nofollow" className='block md:hidden w-6 ml-4'>
          <IconUpstreetStroke className="mr-2 fill-black size-8 w-auto dark:hidden" inverted />
          <IconUpstreetStroke className="hidden mr-2 fill-white size-8 w-auto dark:block" />
        </a>
      </div>
      <div className='hidden md:flex gap-4 ml-6'>
        <IconButton href="/agents" icon="Users" label="Agents" active={pathname.startsWith('/agents')} />
        {/* <IconButton href="/rooms" icon="Room" label="Rooms" /> */}
        <IconButton href="/accounts" icon="Head" label="Users" active={pathname.startsWith('/accounts')} />
        <IconButton href="https://docs.upstreet.ai/docs/sdk/intro" target="_blank" icon="Sdk" label="SDK" />
      </div>
      <div className='flex md:hidden gap-4 md:ml-6'>
        <IconButton variant='ghost' icon="BurgerMenu" />
      </div>
    </div>
  );
}
