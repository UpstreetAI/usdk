'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

// import { useActions, useUIState } from 'ai/rsc'

// import { UserMessage } from './stocks/message'
// import { type AI } from '@/lib/chat/actions'
import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus, IconUpstreet, IconUsers, IconScene } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
// import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
// import { nanoid } from 'nanoid'
// import { useRouter } from 'next/navigation'

import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'
import { newChat } from '@/lib/chat/actions'
import { useSidebar } from '@/lib/client/hooks/use-sidebar'
import { SidebarMobileLeft, SidebarMobileRight } from './sidebar-mobile'
import { ChatHistory } from './chat/chat-history'
import { RoomUi } from './chat/room-ui'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {

  const { toggleLeftSidebar, isLeftSidebarOpen, toggleRightSidebar, isRightSidebarOpen } = useSidebar();

  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const { sendChatMessage } = useMultiplayerActions()

  const submitMessage = () => {
    const value = input.trim()
    setInput('')
    if (!value) return

    // // Optimistically add user message UI
    // setMessages(currentMessages => [
    //   ...currentMessages,
    //   {
    //     id: nanoid(),
    //     display: <UserMessage>{value}</UserMessage>
    //   }
    // ])

    // Submit and get response message
    // const responseMessage = await submitUserMessage(value)
    // setMessages(currentMessages => [...currentMessages, responseMessage])
    console.log('submit chat message', value);
    sendChatMessage(value);
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // formRef.current?.requestSubmit()
      event.preventDefault();
  
      // Blur focus on mobile
      if (window.innerWidth < 600) {
        const target = event.target as HTMLTextAreaElement;
        target.blur();
      }
  
      submitMessage();
    }
  };

  return (
    <form
      // ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()
        submitMessage()
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        {/* left sidebar */}
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMobileLeft>
                <ChatHistory />
              </SidebarMobileLeft>
            </TooltipTrigger>
            <TooltipContent>{isLeftSidebarOpen ? "Hide" : "Show"} Members</TooltipContent>
          </Tooltip>
        </div>
        <div className='hidden md:block'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`absolute left-0 md:left-4 top-[14px] size-8 rounded-full p-0 ${isLeftSidebarOpen ? "bg-white text-black" : "bg-background"}`}
                onClick={() => {
                  toggleLeftSidebar();
                }}
              > 
                <IconUsers />
                <span className="sr-only">Show Members</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isLeftSidebarOpen ? "Hide" : "Show"} Members</TooltipContent>
          </Tooltip>
        </div>

        {/* right sidebar */}
        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarMobileRight>
                <RoomUi />
              </SidebarMobileRight>
            </TooltipTrigger>
            <TooltipContent>{isRightSidebarOpen ? "Hide" : "Show"} Scene</TooltipContent>
          </Tooltip>
        </div>
        <div className='hidden md:block'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`absolute left-0 md:left-4 top-[14px] size-8 rounded-full p-0 ${isRightSidebarOpen ? "bg-white text-black" : "bg-background"}`}
                onClick={() => {
                  toggleRightSidebar();
                }}
              > 
                <IconScene />
                <span className="sr-only">Show Scene</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isRightSidebarOpen ? "Hide" : "Show"} Scene</TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={`absolute left-10 md:left-14 top-[14px] size-8 rounded-full bg-background p-0`}
              onClick={() => {
                newChat();
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 pl-14 py-[1.3rem] focus-within:outline-none sm:text-sm"
          // autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconUpstreet />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}