'use client';

import { isValidUrl } from "@/utils/helpers/urls";
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import Image from "next/image";
import { IconUser } from "@/components/ui/icons";
import { useState } from "react";
import { IconButton } from "ucom";
import { AgentJoin } from "@/components/cta";

export interface AgentListProps {
  agent: any
  author: string
}

export function AgentRow({ agent, author }: AgentListProps) {
  
  return (
    <div className="bg-gray-100 border p-4 text-black">
      <div className="flex">
        <div className="mr-4 size-[120px] min-w-[120px] md:size-[160px] md:min-w-[160px] flex items-center justify-center">
          <div
            className="w-full h-full bg-cover bg-top"
            style={{
              backgroundImage: isValidUrl(agent.preview_url)
                ? `url(${agent.preview_url})`
                : 'none',
              backgroundColor: isValidUrl(agent.preview_url) ? 'transparent' : '#ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#fff',
            }}
          >
            {!isValidUrl(agent.preview_url) && agent.name.charAt(0)}
          </div>
        </div>
        <div className="min-w-40 text-md capitalize w-full relative">
          <a href={`/agents/${agent.id}`} className="block hover:underline">
            <div className="font-bold text-lg line-clamp-1 uppercase">{agent.name}</div>
            <div className="line-clamp-2">{agent.description}</div>
          </a>
          <div className="flex absolute bottom-0 right-0">
            <AgentJoin agent={agent} />
          </div>

          <div className="text-gray-400 line-clamp-1"><IconUser className="mr-1 align-middle size-4 inline-block" /> {author}</div>
        </div>
      </div>
    </div>
  );
}


export function SkeletonAgentRow() {
  return (
    <div className="bg-gray-100 border p-4 text-black">
      <div className="flex">
        <div className="mr-4 size-[160px] min-w-[160px] flex items-center justify-center bg-cover">
          <div className="h-full w-full bg-gray-300"></div>
        </div>
        <div className="min-w-40 text-md capitalize w-full relative">
          <div className="bg-gray-300 rounded h-6 mb-4 w-3/4"></div>
          <div className="bg-gray-300 rounded h-4 mb-2 w-full"></div>
          <div className="bg-gray-300 rounded h-4 mb-2 w-full"></div>
          <div className="bg-gray-300 rounded h-4 mb-2 w-full"></div>
          <div className="text-center ml-6 absolute bottom-0 right-0">
            <div className="bg-gray-300 rounded h-3 w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}