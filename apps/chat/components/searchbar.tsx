'use client';

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { useActions } from '@/components/ui/actions'
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'
// import { createClient } from '@/utils/supabase/client';
// import { makeAnonymousClient } from '@/utils/supabase/supabase-client';
import { getSupabase } from '@/lib/hooks/use-supabase';
import { buttonVariants } from '@/components/ui/button'
// import { useSupabase } from '@/components/ui/providers'
import { isValidUrl } from '@/utils/helpers/urls'

import {
  IconClose,
  // IconSearch,
  IconPlus,
} from '@/components/ui/icons'

// import { lembed } from '@/utils/ai/embedding';
import { lembed } from 'react-agents/util/embedding.mjs';
import { getJWT } from '@/lib/jwt';
// import { getJWT } from '@/lib/jwt';
// import { env } from '@/lib/env';

async function search(query: string, opts: { signal: AbortSignal, jwt: string }) {
  const { signal, jwt } = opts;

  const { supabase } = await getSupabase({
    signal,
  });
  if (supabase) {
    const query_embedding = await lembed(query, {
      signal,
      jwt,
    });
    const rpc = supabase.rpc.bind(supabase) as any;

    const result = await rpc('match_assets', {
      query_embedding,
      match_threshold: 0.2,
      match_count: 10,
    });
    const { error, data } = result;
    if (!error) {
      return data;
    } else {
      throw new Error(JSON.stringify(error));
    }
  } else {
    return [];
  }
}

//

type AgentObject = {
  id: string;
  name: string;
  description: string;
  preview_url: string;
};

function AgentLink(props: any) {
  const { id } = props;
  return (
    <Link href={`/agents/${id}`} onMouseDown={e => {
      e.preventDefault();
      e.stopPropagation();

      // open the link in the current window
      location.href = e.currentTarget.href;
    }} {...props} />
  )
}

export function SearchBar({ disabled = false }) {
  const [value, setValue] = React.useState('');
  const [focus, setFocus] = React.useState(false);

  const [results, setResults] = React.useState<AgentObject[]>([]);
  const [loadingResults, setLoadingResults] = React.useState<boolean>(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const { isSearchOpen, toggleSearch } = useActions();
  const { agentJoin } = useMultiplayerActions();

  // focus search
  React.useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus()
    }
  }, [isSearchOpen])

  // updates
  React.useEffect(() => {
    if (value) {
      setLoadingResults(true);
      const abortController = new AbortController();
      const { signal } = abortController;

      (async () => {

        const jwt = await getJWT();

        if (!jwt) {
          console.warn('SearchBar | No JWT found');
          setLoadingResults(false);
          return;
        }

        try {
          const agents = await search(value, {
            signal,
            jwt: jwt,
          });
          setResults(agents);
          setLoadingResults(false);
        } catch (err) {
          console.warn(err);
        }
      })();

      return () => {
        abortController.abort('cancelled');
      };
    } else {
      setResults([]);
      setLoadingResults(false);
    }
  }, [value])

  return (
    <div className={cn("flex flex-1 flex-col h-full inset-0 pointer-events-none", isSearchOpen && 'block')} onFocus={e => {
      setFocus(true);
    }} onBlur={e => {
      setFocus(false);
    }} tabIndex={-1}>
      <div className="relative flex flex-col m-auto size-full py-2 sm:max-w-2xl px-4 pointer-events-auto">
        <div className={cn('absolute opacity-0 px-8 items-center inset-y-0 right-0 flex', value && 'opacity-1')} onClick={e => {
          setValue('');
        }}>
          <IconClose />
        </div>
        <input type="text" disabled={disabled} className={cn("size-full rounded-lg px-2")} value={value} placeholder={disabled ? "Login to start searching for agents..." : "Find an agent to..."} onChange={e => {
          setValue(e.target.value);
        }} ref={inputRef} />
        <div className={cn("fixed md:absolute left-0 top-16 px-0 h-[calc(100vh-64px)] md:max-h-[calc(100vh-64px)] md:h-auto md:px-4 w-full sm:max-w-2xl", !focus && 'hidden', !value && 'hidden')}>
          <div className="md:rounded-lg border bg-zinc-900 h-full overflow-y-scroll">
            {loadingResults ? (
              <div className="animate-pulse text-center p-4 text-xl">Searching for agents...</div>
            ) : (
              <>
                {results.length > 0 ? results.map((agent, i) => (
                  <div className={`flex p-4 border-b`} key={i}>
                    <AgentLink name={agent.name} id={agent.id}>
                      <div className="mr-4 size-20 min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">
                        {agent.preview_url && isValidUrl(agent.preview_url) ? (
                          <Image src={agent.preview_url} alt="" className="w-full" width={48} height={48} />
                        ) : (
                          <div className='uppercase text-lg font-bold'>{agent.name.charAt(0)}</div>
                        )}
                      </div>
                    </AgentLink>
                    <div className="flex flex-col flex-1">
                      <AgentLink name={agent.name} id={agent.id} className="text-lg line-clamp-1 font-bold hover:underline">{agent.name}</AgentLink>
                      <div className="text-base line-clamp-2">{agent.description}</div>
                      <div className="hidden md:block text-sm text-zinc-600">{agent.id}</div>
                    </div>
                    <div className="flex flex-col">
                      <Link 
                        href="#" 
                        className={
                          cn(
                            buttonVariants({ variant: 'outline' }), 
                            'block bg-[rgba(0,0,0,0.05)] dark:bg-[rgba(255,255,255,0.05)] size-18 p-6 ml-2'
                          )
                        } 
                        onMouseDown={async e => {
                          e.preventDefault();
                          e.stopPropagation();

                          await agentJoin(agent.id);

                          setFocus(false);
                        }}>
                        <IconPlus className='size-8 opacity-[0.4]' />
                      </Link>
                    </div>
                  </div>
                )) : <div className="text-center p-4 text-xl">Agents not found.</div>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
