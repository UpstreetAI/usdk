import React, { useState } from 'react';
import { IconButton } from 'ucom';
import { useMultiplayerActions } from '../ui/multiplayer-actions';

interface AgentJoinProps {
  agent: {
    id: string;
  };
}

export function AgentJoin({ agent }: AgentJoinProps) {
  const [loadingChat, setLoadingChat] = useState(false);

  const { agentJoin } = useMultiplayerActions();

  return (
    <IconButton
      onClick={async e => {
        e.preventDefault();
        e.stopPropagation();

        setLoadingChat(true);

        await agentJoin(agent.id);
        setLoadingChat(false);
      }}
      icon="Chat"
      size="small"
      variant="primary"
    />
  );
};