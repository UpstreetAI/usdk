'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'

import { IconMenu, IconSidebar } from '@/components/ui/icons'
import { useSupabase } from '@/lib/hooks/use-supabase'

interface SidebarMobileProps {
  children: React.ReactNode
}

export function SidebarMobile({ children }: SidebarMobileProps) {
  const { user } = useSupabase()

  return (
    <Sheet>
      <SheetTrigger asChild>
        {user && <Button variant="ghost" className="aspect-square flex h-full p-0 rounded-none">
          <IconMenu className="size-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
      >
        <Sidebar className="flex">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  )
}
