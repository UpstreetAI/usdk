'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/hooks/use-supabase';
import Image from 'next/image';
import { IconCheck, IconCopy } from '@/components/ui/icons';
import { useCopyToClipboard } from '@/lib/client/hooks/use-copy-to-clipboard';
import { isValidUrl } from '@/utils/helpers/urls';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import { IconButton, Button } from 'ucom';
import useHash from '@/lib/hooks/use-hash';
import { AgentRooms } from './rooms';
import Link from 'next/link';

interface AgentImage {
  url: string;
}

interface Agent {
  images: AgentImage[];
  name: string;
  id: string;
  preview_url: string;
  author: {
    id: string;
    name: string;
  };
}

interface AgentProps {
  agent: Agent;
}

export function AgentProfile({ agent }: AgentProps) {
  const { agentJoin } = useMultiplayerActions();
  const [tab, setTab] = useHash('feed');
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const { supabase } = useSupabase();
  const [rooms, setRooms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCopy = () => {
    if (!isCopied) {
      copyToClipboard(agent.id);
    }
  };

  const backgroundImageUrl = agent.images?.[0]?.url || '/images/backgrounds/agents/default-agent-profile-background.jpg';
  const isPreviewUrlValid = isValidUrl(agent.preview_url);
  const agentInitial = agent.name.charAt(0).toUpperCase();

  useEffect(() => {
    async function fetchRooms() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('chat_specifications')
        .select('data')
        .eq('user_id', agent.id);

      setIsLoading(false);

      console.log(data)

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        const roomIds = data?.map((row: any) => row.data.room);
        setRooms(roomIds || []);
      }
    }

    fetchRooms();
  }, [agent.id, supabase]);

  return (
    <div
      className="w-full h-[calc(100vh-68px)] bg-cover bg-center"
      style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
    >
      <div className="w-full max-w-6xl mx-auto h-full pt-20 relative">
        <div className="absolute bottom-16 left-4">
          <div className="mr-4 mb-4 size-40 border-2 border-black rounded-xl bg-opacity-10 overflow-hidden flex items-center justify-center">
            {isPreviewUrlValid ? (
              <Image
                src={agent.preview_url}
                alt="Profile picture"
                width={160}
                height={160}
              />
            ) : (
              <div className="uppercase text-lg font-bold">
                {agentInitial}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-6xl uppercase font-bold text-stroke">{agent.name}</h2>
            <div className="flex items-center mb-2">
              <h3 className="text-sm bg-gray-800 px-2 py-1">{agent.id}</h3>
              <Button variant="ghost" size="medium" onClick={handleCopy}>
                {isCopied ? <IconCheck /> : <IconCopy />}
                <span className="sr-only">Copy ID</span>
              </Button>
            </div>
            <h3 className="text-sm mb-4">
              <Link href={`/accounts/${agent.author.id}`}>
              Created by: {agent.author.name}
              </Link>
            </h3>
            <div className="flex gap-4">
              <Button onClick={() => agentJoin(agent.id)}>Chat</Button>
              <IconButton onClick={() => setTab('feed')} active={tab === 'feed'} icon="Info" size="small" variant="primary" />
              <IconButton onClick={() => setTab('rooms')} active={tab === 'rooms'} icon="Room" size="small" variant="primary" />
            </div>
          </div>
        </div>
        
       
        <div className="absolute top-0 right-0 w-1/2 h-full bg-opacity-90 p-4 overflow-y-auto">
            {tab === 'rooms' && (<AgentRooms agent={agent} />)}
        </div>

      </div>
    </div>
  );
}
