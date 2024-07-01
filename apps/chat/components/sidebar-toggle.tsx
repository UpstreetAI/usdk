'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/client/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'

export function SidebarToggle() {
  const { toggleLeftSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      className="size-9 p-0 lg:flex"
      onClick={() => {
        toggleLeftSidebar()
      }}
    >
      <IconSidebar className="size-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
