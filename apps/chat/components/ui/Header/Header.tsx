import * as React from 'react';

import { getUserForJwt } from '@/utils/supabase/supabase-client'
import { getCredits, getJWT } from '@/utils/supabase/server';
import { HeaderNavigation } from './header-navigation';


export async function Header() {
  const user = await (async () => {
    const jwt = getJWT();
    if (jwt) {
      return getUserForJwt(jwt);
    } else {
      return null;
    }
  })();
  
  // const credits = await getCredits(user.id);
  const credits = 0;

  return (
    <HeaderNavigation user={user} credits={credits} />
  );
}
