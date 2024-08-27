'use client';

import { resolveRelativeUrl } from "@/lib/utils";
import { isValidUrl } from "@/utils/helpers/urls";
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import Image from "next/image";
import { IconUser } from "../ui/icons";

export interface AgentListProps {
  agents: object[]
  loading: boolean
}

export function AgentList({ agents, loading }: AgentListProps) {

  const { agentJoin } = useMultiplayerActions();

  if (loading) return <div className="animate-pulse text-center p-4 text-xl">Loading agents...</div>;

  if (!agents.length) return 'No agents found.';

  return agents.map((agent: any, index: number) =>
    <div key={index} className="flex">
      <div className="mr-4 mb-4 size-[80px] min-w-[80px] bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center overflow-hidden">
        {agent.preview_url && isValidUrl(agent.preview_url) ? (
          <Image src={resolveRelativeUrl(agent.preview_url)} alt="" className="h-full" width={80} height={80} />
        ) : (
          <div className='uppercase text-lg font-bold'>{agent.name.charAt(0)}</div>
        )}
      </div>
      <div className="px-2 md:px-6 min-w-40 text-md capitalize w-full">
        <div className="font-bold line-clamp-1">{agent.name}</div>
        <div className="w-full line-clamp-1">{agent.description}</div>
        <div className="mt-2 text-gray-400 line-clamp-1">
          <IconUser className="mr-1 align-middle size-4 inline-block" /> {agent.author.name}
        </div>
      </div>
      <a
        onMouseDown={async e => {
          e.preventDefault();
          e.stopPropagation();

          await agentJoin(agent.id);
        }}
        className="ml-4 mb-4 size-[80px] min-w-[80px] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.1)] cursor-pointer rounded-[8px] flex items-center justify-center overflow-hidden">
        <div className='uppercase text-2xl'>+</div>
      </a>
    </div>
  );
}
