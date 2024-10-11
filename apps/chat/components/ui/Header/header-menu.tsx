'use client'

import { usePathname } from 'next/navigation';
import * as React from 'react'
import { IconButton } from 'ucom';


export function HeaderMenu() {
  const pathname = usePathname();

  return (
    <div className='flex gap-4 ml-6'>
      <IconButton href="/agents" icon="Users" label="Agents" active={pathname.startsWith('/agents')} />
      {/* <IconButton href="/rooms" icon="Room" label="Rooms" /> */}
      <IconButton href="/accounts" icon="Head" label="Users" active={pathname.startsWith('/accounts')} />
    </div>
  );
}
