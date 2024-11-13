import React from 'react'
import { IconSpinner } from '@/components/ui/icons'


export function Loading() {
  return (
    <div className="flex flex-1 justify-center items-center">
      <IconSpinner className="h-[50px] w-[50px]"/>
    </div>
  )
}
