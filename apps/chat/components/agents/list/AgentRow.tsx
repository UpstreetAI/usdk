'use client';

import { isValidUrl } from "@/utils/helpers/urls";
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import Image from "next/image";
import { IconUser } from "@/components/ui/icons";
import { useState } from "react";

export interface AgentListProps {
  agent: any
  author: string
}

export function AgentRow({ agent, author }: AgentListProps) {

  const { agentJoin } = useMultiplayerActions();

  const [loadingChat, setLoadingChat] = useState(false);

  return (
    <div className="bg-gray-100 border p-4 text-black">
      <div className="flex">
        <div className="mr-4 size-[160px] min-w-[160px] flex items-center justify-center">
          {agent.preview_url && isValidUrl(agent.preview_url) ? (
            <Image src={agent.preview_url} alt="" className="h-full" width={160} height={160} />
          ) : (
            <div className='uppercase text-lg font-bold'>{agent.name.charAt(0)}</div>
          )}
        </div>
        <div className="min-w-40 text-md capitalize w-full">
          <a href={`/agents/${agent.id}`} className="block hover:underline">
            <div className="font-bold text-lg line-clamp-1 uppercase">{agent.name}</div>
            <div className="text-gray-400 line-clamp-1"><IconUser className="mr-1 align-middle size-4 inline-block" /> {author}</div>
            <div className="line-clamp-2">{agent.description}</div>
          </a>
          <div className="flex">
            <div className="mt-2 text-right">
              <a
                onMouseDown={async e => {
                  e.preventDefault();
                  e.stopPropagation();

                  setLoadingChat(true);

                  await agentJoin(agent.id);
                }}
                className={`hover:underline cursor-pointer whitespace-nowrap ${loadingChat && "animate-pulse"}`}>
                {loadingChat ? "Loading chat..." : "Chat"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export function SkeletonAgentRow() {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] border rounded-lg p-6 animate-pulse">
      <div className="flex mb-2">
        <div className="mr-4 mb-2 size-[80px] min-w-[80px] bg-[rgba(255,255,255,0.2)] rounded-full flex items-center justify-center overflow-hidden">
          <div className="h-full w-full bg-gray-300 rounded-full"></div>
        </div>
        <div className="min-w-40 text-md capitalize w-full">
          <div className="bg-gray-300 rounded h-3 mb-2 w-3/4"></div>
          <div className="bg-gray-300 rounded h-2 w-1/2"></div>
        </div>
      </div>
      <div className="flex">
        <div className="mt-2 text-gray-400 line-clamp-1 w-full">
          <div className="bg-gray-300 rounded h-4 w-1/3 inline-block"></div>
        </div>
        <div className="mt-2 text-right">
          <div className="bg-gray-300 rounded h-4 w-1/5 inline-block"></div>
        </div>
      </div>
    </div>
  );
}