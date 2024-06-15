'use client'

import { type User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
// import { useAIState } from 'ai/rsc'
import { Message } from '@/lib/types'
import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor'
import { UIState } from '@/lib/chat/actions'

import { useActions } from '@/components/ui/actions'


export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  user?: User|null
  missingKeys: string[]
  room?: string
}

export function Chat({ id, className, user, missingKeys, room }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [input, setInput] = useState('')
  // const [messages] = useUIState()
  // const [aiState] = useAIState()

  const [_, setNewChatId] = useLocalStorage('newChatId', id)

  const { setRoom, messages: rawMessages, sendChatMessage } = useActions()
  const messages = rawMessages.map((rawMessage: any, index: number) => {
    if (rawMessage.method === 'say') {
      return {
        id: index,
        display: (
          <>
            <div>{rawMessage.name}</div>
            <div>{rawMessage.args.text}</div>
          </>
        ),
      };
    } else {
      return null;
    }
  }).filter((message) => message !== null) as unknown as UIState;

  /*useEffect(() => {
    if (user) {
      if (!path.includes('chat') && messages.length === 1) {
        window.history.replaceState({}, '', `/chat/${id}`)
      }
    }
  }, [id, path, user, messages])*/

  /*useEffect(() => {
    const messagesLength = aiState.messages?.length
    if (messagesLength === 2) {
      router.refresh()
    }
  }, [aiState.messages, router])*/

  useEffect(() => {
    setNewChatId(id)
  })

  useEffect(() => {
    missingKeys.map(key => {
      toast.error(`Missing ${key} environment variable!`)
    })
  }, [missingKeys])

  useEffect(() => {
    if (room) {
      setRoom(room);
    }
  }, [room, setRoom]);

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor()

  return (
    <div
      className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]"
      ref={scrollRef}
    >
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {messages.length ? (
          <ChatList messages={messages} isShared={false} user={user} />
        ) : (
          <EmptyScreen />
        )}

        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        room={room}
        messages={messages}
        sendChatMessage={sendChatMessage}
      />
    </div>
  )
}
