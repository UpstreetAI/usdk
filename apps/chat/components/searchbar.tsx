'use client';
import * as React from 'react'

import { cn } from '@/lib/utils'
import { useActions } from '@/components/ui/actions'

import {
  IconClose,
} from '@/components/ui/icons'

export function SearchBar() {
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { isSearchOpen, toggleSearch } = useActions()

  React.useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus()
    }
  }, [isSearchOpen])

  return (
    <div className={cn("absolute hidden md:flex flex-col inset-0 pointer-events-none", isSearchOpen && 'block')}>
      <div className="relative flex flex-col m-auto size-full px-4 py-2 sm:max-w-2xl sm:px-4 pointer-events-auto">
        <div className={cn("absolute px-8 items-center top-0 right-0 bottom-0 flex md:hidden")} onClick={e => {
          toggleSearch();
        }}>
          <IconClose />
        </div>
        <input type="text" className={cn("size-full px-2")} value={value} placeholder="Find something..." onChange={e => setValue(e.target.value)} ref={inputRef} />
      </div>
    </div>
  );
}
