'use client';

import { useSupabase } from "@/lib/hooks/use-supabase";

export default function Home() {
  const {user} = useSupabase();
  
  return (
    <div className="mx-auto max-w-2xl px-4 mt-4">
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
    </div>
  );
}
