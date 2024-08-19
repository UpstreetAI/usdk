'use client';

import React, { useState } from 'react';
import { Agents } from './agents';
import { Profile } from './Profile';
import { Credits } from './credits';


export interface TabsProps {
  user: unknown;
  agents: object[];
  creditsUsageHistory: object[];
  userIsCurrentUser: boolean;
}

export function Tabs({ user, agents: agentsInit, creditsUsageHistory, userIsCurrentUser }: TabsProps) {

  const [ tab, setTab ] = useState<string>('profile');
  const [agents, setAgents] = useState(() => agentsInit);

  const activeClass = 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 border-purple-600 dark:border-purple-500';
  const inactiveClass = 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 cursor-pointer';

  return (
    <div>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 max-w-4xl w-full">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center" role="tablist">
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('profile'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'profile' ? activeClass : inactiveClass}`}>Profile</button>
          </li>
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('agents'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'agents' ? activeClass : inactiveClass}`}>Agents</button>
          </li>
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('credits'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'credits' ? activeClass : inactiveClass}`}>Credits</button>
          </li>
          <li role="presentation">
            <button onClick={() => { setTab('subscriptions'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'subscriptions' ? activeClass : inactiveClass}`}>Subscription</button>
          </li>
          <li role="presentation">
            <button onClick={() => { setTab('monetization'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'monetization' ? activeClass : inactiveClass}`}>Agent Monetization</button>
          </li>
        </ul>
      </div>
      <div className='w-full max-w-4xl'>
        <div className={tab === 'profile' ? 'block w-full' : 'hidden'}>
          <Profile user={user} userIsCurrentUser={userIsCurrentUser} />
        </div>
        <div className={tab === 'agents' ? 'block w-full' : 'hidden'}>
          <Agents agents={agents} userIsCurrentUser={userIsCurrentUser} />
        </div>
        <div className={tab === 'credits' ? 'block w-full' : 'hidden'}>
          <Credits creditsUsageHistory={creditsUsageHistory} />
        </div>
        <div className={tab === 'subscriptions' ? 'block w-full' : 'hidden'}>
          <p></p>
        </div>
        <div className={tab === 'monetization' ? 'block w-full' : 'hidden'}>
          <p></p>
        </div>
      </div>
    </div>
  );
}
