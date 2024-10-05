'use client';

import * as React from 'react';
import {
  cn,
  getAgentEndpointUrl,
  getAgentUrl,
  isValidUrl,
} from '@/lib/utils';

import Icon from '../ui/icon';
import Image from 'next/image';
import { Input } from '../ui/input';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';

export function ChatMembers() {
  const [showRoomLinkTooltip, setShowRoomLinkTooltip] = React.useState(false)

  const { localPlayerSpec, playersMap, getCrdtDoc, agentLeave, room } = useMultiplayerActions()

  const crdt = getCrdtDoc()

  const roomName = crdt?.getText('name').toString()
  const roomDescription = crdt?.getText('description').toString()

  const roomLink = typeof window !== 'undefined' ? window.location.href : '';
  
  const players = Array.from(playersMap.values()).sort((a, b) => {
    return a.getPlayerSpec().name.localeCompare(b.getPlayerSpec().name)
  })

  const [memberSearchQuery, setMemberSearchQuery] = React.useState('')

  const filteredPlayers = players.filter(
    player =>
      player
        .getPlayerSpec()
        .name.toLocaleLowerCase()
        .includes(memberSearchQuery.toLocaleLowerCase()) ||
      memberSearchQuery
        .toLocaleLowerCase()
        .includes(player.getPlayerSpec().name.toLocaleLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-fit px-2">
        <Input
          name="search-names"
          placeholder={'Search for members...'}
          value={memberSearchQuery}
          onChange={e => setMemberSearchQuery(e.target.value)}
          type="search"
        />
      </div>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h4 className="select-none opacity-70 text-xs font-medium">
          Members ({players.length})
        </h4>
      </div>
      {filteredPlayers.length ? (
        filteredPlayers.map(player => {
          const playerSpec = player.getPlayerSpec();
          const id = playerSpec.id;
          const name = playerSpec.name;
          const agentUrl = getAgentUrl(playerSpec);
          const {previewUrl} = playerSpec;
          return (
            <div className="mb-1 px-2" key={player.playerId}>
              <Link
                href={agentUrl}
                target="_blank"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'flex w-full justify-start bg-zinc-50 px-2 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
                )}
              >
                {previewUrl && isValidUrl(previewUrl) ? (
                    <Image className="w-6 h-6 aspect-square rounded-full mr-2" width={128} height={128} src={previewUrl} alt='Profile picture' />
                  ) : (
                    <div className='uppercase text-sm font-bold rounded-full bg-muted mr-2 aspect-square h-6 w-6 text-center flex items-center justify-center'>{name.charAt(0)}</div>
                  )}
                <div className="flex-1 text-ellipsis overflow-hidden">
                  {name}
                </div>
                {localPlayerSpec.id !== id && (
                  <div
                    className="rounded p-1 hover:bg-zinc-600"
                    onClick={async e => {
                      e.preventDefault()
                      e.stopPropagation()

                      const agentEndpointUrl = getAgentEndpointUrl(playerSpec.id)
                      const leaveUrl = `${agentEndpointUrl}leave`
                      const res = await fetch(leaveUrl, {
                        method: 'POST'
                      })
                      if (res.ok) {
                        const text = await res.text()
                      }
                      await agentLeave(playerSpec.id, room);
                    }}
                  >
                    <Icon name="close" className="stroke-2" />
                  </div>
                )}
              </Link>
            </div>
          );
        })
      ) : (
        <span className="px-4 py-2 text-center opacity-70">No results.</span>
      )}
    </div>
  );
}
