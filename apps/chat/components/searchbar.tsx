'use client';
import * as React from 'react'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import { useActions } from '@/components/ui/actions'
import { createClient } from '@/utils/supabase/client';

import {
  IconClose,
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
  name: string;
  description: string;
  previewUrl: string;
};

export function SearchBar() {
  const [value, setValue] = React.useState('');
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
    <div className={cn("absolute hidden md:flex flex-col inset-0 pointer-events-none", isSearchOpen && 'block')}>
      <div className="relative flex flex-col m-auto size-full px-4 py-2 sm:max-w-2xl sm:px-4 pointer-events-auto">
        <div className={cn("absolute px-8 items-center top-0 right-0 bottom-0 flex md:hidden")} onClick={e => {
          toggleSearch();
        }}>
          <IconClose />
        </div>
        <input type="text" className={cn("size-full rounded-lg px-2")} value={value} placeholder="Find something..." onChange={e => {
          setValue(e.target.value);
        }} ref={inputRef} />
        <div className="absolute left-0 top-16 px-4 w-full sm:max-w-2xl">
          <div className="rounded-lg border bg-zinc-900">
            {results.map((agent, i) => (
              <div className="flex p-4" key={i}>
                {/* {JSON.stringify(agent)} */}
                <Image src={resolveUrl(agent.preview_url)} width={100} height={100} alt="Avatar" />
                <div className="flex flex-col">
                  <div className="text-lg font-bold">{agent.name}</div>
                  <div className="text-base">{agent.description}</div>
                  <div className="text-sm text-zinc-600">{agent.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
