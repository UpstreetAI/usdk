'use client'

// import { loadJWT } from '@/lib/loadJWT'
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';


function getCookie(key: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${key}=`))
    ?.split("=")[1];
}


// Define a function to create a Supabase client for client-side operations
export const createClient = (jwt?: string|null) => {
  const _jwt = jwt || getCookie('auth-jwt')

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
