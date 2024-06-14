'use client'

// import { loadJWT } from '@/lib/loadJWT'
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';

// Define a function to create a Supabase client for client-side operations
export const createClient = (jwt?: string|null) =>
  createBrowserClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {

      },

      global: {
        headers: {
          ... jwt ? {
            Authorization: `Bearer ${jwt}`
          } : {},
        }
      }
    }
  );
