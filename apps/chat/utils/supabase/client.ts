'use client'

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';
import cookie from 'cookie'


// Define a function to create a Supabase client for client-side operations
export const createClient = (jwt?: string|null) => {
  const _jwt = jwt || getJWT()

  return createBrowserClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {},

      global: {
        headers: {
          ..._jwt ? {
            Authorization: `Bearer ${_jwt}`
          } : {},
        }
      }
    }
  );
}


export async function getUser(jwt?: string|null) {
  return jwt
    ? ( await createClient().auth.getUser(jwt))?.data?.user
    : ( await createClient().auth.getUser())?.data?.user
}


function getJWT() {
  return cookie.parse(document.cookie)['auth-jwt']
}
