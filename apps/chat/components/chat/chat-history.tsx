'use client';
import * as React from 'react'

import Link from 'next/link'

import { cn, getAgentUrl, getAgentPreviewImageUrl, getAgentEndpointUrl } from '@/lib/utils'
// import { SidebarList } from '@/components/sidebar-list'
import { Button, buttonVariants } from '@/components/ui/button'
import { IconPlus, IconClose } from '@/components/ui/icons'

import { useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import Icon from '../ui/icon';
import { Input } from '../ui/input';
import { useBreakpoint } from '@/lib/hooks/use-breakpoint';
import { SidebarActions } from '../sidebar-actions';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { useRouter } from 'next/navigation';
import { getChat, removeChat, shareChat } from '@/app/actions';

interface ChatHistoryProps {
  id: string
}

export function ChatHistory({id}: ChatHistoryProps) {
  // const router = useRouter()

  const [showRoomLinkTooltip, setShowRoomLinkTooltip] = React.useState(false)

  const { localPlayerSpec, playersMap, getCrdtDoc } = useMultiplayerActions();

  const crdt = getCrdtDoc();

  const roomName = crdt?.getText('name').toString();
  const roomDescription = crdt?.getText('description').toString();

  const roomLink = typeof window !== "undefined" ? window.location.href : ""

  const players = Array.from(playersMap.values()).sort((a, b) => {
    return a.getPlayerSpec().name.localeCompare(b.getPlayerSpec().name);
  });

  const [memberSearchQuery, setMemberSearchQuery] = React.useState("")


  const playerImages = players.map((player) => getAgentPreviewImageUrl(player.getPlayerSpec()))

  console.log("playerImages", playerImages);

  // const additionalImages = Math.max(playerImages.length - 4, 0)

  const filteredPlayers = players
  .filter((player)=>player.getPlayerSpec().name.toLocaleLowerCase().includes(memberSearchQuery.toLocaleLowerCase()) || memberSearchQuery.toLocaleLowerCase().includes(player.getPlayerSpec().name.toLocaleLowerCase()))

  // const { isAboveMd } = useBreakpoint("md")

  return (
    <div className="flex flex-col h-full">

{/* <div className='w-full h-fit px-12 py-4'>
<div className='relative h-auto w-full aspect-square overflow-hidden rounded-full flex flex-wrap justify-center items-center'>
  {playerImages.slice(0, 4).map((image, index) => (
    <div 
      key={index} 
      className={`relative flex-grow border-muted ${playerImages.length === 1 ? 'w-full' : 'border-[1px] w-1/2'} h-1/2 overflow-hidden`}
      style={{ 
        flexBasis: playerImages.length === 1 ? '100%' : '50%',
        height: playerImages.length <= 2 ? '100%' : undefined
      }}
    >
      {additionalImages && index === 3 ? <div className='absolute h-full w-full top-0 left-0 bg-black bg-opacity-70 text-[150%] flex justify-center items-center font-bold'>+{additionalImages}</div> : <></>}
      <img 
        src={image} 
        className='w-full h-full object-cover' 
      />
    </div>
  ))}

</div>
</div> */}


<div className='flex mt-20 flex-col justify-start px-4 pb-4 gap-1 rounded-md border-1'>
{roomName && <span className='select-none font-black text-2xl flex justify-between w-full items-center'>
  {roomName}
</span>}
{roomDescription && <span className='select-none text-sm font-medium flex justify-between w-full items-center'>
  {roomDescription}
</span>}

{
(roomName ||
roomDescription) 
&& <hr className='mb-8 mt-4 opacity-70 '/>
}

      <span className='select-none opacity-70 text-xs font-medium flex justify-between w-full items-center'>Chat joining link
      </span>
<Tooltip open={showRoomLinkTooltip}>
  <TooltipTrigger>
      <span onClick={() => {
navigator.clipboard.writeText(roomLink)
setShowRoomLinkTooltip(true)
setTimeout(() => setShowRoomLinkTooltip(false), 1500)
      }} className='text-sm overflow-hidden text-ellipsis line-clamp-1'>{roomLink}</span>
      </TooltipTrigger>
      <TooltipContent className='z-50'>
        Copied chat link!
      </TooltipContent>
      </Tooltip>
      {/* {
        isAboveMd ?
      <Button onClick={() => {
        navigator.clipboard.writeText(roomLink)
      }}>
        <Icon name="copy" className='h-4 w-4' /> Copy link
      </Button>
      :
      <Button onClick={() => {
        navigator.share({
          url: roomLink 
      })
      }}>
      <Icon name="share" className='h-4 w-4' /> Share link
    </Button>
      } */}
      </div>

<hr className='mb-8 mt-4 opacity-70 mx-2 '/>

<div className='w-full h-fit px-2'>


      <Input name="search-names"  placeholder={"Search for members..."} value={memberSearchQuery} onChange={(e) => setMemberSearchQuery(e.target.value)} type='search'/>
      </div>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h4 className="select-none opacity-70 text-xs font-medium">Members ({players.length})</h4>
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="size-7 p-0 bg-muted hover:bg-background"
              onClick={() => {}}
            >
              <Icon name="add" className='w-4 h-4'/>
              <span className="sr-only">Add</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add members</TooltipContent>
        </Tooltip> */}
      </div>
      {filteredPlayers.length ? 
        filteredPlayers.map((player) => {
        const playerSpec = player.getPlayerSpec();
        const id = playerSpec.id;
        const name = playerSpec.name;
        const agentUrl = getAgentUrl(playerSpec);
        const photo = getAgentPreviewImageUrl(playerSpec)

        // alert(photo)
        // console.log("playerSpec", playerSpec);

        return (<div className="mb-1 px-2" key={player.playerId}>
          <Link
            href={agentUrl}
            target="_blank" // Add target="_blank" to open the link in a new window
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'flex w-full justify-start bg-zinc-50 px-2 shadow-none transition-colors hover:bg-zinc-200/40 dark:bg-zinc-900 dark:hover:bg-zinc-300/10'
            )}
          >
            <img className='w-6 h-6 aspect-square rounded-full mr-2' src={photo} />
            <div className='flex-1 text-ellipsis overflow-hidden'>{name}</div>
            {localPlayerSpec.id !== id && <div
              className="rounded p-1 hover:bg-zinc-600"
              onClick={async e => {
                e.preventDefault();
                e.stopPropagation();

                const agentEndpointUrl = getAgentEndpointUrl(playerSpec);
                const leaveUrl = `${agentEndpointUrl}leave`;
                console.log('click x', leaveUrl);
                const res = await fetch(leaveUrl, {
                  method: 'POST',
                });
                if (res.ok) {
                  const text = await res.text();
                }
              }}
            >
              <IconClose className="stroke-2" />
            </div>}
          </Link>
        </div>
        );
      })
      :
      <span className='px-4 py-2 text-center opacity-70'>No results.</span>
    }
      {/* <React.Suspense
        fallback={
          <div className="flex flex-col flex-1 px-4 space-y-4 overflow-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="w-full h-6 rounded-md shrink-0 animate-pulse bg-zinc-200 dark:bg-zinc-800"
              />
            ))}
          </div>
        }
      >
        <SidebarList userId={userId} />
      </React.Suspense> */}
    </div>
  )
}