'use client'

import { Loading } from '@/components/loading'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import React, { useMemo } from 'react'

interface MainProps {
  children: React.ReactNode
}

export function Body({ children }: MainProps) {
  const pathname = usePathname();
  const { isFetchingUser } = useSupabase();

  console.log('pathname', pathname);
  console.log('isFetchingUser', isFetchingUser);

  const { mode } = useMemo(() => {
    if (pathname.startsWith('/embed')) {
      return {
        mode: 'embed',
      };
    } else if (pathname.startsWith('/desktop')) {
      return {
        mode: 'desktop',
      };
    } else {
      return {
        mode: 'web',
      };
    }
  }, [pathname]);

  return (
    <main className={cn("flex flex-col flex-1")}>
      {isFetchingUser ? (
        <Loading mode={mode} />
      ) : (
        React.Children.map(children, child =>
          React.isValidElement(child) ? React.cloneElement(child, { ...child.props, mode }) : child
        )
      )}
    </main>
  );
}
