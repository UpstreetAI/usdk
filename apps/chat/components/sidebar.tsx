'use client';

import * as React from 'react';
import { useSidebar } from '@/lib/client/hooks/use-sidebar';
import { cn } from '@/lib/utils';


export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ className, children }: SidebarProps) {
  const { isLeftSidebarOpen } = useSidebar();

  return (
    <div
      data-state={isLeftSidebarOpen ? 'open' : 'closed'}
      className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
    >
      {children}
    </div>
  );
}
