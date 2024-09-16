'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { isValidUrl } from '@/utils/helpers/urls'
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'
import HeaderMaskFrame from './masks/HeaderMaskFrame'

export interface AgentProps extends React.ComponentProps<'div'> {
  agent: {
    name: string
    id: string
    preview_url: string
  }
}

export function AgentProfile({ agent }: AgentProps) {
  const { agentJoin } = useMultiplayerActions()


  console.log(agent)

  return (
    <div className="w-full mx-auto h-[calc(100vh-68px)]">

      <div className="w-full max-w-6xl mx-auto h-full bg-blue-500 pt-20 relative">

        <div className="flex absolute bottom-0 left-0">
          {/* <div className="mr-4 mb-4 size-32 min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">
            {isValidUrl(agent.preview_url) ? (
              <Image src={agent?.preview_url} alt="Profile picture" width={160} height={160} />
            ) : (
              <div className='uppercase text-lg font-bold'>{agent.name.charAt(0)}</div>
            )}
          </div> */}
          
          <div>
          <h2 className="text-4xl uppercase font-bold">{agent.name}</h2>
          <h3 className="text-sm mb-2 bg-gray-800 px-2 py-1">{agent.id}</h3>
          <h3 className="text-sm mb-4">Created by: {agent?.author?.name}</h3>
          <Button variant="outline" className="text-xs mb-1" onClick={e => {
            (async () => { 
              await agentJoin(agent.id);
            })();
          }}>
            Chat
          </Button>
          </div>

        </div>
        
      </div>

    </div>
  );
}
