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
  const { localPlayerSpec, playersMap, getCrdtDoc, agentLeave, room } = useMultiplayerActions()

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
      <div className="w-full h-fit px-4 mb-4">
        <Input
          name="search-names"
          placeholder={'Search for members...'}
          value={memberSearchQuery}
          onChange={e => setMemberSearchQuery(e.target.value)}
          type="search"
        />
      </div>
      {filteredPlayers.length ? (
        filteredPlayers.map(player => {
          const playerSpec = player.getPlayerSpec();
          const id = playerSpec.id;
          const name = playerSpec.name;
          const agentUrl = getAgentUrl(playerSpec);
          const { previewUrl } = playerSpec;
          return (
            <div className="mb-1 px-2" key={player.playerId}>
              <Link
                href={agentUrl}
                target="_blank"
                className={'flex w-full justify-start px-2'}
              >
                <div
                  className="size-12 bg-cover bg-top border border-gray-900"
                  style={{
                    backgroundImage: isValidUrl(previewUrl) ? `url(${previewUrl})` : 'none',
                    backgroundColor: isValidUrl(previewUrl) ? 'transparent' : '#ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#fff',
                  }}
                >
                  {!isValidUrl(previewUrl) && name.charAt(0)}
                </div>
                <div className="flex-1 text-ellipsis overflow-hidden text-xl font-[Aller-Bold] ml-2">
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
