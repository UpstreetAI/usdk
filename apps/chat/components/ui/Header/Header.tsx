import * as React from 'react';

import { getUserForJwt } from '@/utils/supabase/supabase-client'
import { getJWT } from '@/utils/supabase/server';
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

  return (
    <HeaderNavigation user={user} />
  );
}
