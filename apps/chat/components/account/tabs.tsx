'use client';

import React, { useState } from 'react';
import { Agents } from './agents';
import { Voices } from './voices';
import { Profile } from './profile';
import { Credits } from './credits';
import { AccountSubscriptions } from './subscriptions';
import { Monetization } from './monetization';
import useHash from '@/lib/hooks/use-hash';
import HeaderMaskFrame from '../masks/HeaderMaskFrame';
import { isValidUrl } from '@/lib/utils';
import { IconButton } from 'ucom';
import Dev from '../development';


interface Agent {
  images: { url: string }[];
}

export interface TabsProps {
  user: any;
  agents: Agent[];
  voices: object[];
  creditsUsageHistory: object[] | null;
  userIsCurrentUser: boolean;
  userPrivate: any;
}

export function Tabs({ user, agents: agentsInit, voices: voicesInit, creditsUsageHistory, userIsCurrentUser, userPrivate }: TabsProps) {

  const [tab, setTab] = useHash('profile'); // Default to 'profile'
  const [agents, setAgents] = useState(() => agentsInit);
  const [voices, setVoices] = useState(() => voicesInit);

  creditsUsageHistory = creditsUsageHistory ?? [];

  const origin = window.location.origin;
  const accountUrl = `${origin}/accounts/${user.id}`;
  const randomAgentImage = agents[Math.floor(Math.random() * agents.length)]?.images[0].url;

  return (
    <div className='w-full'>
      <HeaderMaskFrame background={randomAgentImage} wrapperClass="bg-blue-500" backgroundOpacity={0.2}>
        <div className="w-full max-w-6xl mx-auto h-60 pt-28 relative px-4">
          <div className="flex">
            <div className="mr-4 size-18 min-w-18 md:size-36 md:min-w-36 bg-gray-100 p-4 overflow-hidden flex items-center justify-center border-2 border-gray-900">
              <div
                className="w-full h-full bg-cover bg-top"
                style={{
                  backgroundImage: isValidUrl(user.preview_url) ? `url(${user.preview_url})` : 'none',
                  backgroundColor: isValidUrl(user.preview_url) ? 'transparent' : '#ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  color: '#fff',
                }}
              >
                {!isValidUrl(user.preview_url) && user.name.charAt(0)}
              </div>
            </div>
            <div>
              <div className='flex items-center'>
                <h2 className="text-lg md:text-4xl uppercase text-stroke font-bold">{user.name}</h2>
                <IconButton
                  onClick={() => { setTab('profile'); }}
                  variant='ghost'
                  icon="Logout"
                  target={'_blank'}
                  className='ml-4'
                />
              </div>
              <div className="px-2 py-1 bg-black bg-opacity-60">{accountUrl}</div>
              <div className='flex gap-4 mt-4'>
                <IconButton
                  onClick={() => { setTab('profile'); }}
                  icon="Head"
                  label="Account"
                  active={tab === 'profile'}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  onClick={() => { setTab('agents'); }}
                  icon="Users"
                  label="Agents"
                  active={tab === 'agents'}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  onClick={() => { setTab('credits'); }}
                  icon="Payments"
                  label="Payments"
                  active={tab === 'credits'}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  onClick={() => { setTab('subscriptions'); }}
                  icon="Subscriptions"
                  label="Subscription"
                  active={tab === 'subscriptions'}
                  target={undefined}
                  size="large"
                />
                <Dev>
                  <IconButton
                    onClick={() => { setTab('voices'); }}
                    icon="Voices"
                    label="Voices"
                    active={tab === 'voices'}
                    target={undefined}
                    size="large"
                  />
                  <IconButton
                    onClick={() => { setTab('monetization'); }}
                    icon="Users"
                    label="Monetization"
                    active={tab === 'monetization'}
                    target={undefined}
                    size="large"
                  />
                </Dev>
              </div>
            </div>
          </div>
        </div>
      </HeaderMaskFrame>
      <div className='w-full md:w-4xl max-w-4xl mx-auto mt-20'>
        <div className={tab === 'profile' ? 'block w-full' : 'hidden'}>
          <Profile user={user} userIsCurrentUser={userIsCurrentUser} />
        </div>
        <div className={tab === 'agents' ? 'block w-full' : 'hidden'}>
          <Agents agents={agents} userIsCurrentUser={userIsCurrentUser} />
        </div>
        <div className={tab === 'voices' ? 'block w-full' : 'hidden'}>
          <Voices voices={voices} userIsCurrentUser={userIsCurrentUser} />
        </div>
        <div className={tab === 'credits' ? 'block w-full' : 'hidden'}>
          <Credits creditsUsageHistory={creditsUsageHistory} />
        </div>
        <div className={tab === 'subscriptions' ? 'block w-full' : 'hidden'}>
          <AccountSubscriptions user={user} userPrivate={userPrivate} />
        </div>
        <div className={tab === 'monetization' ? 'block w-full' : 'hidden'}>
          <Monetization userPrivate={userPrivate} />
        </div>
      </div>
    </div>
  );
}
