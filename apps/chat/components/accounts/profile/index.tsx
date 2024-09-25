'use client';

import { isValidUrl } from '@/lib/utils';
import { AgentRow } from '@/components/agents/list/AgentRow';
import HeaderMaskFrame from '@/components/masks/HeaderMaskFrame';

interface AgentImage {
  url: string;
}

interface Account {
  images: AgentImage[];
  name: string;
  id: string;
  preview_url: string;
  agents: { id: string; name: string; images: AgentImage[] }[];
}

interface AccountProps {
  account: Account;
}

export function AccountProfile({ account }: AccountProps) {

  const origin = window.location.origin;
  const agentUrl = `${origin}/accounts/${account.id}`;

  return (
    <div className="w-full mx-auto">

      <HeaderMaskFrame>
        <div className="w-full bg-blue-500 h-52" />
        <div
          className="w-full h-52 absolute top-0 left-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: account.agents.length > 0
              ? `url(${account.agents[Math.floor(Math.random() * account.agents.length)].images[0].url})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </HeaderMaskFrame>

      <div className="w-full max-w-6xl mx-auto pt-24 relative px-4">
        <div className="flex">
          <div className="mr-4 size-40 min-w-40 bg-gray-100 p-4 overflow-hidden flex items-center justify-center border-2 border-gray-900">
            <div
              className="w-full h-full bg-cover bg-top"
              style={{
                backgroundImage: isValidUrl(account.preview_url)
                  ? `url(${account.preview_url})`
                  : 'none',
                backgroundColor: isValidUrl(account.preview_url) ? 'transparent' : '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              {!isValidUrl(account.preview_url) && account.name.charAt(0)}
            </div>
          </div>

          <div>
            <h2 className="text-4xl uppercase text-stroke font-bold">{account.name}</h2>
            <div className="px-2 py-1 bg-black bg-opacity-60">
              {agentUrl}
            </div>

          </div>

        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 py-8`}>
          {account.agents.map((agent: { id: string; name: string }) => <AgentRow key={agent.id} agent={agent} author={account.name} />)}
        </div>

      </div>

    </div>
  );
}
