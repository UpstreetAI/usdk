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

  const activeClass = 'text-[#2D4155] bg-[#c3c9d1]';
  const inactiveClass = 'hover:border-b-gray-300 hover:text-[#2D4155] cursor-pointer';

  return (
    <div className='pb-16'>
      <div className="mb-4 border-b-2 border-gray-400 max-w-4xl w-full">
        <div className='h-40'>

        </div>
        <ul className="flex overflow-x-scroll md:overflow-x-auto md:flex-wrap whitespace-nowrap -mb-[2px] text-sm font-medium text-center px-4" role="tablist">
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('info'); }} className={`inline-block uppercase py-2 px-4 border-2 border-b-0 border-gray-400 ${tab === 'info' ? activeClass : inactiveClass}`}>Info</button>
          </li>
          <li className="me-2" role="presentation">
            <button onClick={() => { setTab('members'); }} className={`inline-block uppercase py-2 px-4 border-2 border-b-0 border-gray-400 ${tab === 'members' ? activeClass : inactiveClass}`}>Members</button>
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
