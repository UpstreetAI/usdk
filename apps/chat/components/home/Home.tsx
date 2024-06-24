'use client';

import { useSupabase } from "@/lib/hooks/use-supabase";
import { Button } from "../ui/button";
import { newChat } from "@/lib/chat/actions";

export default function Home() {
  const {user} = useSupabase();
  
  return (
    <div className="mx-auto max-w-2xl px-4 mt-4 w-full">
      {user ? (
        <div className="flex items-center justify-center">
          <div className="gap-2 text-center w-full rounded-t-lg border bg-background p-8">
          <h1 className="text-lg flex font-semibold">
            Welcome back {user.name}!
          </h1>
          <p className="leading-normal text-left text-muted-foreground">
            Search for agents to talk to, or just start a new chat and invite them later. {' '}
            </p>
          <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                newChat();
              }}
            >
              New Chat
            </Button>
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
