'use client';
import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { useActions } from '@/components/ui/actions'
import { createClient } from '@/utils/supabase/client';
import { buttonVariants } from '@/components/ui/button'

import {
  IconClose,
  IconSearch,
  IconPlus,
} from '@/components/ui/icons'

import { lembed } from '@/utils/ai/embedding';

function resolveUrl(url: string) {
  return new URL(url, `https://nota.upstreet.ai`) + '';
}

async function search(query: string, opts: { signal: AbortSignal; }) {
  // console.log('search', query, opts);
  const { signal } = opts;

  const supabase = createClient();
  const embedding = await lembed(query, {
    signal,
  });
  const result = await supabase.rpc('match_assets', {
    embedding,
    match_threshold: 0.2,
    match_count: 10,
  });
  const { error, data } = result;
  if (!error) {
    return data;
  } else {
    throw new Error(JSON.stringify(error));
  }
}

type AgentObject = {
  id: string;
  name: string;
  description: string;
  preview_url: string;
};

export function SearchBar() {
  const [value, setValue] = React.useState('');
  const [focus, setFocus] = React.useState(false);
  const [results, setResults] = React.useState<AgentObject[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { isSearchOpen, toggleSearch } = useActions();

  // focus search
  React.useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus()
    }
  }, [isSearchOpen])

  // updates
  React.useEffect(() => {
    if (value) {
      const abortController = new AbortController();
      const { signal } = abortController;

      (async () => {
        try {
          const agents = await search(value, {
            signal,
          });
          setResults(agents);
        } catch (err) {
          console.warn(err);
        }
      })();

      return () => {
        abortController.abort('cancelled');
      };
    } else {
      setResults([]);
    }
  }, [value])

  return (
    <div className={cn("absolute hidden md:flex flex-col inset-0 pointer-events-none", isSearchOpen && 'block')} onFocus={e => {
      setFocus(true);
    }} onBlur={e => {
      setFocus(false);
    }} tabIndex={-1}>
      <div className="relative flex flex-col m-auto size-full px-4 py-2 sm:max-w-2xl sm:px-4 pointer-events-auto">
        <div className={cn("absolute px-8 items-center inset-y-0 right-0 flex md:hidden")} onClick={e => {
          toggleSearch();
        }}>
          <IconClose />
        </div>
        <input type="text" className={cn("size-full rounded-lg px-2")} value={value} placeholder="Find something..." onChange={e => {
          setValue(e.target.value);
        }} ref={inputRef} />
        <div className={cn("absolute left-0 top-16 px-4 w-full sm:max-w-2xl", !focus && 'hidden')}>
          <div className="rounded-lg border bg-zinc-900">
            {results.map((agent, i) => (
              <div className="flex p-4" key={i}>
                <Image src={resolveUrl(agent.preview_url)} className="size-[100px]" width={100} height={100} alt="Avatar" />
                <div className="flex flex-col flex-1">
                  <div className="text-lg font-bold">{agent.name}</div>
                  <div className="text-base">{agent.description}</div>
                  <div className="text-sm text-zinc-600">{agent.id}</div>
                </div>
                <div className="flex flex-col">
                  <Link href="#" className={cn(buttonVariants({ variant: 'outline' }))} onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log('join agent', agent.id);
                  }}>
                    <IconPlus />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
