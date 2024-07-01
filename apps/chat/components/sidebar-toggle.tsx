'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/client/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { IconCaretLeft, IconCaretRight, IconSidebar } from '@/components/ui/icons'

export function LeftSidebarToggle() {
  const { toggleLeftSidebar, isLeftSidebarOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      className={`opacity-[0.6] hover:opacity-[1] absolute top-1/2 ${isLeftSidebarOpen ? "lg:left-[250px] xl:left-[300px]" : "left-0"} transform -translate-y-1/2`}
      onClick={() => {
        toggleLeftSidebar();
      }}
    > 
      {isLeftSidebarOpen ? <IconCaretLeft className="size-4" /> : <IconCaretRight className="size-4" /> }
      <span className="sr-only">Toggle Members</span>
    </Button>
  )
}

export function RightSidebarToggle() {
  const { toggleRightSidebar, isRightSidebarOpen } = useSidebar();

  return (
    <Button
      variant="ghost"
      className={`opacity-[0.6] hover:opacity-[1] absolute top-1/2 ${isRightSidebarOpen ? "lg:right-[250px] xl:right-[300px]" : "right-0"} transform -translate-y-1/2`}
      onClick={() => {
        toggleRightSidebar();
      }}
    >
      {isRightSidebarOpen ? <IconCaretRight className="size-4" /> : <IconCaretLeft className="size-4" /> }
      <span className="sr-only">Toggle Rooms</span>
    </Button>
  )
}
