'use client';

import { useSupabase } from "@/lib/hooks/use-supabase";
import { Button } from "../ui/button";
import { newChat } from "@/lib/chat/actions";
import Icon from "../ui/icon";

const ChatListItem = () => {
  return (
    <li className="py-3 sm:pb-4">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
         <div className="flex-shrink-0">
         <object className="w-12 h-12 aspect-square object-cover rounded-full bg-muted" data="/images/avatar2.png" type="image/jpeg">
            {/* <img src="default.jpg" /> */}
        </object>
         </div>
         <div className="flex flex-1 min-w-0 gap-1 flex-col justify-start  ">
            <p className="text-sm font-medium text-gray-900 truncate dark:text-white    bg-muted rounded-full h-4 !max-w-[100px]">
               {/* Neil Sims */}
            </p>
            <p className="text-sm text-gray-500 truncate dark:text-gray-400    bg-muted rounded-full h-6 !max-w-[200px]">
               {/* email@flowbite.com */}
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
  
  return (
    <div className="mx-auto max-w-2xl px-4 mt-4 w-full">


<div className="relative h-fit w-full z-0">
<ul className="max-w-md divide-y divide-gray-800">
   <ChatListItem />
   <ChatListItem />
   <ChatListItem />
</ul>
<div className="absolute top-0 left-0 w-full h-full z-10 bg-gradient-to-b from-transparent to-[#18181A]"></div>
</div>

<button id="floating-action-button" className="fixed bottom-8 right-8 h-20 w-20 aspect-square rounded-xl bg-background flex justify-center items-center hover:bg-muted group hover:scale-[1.01] shadow-lg"
onClick={() => {
  newChat();
}}
>
  <Icon name="add" className="h-10 w-10 group-hover:opacity-100 opacity-60" />
</button>


      {user ? (
        <div className="absolute flex items-center justify-center -mt-8 z-20 left-0 right-0">
          <div className="!gap-4 text-center rounded-t-lg p-8 w-full">
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
      ) : (
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
    </div>
  );
}
