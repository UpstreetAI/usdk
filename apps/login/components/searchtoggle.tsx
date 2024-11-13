'use client';
import * as React from 'react'
// import {useState} from 'react'
import Link from 'next/link'

import { useActions } from '@/components/ui/actions'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconUpstreetChat,
  IconSearch,
  IconUser,
  IconVercel
} from '@/components/ui/icons'

export function SearchToggle() {
  const { toggleSearch } = useActions()
  return (
    <Link href="#" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline' }), 'md:hidden')} onClick={e => {
      toggleSearch()
    }}>
      <IconSearch />
    </Link>
  )
}