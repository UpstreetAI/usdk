'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getJWT } from '@/lib/jwt';
// import { ProfileImage } from '@/components/account/profile-image'
import { Button } from '@/components/ui/button';
import { IconDots } from '@/components/ui/icons'
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { isValidUrl } from '@/utils/helpers/urls';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'
import { useRouter } from 'next/navigation'

export interface AgentsProps {
  agents: object[];
  userIsCurrentUser: boolean;
}

export function Agents({ agents: agentsInit, userIsCurrentUser }: AgentsProps) {
  const router = useRouter();
  const [agents, setAgents] = useState(() => agentsInit);
  const [openAgentIndex, setOpenAgentIndex] = useState(-1);

  const { agentJoin } = useMultiplayerActions()

  return (
    <div className="flex m-auto w-full max-w-4xl">
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <h3 className="mb-1 text-2xl font-medium">Agents</h3>
          <div className="flex flex-col m-auto mt-5 w-full max-w-4xl">
        {agents.map((agent: object, i: number) => {
          const {
            id,
            name,
            description,
            start_url,
            preview_url,
          } = agent as any;

          return (
            <div className="relative flex m-auto mb-4 w-full max-w-4xl" key={id}>
              <Link href={`/agents/${id}`}>
                <div className="mr-4 mb-4 size-[128px] min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">
                  {preview_url && isValidUrl(preview_url) ? (
                    <Image className="flex mr-2" width={128} height={128} src={preview_url} alt='Profile picture' />
                  ) : (
                    <div className='uppercase text-lg font-bold'>{name.charAt(0)}</div>
                  )}
                </div>
              </Link>
              <div className="flex flex-col flex-1">
                <Link href={`/agents/${id}`}>
                  <div className="flex font-bold hover:underline">{name}</div>
                </Link>
                <div className="flex">{description}</div>
                <div className="flex">{id}</div>
              </div>
              {userIsCurrentUser && <>
                <div className="flex flex-col px-2 py-1 mb-auto cursor-pointer rounded border bg-primary/10 hover:bg-primary/20 active:bg-primary/30" onClick={e => {
                  setOpenAgentIndex(i === openAgentIndex ? -1 : i);
                }}>
                  <IconDots />
                </div>
                {i === openAgentIndex && <div className="absolute flex flex-col top-8 right-0 p-2 rounded border cursor-auto bg-primary/10">
                  <Button variant="outline" className="text-xs mb-1" onClick={e => {
                    setOpenAgentIndex(-1);

                    (async () => {
                      await agentJoin(id);
                    })();
                  }}>
                    Chat
                  </Button>
                  <Button variant="outline" className="text-xs mb-1" onClick={e => {
                    setOpenAgentIndex(-1);

                    router.push(`/agents/${id}/logs`);
                  }}>
                    Logs
                  </Button>
                  <Button variant="destructive" className="text-xs" onClick={e => {
                    setOpenAgentIndex(-1);

                    (async () => {
                      const jwt = await getJWT();
                      const res = await fetch(`${deployEndpointUrl}/agent`, {
                        method: 'DELETE',
                        body: JSON.stringify({
                          guid: id,
                        }),
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${jwt}`,
                        },
                      });
                      if (res.ok) {
                        await res.blob();

                        setAgents((agents: object[]) => {
                          return agents.filter((agent: any) => agent.id !== id);
                        });
                      } else {
                        console.warn(`invalid status code: ${res.status}`);
                      }
                    })();
                  }}>Delete</Button>
                </div>}
              </>}
            </div>
          );
        })}
      </div>
    </div>
    </div>
    </div>
  )
}
