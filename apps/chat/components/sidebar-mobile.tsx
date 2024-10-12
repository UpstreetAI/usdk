'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

import { Sidebar } from '@/components/sidebar'
import { Button } from '@/components/ui/button'

import { IconMenu, IconSidebar, IconUsers } from '@/components/ui/icons'
import { useSupabase } from '@/lib/hooks/use-supabase'
import { useSidebar } from '@/lib/client/hooks/use-sidebar'

interface SidebarMobileProps {
  children: React.ReactNode
}

export function SidebarMobileLeft({ children }: SidebarMobileProps) {
  const { user } = useSupabase();

  const { isLeftSidebarOpenMobile } = useSidebar()

  return (
    <Sheet open={isLeftSidebarOpenMobile}>
      <SheetTrigger asChild>
        {user && <Button
              variant="outline"
              size="icon"
              className={`absolute left-0 md:left-4 top-[14px] size-8 rounded-full p-0`}
            > 
              <IconUsers />
              <span className="sr-only">Show Members</span>
            </Button>}
      </SheetTrigger>
      <SheetContent
        side="left"
        className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
      >
        <Sidebar position="left" className="flex">{children}</Sidebar>
      </SheetContent>
    </Sheet>
  )
}

export function SidebarMobileRight({ children }: SidebarMobileProps) {
  const { user } = useSupabase();

  const { isRightSidebarOpenMobile } = useSidebar()

  return (
    <Sheet open={isRightSidebarOpenMobile}>
      <SheetTrigger asChild>
        {user && <Button
              variant="outline"
              size="icon"
              className={`absolute right-0 md:right-4 top-[14px] size-8 rounded-full p-0`}
            > 
              <IconUsers />
              <span className="sr-only">Show Scene</span>
            </Button>}
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
