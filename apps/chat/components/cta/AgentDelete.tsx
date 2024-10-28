'use client';

import React, { useState } from 'react';
import { getJWT } from '@/lib/jwt';
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { IconButton } from 'ucom';

interface AgentDeleteProps {
  agent: {
    id: string;
  };
}

export function AgentDelete({ agent }: AgentDeleteProps) {
  return (
    <IconButton
      onClick={(e) => {
        (async () => {
          const jwt = await getJWT();
          const res = await fetch(
            `${deployEndpointUrl}/agent`,
            {
              method: 'DELETE',
              body: JSON.stringify({
                guid: agent.id,
              }),
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwt}`,
              },
            }
          );
          if (res.ok) {
            await res.blob();

            // setAgents((agents: object[]) => {
            //   return agents.filter(
            //     (agent: any) =>
            //       agent.id !== id
            //   );
            // });
          } else {
            console.warn(
              `invalid status code: ${res.status}`
            );
          }
        })();
      }}
      icon="Trash"
      size="small"
      variant="primary"
    />
  );
};