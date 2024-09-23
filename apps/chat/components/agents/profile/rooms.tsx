'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/hooks/use-supabase';

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

export function AgentRooms({ agent }: AgentProps) {
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
    <div className="w-full">
          {isLoading ? (
            <div className="mt-4">
              Loading Rooms
            </div>
          ) : rooms.length > 0 ? (
            <div className="mt-4">
              {rooms.map((room) => (
                  <div key={room} className="border mb-2 bg-gray-200 text-black px-4 py-2">
                    {room}
                  </div>
                ))}
            </div>
          ) : (
            <div className="mt-4">
              No rooms found
            </div>
          )}
    </div>
  );
}
