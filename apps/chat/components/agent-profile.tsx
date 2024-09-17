'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { IconCheck, IconCopy } from '@/components/ui/icons';
import { useCopyToClipboard } from '@/lib/client/hooks/use-copy-to-clipboard';
import { isValidUrl } from '@/utils/helpers/urls';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';

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

export function AgentProfile({ agent }: AgentProps) {
  const { agentJoin } = useMultiplayerActions();
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });

  const handleCopy = () => {
    if (!isCopied) {
      copyToClipboard(agent.id);
    }
  };

  const backgroundImageUrl = agent.images?.[0]?.url || '/images/backgrounds/agents/default-agent-profile-background.jpg';
  const isPreviewUrlValid = isValidUrl(agent.preview_url);
  const agentInitial = agent.name.charAt(0).toUpperCase();

  return (
    <div
      className="w-full h-[calc(100vh-68px)] bg-cover bg-center"
      style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
    >
      <div className="w-full max-w-6xl mx-auto h-full pt-20 relative">
        <div className="absolute bottom-16 left-4">
          <div className="mr-4 mb-4 w-12 h-12 bg-opacity-10 overflow-hidden rounded-2xl flex items-center justify-center">
            {isPreviewUrlValid ? (
              <Image
                src={agent.preview_url}
                alt="Profile picture"
                width={160}
                height={160}
              />
            ) : (
              <div className="uppercase text-lg font-bold">
                {agentInitial}
              </div>
            )}
          </div>
          <div>
          <h2 className="text-6xl uppercase font-bold text-stroke">{agent.name}</h2>
            <div className="flex items-center mb-2">
              <h3 className="text-sm bg-gray-800 px-2 py-1">{agent.id}</h3>
              <Button variant="ghost" size="icon" onClick={handleCopy}>
                {isCopied ? <IconCheck /> : <IconCopy />}
                <span className="sr-only">Copy ID</span>
              </Button>
            </div>
            <h3 className="text-sm mb-4">
              Created by: {agent.author.name}
            </h3>
            <Button
              variant="outline"
              className="text-xs mb-1"
              onClick={() => agentJoin(agent.id)}
            >
              Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
