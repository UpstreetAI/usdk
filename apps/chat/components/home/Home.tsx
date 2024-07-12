'use client';

import { useSupabase } from "@/lib/hooks/use-supabase";
import { Button } from "../ui/button";
import { newChat } from "@/lib/chat/actions";
import Icon from "../ui/icon";
import { getLatestAgents } from "@/lib/agents";
import { useEffect, useMemo, useState } from "react";
import { cn, getAgentPreviewImageUrl } from "@/lib/utils";
import { AgentProps } from "../agent-profile";
import { getChatsIdb } from "@/lib/chat";
import Link from "next/link";
import _ from "lodash";

const ChatListItem = ({
  image="",
  title,
  description,
  showPlaceholders,
animateSkeleton,
className="",
...props
}: {
  image?: string;
  title?: string;
  description?: string;
  showPlaceholders?: boolean;
  animateSkeleton?: boolean;
  className?:string;
}) => {
  
  return (
    <li className={cn("py-3 sm:pb-4 group", className)} {...props}>
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
         <div className="flex-shrink-0">
         <object className={"w-12 h-12 aspect-square object-cover rounded-full " + (showPlaceholders && !image && "bg-muted ") + (animateSkeleton && "animate-pulse")} data={image} type="image/jpeg">
          <div className="bg-muted h-full w-full"/>
        </object>
         </div>
         <div className="flex flex-1 min-w-0 gap-1 flex-col justify-start">
            <p className={"text-sm font-medium text-gray-900 truncate dark:text-white group-hover:underline " + (showPlaceholders && !title && "bg-muted rounded-full h-4 !max-w-[100px] ") + (animateSkeleton && "animate-pulse")}>
               {title}
            </p>
            <p className={"text-sm text-gray-500 truncate dark:text-gray-400 " + (showPlaceholders && !description && "bg-muted rounded-full h-6 !max-w-[200px] ") + (animateSkeleton && "animate-pulse")}>
               {description}
            </p>
         </div>
         {/* <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
            $320
         </div> */}
      </div>
   </li>
  )
}

export default function Home() {
  const {user} = useSupabase();

  const [latestAgents, setLatestAgents] = useState<AgentProps[]>()
  const [allRecentChats, setRecentChats] = useState<any>()


  useEffect(() => {
    const _getLatestAgents = async () => {
      setLatestAgents(await getLatestAgents())
    }
    const _getAllChats = async () => {
      setRecentChats(await getChatsIdb())
    }

    _getLatestAgents()
    _getAllChats()
  }, [])

  const recentChats = allRecentChats && _.uniqBy(allRecentChats, (e:any) => {
    return e.name
  }).sort((a, b) => {
    console.log("a, b", a, b);
    return a.joinedAt - b.joinedAt
  }).slice(0, 5)

  console.log("recentChats", recentChats);
  console.log("allRecentChats", allRecentChats);
  
  console.log("latestAgents", latestAgents)

  const isNoRecentChats = user && recentChats && !recentChats.length

  return (
    <div className="mx-auto max-w-2xl px-4 mt-4 w-full">


<button id="floating-action-button" className="fixed bottom-8 right-8 h-20 w-20 aspect-square rounded-xl bg-background flex justify-center items-center hover:bg-muted group hover:scale-[1.01] shadow-lg"
onClick={() => {
  newChat();
}}
>
  <Icon name="add" className="h-10 w-10 group-hover:opacity-100 opacity-60" />
</button>

      {user ? 
      recentChats ?
      !recentChats.length ?
      (
        <>
        
        <div className="relative h-fit w-full z-0">
          <div className="w-[400px] opacity-70 rounded-full h-10 bg-muted" />
<ul className="divide-y divide-muted-800">
   <ChatListItem showPlaceholders />
   <ChatListItem showPlaceholders />
   <ChatListItem showPlaceholders />
</ul>
<div className="absolute top-0 left-0 w-full h-full z-10 bg-gradient-to-b from-transparent to-[#18181A]"></div>
</div>

        <div className="absolute flex items-center justify-center -mt-6 z-20 left-0 right-0">
          <div className="!gap-4 text-center rounded-t-lg p-12 w-full">
          <h1 className="text-3xl text-center flex font-semibold w-full justify-center items-center">
            You haven't talked to anyone yet.
          </h1>
          <p className="leading-normal text-muted-foreground pt-4 md:pt-0">
            Search for agents to talk to, or just start a new chat and invite them later. {' '}
            </p>
          {/* <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                newChat();
              }}
            >
              New Chat
            </Button> */}
          </div>
        </div>
        </>
      ) 
      :
      (
        <>
        <div className="w-200 rounded-full h-10 mt-4 mb-6 flex flex-row justify-between items-center">
          <span className="text-4xl font-bold">Recent chats</span>
        </div>

        <ul className={"divide-y divide-muted w-full flex flex-col flex-1 overflow-scroll " + (isNoRecentChats && "mt-48")}>
  {
    recentChats.map((recentChat: any, index: number) => {
      return (
        <Link href={`/rooms/${recentChat.name}`} key={recentChat.name}>
          <ChatListItem image={""} title={recentChat.name} description={"A conversation you had."}
          showPlaceholders
          />
        </Link>
      )
    })
  }
</ul>
</>
      )
      :
<>
   <ChatListItem showPlaceholders animateSkeleton />
   <ChatListItem showPlaceholders animateSkeleton />
   <ChatListItem showPlaceholders animateSkeleton />
    </>
      : (
        <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
          <h1 className="text-lg font-semibold">
            Welcome to Upstreet chat!
          </h1>
          <p className="leading-normal text-muted-foreground">
            Where the simulation is always running and humans interact with AIs. Friend and chat with AIs from your phone, with a familiar social network interface.{' '}
          </p>
          <p className="leading-normal text-muted-foreground mt-4">
            Login or create an account to start looking for agents and forming relationships!{' '}
          </p>
        </div>
      )}

<div className={"w-200 rounded-full h-10 mt-8 flex flex-row justify-between items-center "  + (isNoRecentChats && "!mt-48")}>
          <span className="text-md uppercase tracking-wide opacity-40 font-semibold">New agents to talk to</span>
</div>
<ul className={"divide-y divide-muted w-full flex flex-col flex-1 overflow-scroll "}>
  {
    latestAgents ? latestAgents.map((agent, index) => {
      return (
        <ChatListItem className=" cursor-pointer" onClick={() => {
          newChat(`?add=${agent.id}`)
        }} image={getAgentPreviewImageUrl({
          previewUrl: agent.preview_url
        })} title={agent.name} description={agent.description}
        showPlaceholders animateSkeleton
        />
      )
    }): <>
   <ChatListItem />
   <ChatListItem />
   <ChatListItem />
    </>
  }
</ul>


    </div>
  );
}
