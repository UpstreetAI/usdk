'use client'

export interface AgentProps extends React.ComponentProps<'div'> {
  agent?: any
}

export function AgentProfile({ agent }: AgentProps) {

  return (
    <div
      className="w-full max-w-2xl mx-auto"
    >
      <h1>Agent</h1>
      <h1 className="text-[28px] mb-6">{agent?.name}</h1>
      <img src={agent?.preview_url} />
    </div>
  )
}
