'use client';

import { isValidUrl } from "@/utils/helpers/urls";
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import Image from "next/image";
import { IconUser } from "../ui/icons";
import { useState } from "react";
import { AgentRow } from "./AgentRow";

export interface AgentListProps {
  agents: object[]
  loading: boolean
}

export function AgentList({ agents, loading }: AgentListProps) {

  const { agentJoin } = useMultiplayerActions();

  if (loading) return <div className="animate-pulse text-center p-4 text-xl">Loading agents...</div>;

  if (!agents.length) return 'No agents found.';

  return agents.map((agent: any, index: number) => <AgentRow agent={agent} key={index} />);
}
