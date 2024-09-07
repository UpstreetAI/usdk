'use client'

import React from 'react';
import { useEffect, useState } from 'react';
// import Link from 'next/link';
import { ChatMessage } from '@/components/chat/chat-message';
// import { ChatMessageOld } from '@/components/chat/chat-message-old'
// import { type User } from '@supabase/supabase-js';
// import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat/chat-list'
import { ChatPanel } from '@/components/chat/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
// import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { defaultUserPreviewUrl } from 'usdk/sdk/src/defaults.mjs';
// import { useAIState } from 'ai/rsc'
// import { Message } from '@/lib/types'
// import { usePathname, useRouter } from 'next/navigation'
import { useScrollAnchor } from '@/lib/hooks/use-scroll-anchor';
// import { UIState } from '@/lib/chat/actions'
// import { resolveRelativeUrl } from '@/lib/utils'
// import { aiHost } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';
import { useSupabase, type User } from '@/lib/hooks/use-supabase';
import { PlayerSpec, Player, useMultiplayerActions } from '@/components/ui/multiplayer-actions';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/lib/client/hooks/use-sidebar';
import { PaymentItem, SubscriptionProps } from 'usdk/sdk/src/types';
import { createSession } from 'usdk/sdk/src/util/stripe-utils.mjs';

//

const openInNewPage = (url: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  // a.rel = 'noopener noreferrer';
  a.click();
};

//

type MessageMedia = {
  type: string
  url: string
}
type Message = {
  args: {
    text?: string
    // audio?: string
    // image?: string
    // video?: string
    media?: MessageMedia
  }

  method: string
  name: string
  timestamp: Date
  userId: string
}

//

const realtimeConnect = async (supabase: any) => {
  // Create a function to handle inserts
  const handleWebhookInserts = (payload: any) => {
    console.log('Change received!', payload)
  }

  // Listen to inserts
  const subscription = supabase
    .channel('webhooks')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'webhooks' }, handleWebhookInserts)
    .subscribe();
  // console.log('got subscription', subscription);
  return subscription;
};

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  // user: User|null
  // missingKeys: string[]
  room: string
  onConnect?: (connected: boolean) => void
}
export function Chat({ className, /* user, missingKeys, */ room, onConnect }: ChatProps) {
  // const router = useRouter()
  // const path = usePathname()
  const [input, setInput] = useState('')
  // const [messages] = useUIState()
  // const [aiState] = useAIState()
  const { user } = useSupabase()

  // const [_, setNewChatId] = useLocalStorage('newChatId', id)

  const {
    connected,
    playersCache,
    messages: rawMessages,
    setMultiplayerConnectionParameters,
    // sendRawMessage,
    // sendChatMessage,
  } = useMultiplayerActions();

  useEffect(() => {
    onConnect && onConnect(connected);
  }, [connected]);

  const messages = rawMessages.map((rawMessage: any, index: number) => {
    const message = {
      ...rawMessage,
      timestamp: rawMessage.timestamp ? new Date(rawMessage.timestamp) : new Date(),
    };
    // if (rawMessage.method === 'say') {
      return {
        id: index,
        display: getMessageComponent(room, message, index + '', playersCache, user),
      };
    // } else {
    //   return null;
    // }
  })/*.filter((message) => message !== null) as unknown */as any[];

  useEffect(() => {
    if (room && user) {
      const localPlayerSpec: PlayerSpec = {
        id: (user as any).id as string,
        name: (user as any).name as string,
        previewUrl: (user as any).preview_url as string || defaultUserPreviewUrl,
        capabilities: [
          'human',
        ],
      };
      setMultiplayerConnectionParameters({
        room,
        localPlayerSpec,
      });
    }
  }, [room, user, setMultiplayerConnectionParameters]);

  const { messagesRef, scrollRef, visibilityRef, isAtBottom, scrollToBottom } =
    useScrollAnchor();

  const { isLeftSidebarOpen, isRightSidebarOpen } = useSidebar();
  
  return (
    <div
      className={`group w-full duration-300 ease-in-out animate-in overflow-auto ${isLeftSidebarOpen ? "lg:pl-[250px] xl:pl-[300px]" : ""} ${isRightSidebarOpen ? "lg:pr-[250px] xl:pr-[300px]" : ""} `}
      ref={scrollRef}
    >
      <div
        className={cn('pb-[200px] pt-4 md:pt-10', className)}
        ref={messagesRef}
      >
        {room ? (
          messages.length ? (
            <ChatList messages={messages} /*isShared={false} user={user}*/ />
          ) : (
            null
          )
        ) : <EmptyScreen />}

        <div className="w-full h-px" ref={visibilityRef} />
      </div>
      <ChatPanel
        // id={id}
        input={input}
        setInput={setInput}
        isAtBottom={isAtBottom}
        scrollToBottom={scrollToBottom}
        room={room}
        messages={messages}
        // sendChatMessage={sendChatMessage}
      />
    </div>
  )
}

