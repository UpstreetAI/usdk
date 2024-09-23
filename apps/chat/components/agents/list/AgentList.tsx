'use client';

import { AgentRow } from "./AgentRow";

export interface AgentListProps {
  agents: object[]
  loading: boolean
}

export function AgentList({ agents, loading }: AgentListProps) {

  if (loading) return <div className="animate-pulse text-center p-4 text-xl">Loading agents...</div>;

  if (!agents.length) return 'No agents found.';

  return agents.map((agent: any, index: number) => <AgentRow agent={agent} key={index} author={agent?.author.name} />);
}
