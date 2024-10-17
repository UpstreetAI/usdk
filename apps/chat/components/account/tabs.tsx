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


export interface TabsProps {
  user: any;
  agents: object[];
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

  const activeClass = 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 border-purple-600 dark:border-purple-500';
  const inactiveClass = 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 cursor-pointer';

  return (
    <div className='w-full'>
      <HeaderMaskFrame background={''} wrapperClass="bg-blue-500" backgroundOpacity={0.2}>
        <div className="w-full max-w-6xl mx-auto h-60 pt-28 relative px-4">
          <div className="flex">
            <div className="mr-4 size-20 min-w-20 md:size-40 md:min-w-40 bg-gray-100 p-4 overflow-hidden flex items-center justify-center border-2 border-gray-900">
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
              <h2 className="text-lg md:text-4xl uppercase text-stroke font-bold">{user.name}</h2>
              <div className="px-2 py-1 bg-black bg-opacity-60">{'https://'}</div>
              <div className='flex gap-2 mt-4'>
                <IconButton
                  onClick={() => { setTab('profile'); }}
                  icon="Head"
                  label="Account"
                  active={false}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  href="/agents"
                  icon="Users"
                  label="Agents"
                  active={false}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  href="/voices"
                  icon="Users"
                  label="Voices"
                  active={false}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  href="/credits"
                  icon="Subscriptions"
                  label="Credits"
                  active={false}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  href="/subscriptions"
                  icon="Subscriptions"
                  label="Subscription"
                  active={false}
                  target={undefined}
                  size="large"
                />
                <IconButton
                  href="/monetization"
                  icon="Users"
                  label="Monetization"
                  active={false}
                  target={undefined}
                  size="large"
                />
              </div>
            </div>
          </div>
        </div>
      </HeaderMaskFrame>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 max-w-4xl w-full mx-auto mt-16">
        <ul className="flex overflow-x-scroll md:overflow-x-auto md:flex-wrap whitespace-nowrap -mb-px text-sm font-medium text-center" role="tablist">
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('profile'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'profile' ? activeClass : inactiveClass}`}>Profile</button>
          </li>
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('agents'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'agents' ? activeClass : inactiveClass}`}>Agents</button>
          </li>
          <li>
            <button onClick={() => { setTab('voices'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'voices' ? activeClass : inactiveClass}`}>Voices</button>
          </li>
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('credits'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'credits' ? activeClass : inactiveClass}`}>Credits</button>
          </li>
          <li>
            <button onClick={() => { setTab('subscriptions'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'subscriptions' ? activeClass : inactiveClass}`}>Subscription</button>
          </li>
          <li>
            <button onClick={() => { setTab('monetization'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'monetization' ? activeClass : inactiveClass}`}>Monetization</button>
          </li>
        </ul>
      </div>
      <div className='w-full md:w-4xl max-w-4xl mx-auto'>
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
