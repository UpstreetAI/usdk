'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { Sidebar } from '@/components/sidebar'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { IconButton } from 'ucom'

interface SidebarMobileProps {
  children: React.ReactNode
}

export function SidebarMobileLeft({ children }: SidebarMobileProps) {
  const { user } = useSupabase();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {user && <IconButton variant='ghost' icon="BurgerMenu" />}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
      >
        <Sidebar position="left" className="flex p-4">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  )
}

export function SidebarMobileRight({ children }: SidebarMobileProps) {
  const { user } = useSupabase();

  return (
    <Sheet>
      <SheetTrigger asChild>
        {user && <IconButton variant='ghost' icon="BurgerMenu" />}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
      >
        <Sidebar position="right" className="flex">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  )
}
