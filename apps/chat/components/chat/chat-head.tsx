'use client';

import { useEffect, useState } from 'react';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import HeaderMaskFrame from '../masks/HeaderMaskFrame';

export function ChatHead() {

  const [showRoomLinkTooltip, setShowRoomLinkTooltip] = useState(false)
  const { getCrdtDoc } = useMultiplayerActions()

  const crdt = getCrdtDoc()

  const roomName = crdt?.getText('name').toString()
  const roomDescription = crdt?.getText('description').toString()

  const roomLink = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <HeaderMaskFrame
      background="/images/backgrounds/rooms/default-bg.jpg"
    >
      <div className="flex flex-col justify-start gap-1 rounded-md border-1 mb-2 p-4 pt-32">

        <span className="select-none font-black text-2xl flex justify-between w-full items-center">
          {roomName ? roomName : '156th Street'}
        </span>

        {roomDescription && (
          <span className="select-none text-sm font-medium flex justify-between w-full items-center">
            {roomDescription}
          </span>
        )}

        <span className="select-none opacity-70 text-xs font-medium flex justify-between w-full items-center">
          Chat joining link
        </span>
        <Tooltip open={showRoomLinkTooltip}>
          <TooltipTrigger>
            <span
              onClick={() => {
                navigator.clipboard.writeText(roomLink)
                setShowRoomLinkTooltip(true)
                setTimeout(() => setShowRoomLinkTooltip(false), 1500)
              }}
              className="text-sm overflow-hidden text-ellipsis line-clamp-1"
            >
              {roomLink}
            </span>
          </TooltipTrigger>
          <TooltipContent className="z-50 bg-gray-800">Copied chat link!</TooltipContent>
        </Tooltip>
      </div>

    </HeaderMaskFrame>
  );
};