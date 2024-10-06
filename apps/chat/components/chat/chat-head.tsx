'use client';

import { useEffect, useState } from 'react';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function ChatHead() {

  const [showRoomLinkTooltip, setShowRoomLinkTooltip] = useState(false)
  const { getCrdtDoc } = useMultiplayerActions()

  const crdt = getCrdtDoc()

  const roomName = crdt?.getText('name').toString()
  const roomDescription = crdt?.getText('description').toString()

  const roomLink = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="flex mt-5 flex-col justify-start px-4 pb-4 gap-1 rounded-md border-1">
      {roomName && (
        <span className="select-none font-black text-2xl flex justify-between w-full items-center">
          {roomName}
        </span>
      )}
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
        <TooltipContent className="z-50">Copied chat link!</TooltipContent>
      </Tooltip>
    </div>
  );
};