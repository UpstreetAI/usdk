'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getJWT } from '@/lib/jwt';
// import { ProfileImage } from '@/components/account/profile-image'
import { Button } from '@/components/ui/button';
import { IconDots } from '@/components/ui/icons'
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'

export interface AgentsProps {
  agents: object[];
  userIsCurrentUser: boolean;
}

export function Agents({ agents: agentsInit, userIsCurrentUser }: AgentsProps) {
  const [agents, setAgents] = useState(() => agentsInit);
  const [openAgentIndex, setOpenAgentIndex] = useState(-1);

  const { agentJoin } = useMultiplayerActions()

  return (
    <>
      <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
        Agents
      </h1>
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
                <Image className="flex mr-2" width={128} height={128} src={preview_url} alt='Profile picture' />
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
    </>
  )
}
