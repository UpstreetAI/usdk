'use client';
import * as React from 'react'

import Link from 'next/link'

import { cn, getAgentUrl, getAgentPreviewImageUrl, getAgentEndpointUrl } from '@/lib/utils'
// import { SidebarList } from '@/components/sidebar-list'
import { buttonVariants } from '@/components/ui/button'
import { IconPlus, IconClose } from '@/components/ui/icons'

import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';

// interface ChatHistoryProps {
//   userId?: string
// }

export function ChatHistory() {
  const { localPlayerSpec, playersMap } = useMultiplayerActions();
  const players = Array.from(playersMap.values()).sort((a, b) => {
    return a.getPlayerSpec().name.localeCompare(b.getPlayerSpec().name);
  });
  // console.log('got players', {
  //   localPlayerSpec,
  //   players,
  // });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h4 className="text-sm font-medium">Members</h4>
      </div>
      {players.map((player) => {
        const playerSpec = player.getPlayerSpec();
        const id = playerSpec.id;
        const name = playerSpec.name;
        const agentUrl = getAgentUrl(playerSpec);

        return (<div className="mb-1 px-2" key={player.playerId}>
          <Link
            href={agentUrl}
            target="_blank" // Add target="_blank" to open the link in a new window
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex w-full justify-start bg-zinc-50 px-2 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
            )}
          >
            <div className='flex-1'>{name}</div>
            {localPlayerSpec.id !== id && <div
              className="rounded p-1 hover:bg-zinc-600"
              onClick={async e => {
                e.preventDefault();
                e.stopPropagation();

                const agentEndpointUrl = getAgentEndpointUrl(playerSpec);
                const leaveUrl = `${agentEndpointUrl}leave`;
                console.log('click x', leaveUrl);
                const res = await fetch(leaveUrl, {
                  method: 'POST',
                });
                if (res.ok) {
                  const text = await res.text();
                }
              }}
            >
              <IconClose className="stroke-2" />
            </div>}
          </Link>
        </div>
        );
      })}
      {/* <React.Suspense
        fallback={
          <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        }
      >
        <SidebarList userId={userId} />
      </React.Suspense> */}
    </div>
  )
}
