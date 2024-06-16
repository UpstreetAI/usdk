'use client'
import Image from 'next/image'
import { resolveRelativeUrl } from '@/lib/utils'

export interface AgentProps extends React.ComponentProps<'div'> {
  agent?: any
}

export function AgentProfile({ agent }: AgentProps) {

  return (
    <div
      className="w-full max-w-2xl mx-auto"
    >
      <h1>Agent</h1>
      <h2 className="text-[28px]">{agent?.name}</h2>
      <h3 className="text-sm mb-6">{agent?.id}</h3>
      <Image src={resolveRelativeUrl(agent?.preview_url)} alt="Profile picture" className="s-300" width={300} height={300} />
    </div>
  )
}
