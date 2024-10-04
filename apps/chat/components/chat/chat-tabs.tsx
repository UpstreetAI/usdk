'use client';

import React, { useState } from 'react';
import useHash from '@/lib/hooks/use-hash';
import { ChatInfo } from './chat-info';
import { ChatMembers } from './chat-members';


export interface TabsProps {
  user: any;
}

export function ChatTabs({ user }: TabsProps) {

  const [ tab, setTab ] = useHash('members');

  const activeClass = 'text-purple-600 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-500 border-purple-600 dark:border-purple-500';
  const inactiveClass = 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 cursor-pointer';

  return (
    <div className='pb-16'>
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700 max-w-4xl w-full">
        <ul className="flex overflow-x-scroll md:overflow-x-auto md:flex-wrap whitespace-nowrap -mb-px text-sm font-medium text-center" role="tablist">
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('info'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'profile' ? activeClass : inactiveClass}`}>Info</button>
          </li>
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('members'); }} className={`inline-block p-4 border-b-2 rounded-t-lg ${tab === 'agents' ? activeClass : inactiveClass}`}>Members</button>
          </li>
        </ul>
      </div>
      <div className='w-full md:w-4xl max-w-4xl'>
        <div className={tab === 'info' ? 'block w-full' : 'hidden'}>
          <ChatInfo />
        </div>
        <div className={tab === 'members' ? 'block w-full' : 'hidden'}>
          <ChatMembers />
        </div>
      </div>
    </div>
  );
}
