'use client';

import { useSupabase } from "@/lib/hooks/use-supabase";
import { Button } from "../ui/button";
import { newChat } from "@/lib/chat/actions";

export default function Home() {
  const { user } = useSupabase();

  return (
    <div className="section section-hero">
      
    </div>
  );
}
