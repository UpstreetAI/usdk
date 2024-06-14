'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'
import { CacheProvider } from '@rest-hooks/react';
import { SidebarProvider } from '@/lib/hooks/use-sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionsProvider } from '@/components/ui/actions'


export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <SidebarProvider>
        <TooltipProvider>
          <ActionsProvider>
            <CacheProvider>
            {children}
            </CacheProvider>
          </ActionsProvider>
        </TooltipProvider>
      </SidebarProvider>
    </NextThemesProvider>
  )
}
