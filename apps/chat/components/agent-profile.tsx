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

  return (
    <div className="w-full mx-auto">

      <HeaderMaskFrame>
        <div className="w-full bg-blue-500 pt-20 h-52" />
      </HeaderMaskFrame>

      <div className="w-full max-w-2xl mx-auto pt-20 relative">

        <div className="flex">
          <div className="mr-4 mb-4 size-32 min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">
            {isValidUrl(agent.preview_url) ? (
              <Image src={agent?.preview_url} alt="Profile picture" width={160} height={160} />
            ) : (
              <div className='uppercase text-lg font-bold'>{agent.name.charAt(0)}</div>
            )}
          </div>
          
          <div>
          <h2 className="text-[28px] uppercase font-bold">{agent.name}</h2>
          <h3 className="text-sm mb-6">{agent.id}</h3>

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
