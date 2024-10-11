import * as React from 'react';

import { IconUpstreetChatStroke } from '@/components/ui/icons';
import { AccountOrLogin } from '@/components/ui/Header/account-or-login';
import { getUserForJwt } from '@/utils/supabase/supabase-client'
import { getJWT } from '@/utils/supabase/server'
import { IconButton } from 'ucom';


export async function Header() {

  const user = await (async () => {
    const jwt = getJWT();
    if (jwt) {
      return getUserForJwt(jwt);
    } else {
      return null;
    }
  })();

  return (
    <header
      className="sticky top-0 z-[100] flex items-center justify-between h-12 pt-6 border-b shrink-0 bg-background">
      <div className="flex items-center h-full">
        <div className='md:m-w-[160px] md:w-[160px] pr-4 md:pr-0'>
          <a href="/" rel="nofollow" className='hidden md:block w-44 ml-4'>
            <IconUpstreetChatStroke className="mr-2 fill-black size-12 w-auto dark:hidden" inverted />
            <IconUpstreetChatStroke className="hidden mr-2 fill-white size-12 w-auto dark:block" />
          </a>
          <a href="/" rel="nofollow" className='block md:hidden w-10 ml-4'>
            <IconUpstreetChatStroke className="mr-2 fill-black size-12 w-auto dark:hidden" inverted />
            <IconUpstreetChatStroke className="hidden mr-2 fill-white size-12 w-auto dark:block" />
          </a>
        </div>
        <div className='flex gap-4 ml-8'>
          <IconButton href="/agents" icon="Users" label="Agents" />
          {/* <IconButton href="/rooms" icon="Room" label="Rooms" /> */}
          <IconButton href="/accounts" icon="Head" label="Users" />
        </div>
      </div>
      {/* <div className='md:m-w-[250px] md:w-[250px]'> */}
      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <AccountOrLogin user={user} />
      </React.Suspense>
      {/* </div> */}
    </header>
  );
}
