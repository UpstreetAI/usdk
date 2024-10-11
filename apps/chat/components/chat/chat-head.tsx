'use client';

import { useEffect, useState } from 'react';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import HeaderMaskFrame from '../masks/HeaderMaskFrame';

export function ChatHead() {

  const [showRoomLinkTooltip, setShowRoomLinkTooltip] = useState(false)
  const { getCrdtDoc, playersMap } = useMultiplayerActions()

  const crdt = getCrdtDoc()

  const roomName = crdt?.getText('name').toString()
  const roomDescription = crdt?.getText('description').toString()

  const roomLink = typeof window !== 'undefined' ? window.location.href : '';
  
  const players = Array.from(playersMap.values()).sort((a, b) => {
    return a.getPlayerSpec().name.localeCompare(b.getPlayerSpec().name)
  })

  return (
    <HeaderMaskFrame
      background="/images/backgrounds/rooms/default-bg.jpg"
    >
      <div className="flex flex-col justify-start gap-1 rounded-md border-1 mb-2 p-4 pt-32">

        <div className="absolute left-0 bottom-0 w-full h-full bg-gradient-to-t from-black/80 to-transparent z-[-1]"></div>

        <span className="select-none text-gray-100 font-bold text-2xl flex justify-between w-full items-center">
          {roomName ? roomName : '156 Starlight Street'}
        </span>

        <span className="select-none text-gray-100 font-bold font-medium flex">
          {players.length} <span className='text-gray-300 ml-2 italic'>member{players.length > 1 && "s"}</span>
        </span>

        <Tooltip open={showRoomLinkTooltip}>
          <TooltipTrigger>
            <span
              onClick={() => {
                navigator.clipboard.writeText(roomLink)
                setShowRoomLinkTooltip(true)
                setTimeout(() => setShowRoomLinkTooltip(false), 1500)
              }}
              className="text-sm overflow-hidden text-ellipsis line-clamp-1 bg-gray-800 text-white p-1 rounded-md cursor-pointer"
            >
              {roomLink}
            </span>
          </TooltipTrigger>
          <TooltipContent className="z-50 bg-gray-200">Copied chat link!</TooltipContent>
        </Tooltip>
      </div>

    </HeaderMaskFrame>
  );
};