'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { isValidUrl } from '@/utils/helpers/urls'
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'
import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/hooks/use-supabase'

export interface AgentProps extends React.ComponentProps<'div'> {
  agent: {
    name: string
    id: string
    preview_url: string
  }
}

export function AgentProfile({ agent }: AgentProps) {
  const { agentJoin } = useMultiplayerActions()
  const { supabase } = useSupabase();
  const [rooms, setRooms] = useState<string[]>([]);

  useEffect(() => {
    async function fetchRooms() {
      
      console.log("fetching rooms");
      console.log("agentId: ", agent.id);

      const { data, error } = await supabase
        .from('chat_specifications')
        .select('*')
        .eq('user_id', agent.id);

      if (error) {
        console.error('Error fetching rooms:', error);
      } else {
        console.log("data fetched: ", data);
        const roomIds = data?.map((row: any) => {
          const parsedData = JSON.parse(row.data);
          return parsedData.room;
        });
        setRooms(roomIds || []);
      }
    }

    fetchRooms();
  }, []);

  return (
    <div
      className="w-full max-w-2xl mx-auto"
    >
      <h1>Agent</h1>
      <h2 className="text-[28px]">{agent.name}</h2>
      <h3 className="text-sm mb-6">{agent.id}</h3>
      <div className="mr-4 mb-4 size-48 min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">
        {isValidUrl(agent.preview_url) ? (
          <Image src={agent?.preview_url} alt="Profile picture" width={192} height={192} />
        ) : (
          <div className='uppercase text-lg font-bold'>{agent.name.charAt(0)}</div>
        )}
      </div>
      <Button variant="outline" className="text-xs mb-1" onClick={e => {
        (async () => {
          await agentJoin(agent.id);
        })();
      }}>
        Chat
      </Button>
      <h3>Rooms</h3>
      {rooms.length > 0 ? (
        <div className="mt-4">
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
            {rooms.map((room) => (
              <div key={room} className="bg-gray-100 rounded-md p-2 mb-2">
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
  )
}
