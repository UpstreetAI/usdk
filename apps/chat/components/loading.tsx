import React from 'react'
import { IconSpinner } from '@/components/ui/icons'


export function Loading() {
  return (
    <div className="flex flex-1 justify-center items-center h-full w-full fixed top-0 left-0 z-100">
      <IconSpinner className="h-[50px] w-[50px]"/>
    </div>
  )
}