function getMessageComponent(room: string, message: Message, id: string, playersCache: Map<string, Player>, user: User | null) {
  // XXX debugging
  const { supabase } = useSupabase();
  globalThis.supabase = supabase;
  globalThis.connect = () => realtimeConnect(supabase);

  switch (message.method) {

    // TODO Move the typing logic to form component, over send message?
    case 'typing': return null;

    case 'join': return (
      <div className="opacity-60">
        { message.name } joined the room.
      </div>
    )

    case 'leave': return (
      <div className="opacity-60">
        { message.name } left the room.
      </div>
    )
    
    case 'say': {

      const player = playersCache.get(message.userId);

      // let media = null;

      // if(message.args.audio) media = { type: 'audio', url: message.args.audio };
      // if(message.args.video) media = { type: 'video', url: message.args.video };
      // if(message.args.image) media = { type: 'image', url: message.args.image };

      // TEST MESSAGE COMPONENTS START, REMOVE WHEN MEDIA ARGS ARE IMPLEMENTED, THE ABOVE WILL WORK
      // Usage:
      // test audio [AUDIO_URL]
      // test video [VIDEO_URL]
      // test image [IMAGE_URL]
      // const match = message.args.text.match(/\[([^\]]+)\]/);
      // const url = match && match[1]
      // if(message.args.text.startsWith('test audio')) media = { type: 'audio', url: url };
      // if(message.args.text.startsWith('test video')) media = { type: 'video', url: url };
      // if(message.args.text.startsWith('test image')) media = { type: 'image', url: url };
      // TEST MESSAGE COMPONENTS END

      return (
        <ChatMessage
          id={id}
          name={ message.name }
          content={message.args.text}
          media={message.args.media}
          player={player}
          room={room}
          timestamp={message.timestamp}
          // user={user}
        />
      )
    }

    case 'paymentRequest': {
      const agentId = message.userId;
      const player = playersCache.get(agentId);

      let media = null;

      const {
        args,
      } = message;
      const {
        type,
        props,
        stripeConnectAccountId,
      } = args as PaymentItem;
      const {
        name,
        description,
        amount,
        currency,
        interval,
        intervalCount,
      } = props as SubscriptionProps;

      const checkout = async (e: any) => {
        if (user) {
          const targetUserId = user.id;

          const jwt = await getJWT();
          if (!jwt) {
            throw new Error('No jwt:' + jwt);
          }

          const success_url = location.href;
          const stripe_connect_account_id = stripeConnectAccountId;
          const opts = {
            args: {
              mode: type,
              line_items: [
                {
                  quantity: 1,
                  price_data: {
                    product_data: {
                      name,
                      description,
                    },
                    unit_amount: amount,
                    currency,
                    recurring: type === 'subscription' ? {
                      interval,
                      interval_count: intervalCount,
                    } : undefined,
                  },
                },
              ],
              success_url,
              metadata: {
                targetUserId,
                agentId,
              },
            },
            stripe_connect_account_id,
          };
          const j = await createSession(opts, {
            jwt,
          });
          const {
            // id,
            url,
          } = j;
          // XXX debugging
          realtimeConnect(supabase);
          openInNewPage(url);
        } else {
          throw new Error('No user:' + user);
        }
      };

      const price = (() => {
        const v = amount / 100;
        if (currency === 'usd') {
          return `$${v}`;
        } else {
          return `${v} ${(currency + '').toUpperCase()}`;
        }
      })();
      const subscriptionText = type === 'subscription' ? ` per ${interval}${intervalCount !== 1 ? 's' : ''}` : '';

      return (
        <ChatMessage
          id={id}
          content={
            <div className="rounded bg-zinc-950 text-zinc-300 p-4 border">
              <div className="text-zinc-700 text-sm mb-2 font-bold">[payment request]</div>
              <div className="mb-4">{name}: {description}</div>
              <div className="mb-4">{price}{subscriptionText}</div>
              <Button onClick={checkout}>Checkout</Button>
            </div>
          }
          name={ message.name }
          media={ media }
          player={player}
          room={room}
          timestamp={message.timestamp}
        />
      )
    }

    default: return null
  }
}
