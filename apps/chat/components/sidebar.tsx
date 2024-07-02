'use client';

import * as React from 'react';
import { useSidebar } from '@/lib/client/hooks/use-sidebar';
import { cn } from '@/lib/utils';


export interface SidebarProps extends React.ComponentProps<'div'> { position: string }

export function Sidebar({ className, position, children }: SidebarProps) {
  const { isLeftSidebarOpen, isRightSidebarOpen } = useSidebar();

  return position === 'left' ? (
    <div
      data-state={isLeftSidebarOpen ? 'open' : 'closed'}
      className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
    >
      {children}
    </div>
  ) : (
    <div
      data-state={isRightSidebarOpen ? 'open' : 'closed'}
      className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
    >
      {children}
    </div>
  );
}
