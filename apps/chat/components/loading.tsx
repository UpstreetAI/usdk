import React from 'react'
import { IconSpinner } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export function Loading({mode}: {mode: string}) {
  return mode && (
    <div className="flex items-center justify-center h-screen">
      <IconSpinner className="h-[50px] w-[50px]" />
    </div>
  )
}
