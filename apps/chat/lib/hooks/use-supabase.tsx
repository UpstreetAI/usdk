'use client'

import * as React from 'react'
import { getJWT } from '@/lib/jwt'
import { env } from '@/lib/env'
import { makeAnonymousClient, getUserForJwt } from '@/utils/supabase/supabase-client'


export interface User {
  id: string;
  name: string;
  ftu: boolean;
  gender: number;
  preview_url: string;
  playerSpec: object;
}

interface SupabaseContext {
  user: User | null;
  supabase: any | null;
  isFetchingUser: boolean;
}

const SupabaseContext = React.createContext<SupabaseContext | undefined>(
  undefined
)

export function useSupabase() {
  const context = React.useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

// implement Promise.withResolvers as a polyfill:
const promiseWithResolvers = <T,>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
};
const globalSupabasePromiseWithResolvers = promiseWithResolvers<SupabaseContext>();
const setGlobalValue = (o: SupabaseContext) => {
  globalSupabasePromiseWithResolvers.resolve(o);
};
// await with a signal; Promise.race but if the signal aborts first then return the default and clean up the listener
const awaitWithAbort = async (p: Promise<any>, signal: AbortSignal | null, defaultValue: any) => {
  if (signal) {
    let cleanup = () => {};
    const result = await Promise.race([p, new Promise((resolve, reject) => {
      const abort = () => {
        resolve(defaultValue);
      };
      signal.addEventListener('abort', abort);
      cleanup = () => {
        signal.removeEventListener('abort', abort);
      };
    })]);
    cleanup();
    return result;
  } else {
    return await p;
  }
};
export const getSupabase = async ({
  signal = null,
}: {
  signal?: AbortSignal | null;
} = {}) => {
  return await awaitWithAbort(globalSupabasePromiseWithResolvers.promise, signal, {
    user: null,
    supabase: null,
  });
}

export function SupabaseProvider({ children }: SidebarProviderProps) {
  // const [user, setUser] = React.useState(null)
  // const [supabase, setSupabase] = React.useState(null)
  const [value, setValue] = React.useState<SupabaseContext>({
    user: null,
    supabase: null,
    isFetchingUser: true,
  });

  React.useEffect(() => {
    let live = true;
    (async () => {
      const jwt = await getJWT();
      if (!live) return;
      const supabase = makeAnonymousClient(env, jwt);
      if (jwt) {
        const user = await getUserForJwt(jwt);
        if (!live) return;
        const o = {
          isFetchingUser: false,
          user,
          supabase,
        };
        setValue(o);
        setGlobalValue(o);
      } else {
        // not logged in
        const o = {
          isFetchingUser: false,
          user: null,
          supabase: supabase,
        };
        setValue(o);
        setGlobalValue(o);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <SupabaseContext.Provider
      value={value}
    >
      {children}
    </SupabaseContext.Provider>
  )
}
