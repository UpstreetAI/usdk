import * as React from 'react';

import { IconUpstreet, IconUpstreetChatStroke } from '@/components/ui/icons';
import { AccountOrLogin } from '@/components/ui/Header/account-or-login';
import { getUserForJwt } from '@/utils/supabase/supabase-client'
import { getCredits, getJWT } from '@/utils/supabase/server'
import { HeaderMenu } from './header-menu';


export async function Header() {

  const user = await (async () => {
    const jwt = getJWT();
    if (jwt) {
      return getUserForJwt(jwt);
    } else {
      return null;
    }
  })();

  const credits = await getCredits(user.id);

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
            <IconUpstreet className="mr-2 fill-black size-12 w-auto dark:hidden" inverted />
            <IconUpstreet className="hidden mr-2 fill-white size-12 w-auto dark:block" />
          </a>
        </div>
        <HeaderMenu />
      </div>
      {/* <div className='md:m-w-[250px] md:w-[250px]'> */}
      <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        <AccountOrLogin user={user} credits={credits} />
      </React.Suspense>
      {/* </div> */}
    </header>
  );
}
