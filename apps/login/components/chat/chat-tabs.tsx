'use client';

import React, { useState } from 'react';
import useHash from '@/lib/hooks/use-hash';
import { ChatInfo } from './chat-info';
import { ChatMembers } from './chat-members';
import { ChatHead } from './chat-head';


export interface TabsProps {
  user: any;
}

export function ChatTabs() {

  const [ tab, setTab ] = useHash('members');

  const activeClass = 'bg-[#c3c9d1]';
  const inactiveClass = 'cursor-pointer';

  return (
    <div className='pb-16 text-[#2D4155]'>
      <div className="mb-4 border-b-2 border-gray-400 max-w-4xl w-full">

        <ChatHead />

        <ul className="flex overflow-x-scroll md:overflow-x-auto md:flex-wrap whitespace-nowrap -mb-[2px] text-sm font-bold text-center px-4" role="tablist">
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
