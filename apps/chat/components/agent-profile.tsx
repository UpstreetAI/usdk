'use client';

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/hooks/use-supabase'
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { IconCheck, IconCopy } from '@/components/ui/icons';
import { useCopyToClipboard } from '@/lib/client/hooks/use-copy-to-clipboard';
import { isValidUrl } from '@/utils/helpers/urls';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';

interface AgentImage {
  url: string;
}

interface Agent {
  images: AgentImage[];
  name: string;
  id: string;
  preview_url: string;
  author: {
    name: string;
  };
}

interface AgentProps {
  agent: Agent;
}

export function AgentProfile({ agent }: AgentProps) {
  const { agentJoin } = useMultiplayerActions();
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const handleCopy = () => {
    if (!isCopied) {
      copyToClipboard(agent.id);
    }
  };

  const backgroundImageUrl = agent.images?.[0]?.url || '/images/backgrounds/agents/default-agent-profile-background.jpg';
  const isPreviewUrlValid = isValidUrl(agent.preview_url);
  const agentInitial = agent.name.charAt(0).toUpperCase();
  
  const { supabase } = useSupabase();
  const [rooms, setRooms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('chat_specifications')
        .select('data')
        .eq('user_id', agent.id);
    
      setIsLoading(false);

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        const roomIds = data?.map((row: any) => row.data.room); // data contains object having room and endpoint_url
        setRooms(roomIds || []);
      }
    }

    fetchRooms();
  }, []);

  return (
    <div
      className="w-full h-[calc(100vh-68px)] bg-cover bg-center"
      style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
    >
      <div className="w-full max-w-6xl mx-auto h-full pt-20 relative">

        <div className="absolute bottom-16 left-4">
          <div className="mr-4 mb-4 w-12 h-12 bg-opacity-10 overflow-hidden rounded-2xl flex items-center justify-center">
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
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <IconCheck /> : <IconCopy />}
                <span className="sr-only">Copy ID</span>
              </Button>
            </div>
            <h3 className="text-sm mb-4">
              Created by: {agent.author.name}
            </h3>
            <Button
              variant="outline"
              className="text-xs mb-1"
              onClick={() => agentJoin(agent.id)}
            >
              Chat
            </Button>
          </div>
        </div>

        <div className='asolute top-0 right-0'>
        <h3>Rooms</h3>
      {isLoading ? (
        <div className="mt-4">
          Loading Rooms
        </div>
      ) : rooms.length > 0 ? (
        <div className="mt-4">
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
            {rooms.map((room) => (
              <div key={room} className="rounded-md p-2 mb-2 bg-gray-200 dark:bg-gray-700">
                {room}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p>This agent is currently not in any room.</p>
        </div>
      )}
          </div>
      </div>
    </div>
  );
}
