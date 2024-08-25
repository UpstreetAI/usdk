'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { isValidUrl } from '@/utils/helpers/urls'
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'

export interface AgentProps extends React.ComponentProps<'div'> {
  agent?: any
}

export function AgentProfile({ agent }: AgentProps) {
  const { agentJoin } = useMultiplayerActions()

  return (
    <div
      className="w-full max-w-2xl mx-auto"
    >
      <h1>Agent</h1>
      <h2 className="text-[28px]">{agent?.name}</h2>
      <h3 className="text-sm mb-6">{agent?.id}</h3>
      <div className="mr-4 mb-4 size-48 min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">
        {agent.preview_url && isValidUrl(agent.preview_url) ? (
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
    </div>
  )
}
