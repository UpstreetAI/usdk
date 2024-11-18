import React from 'react';
import { Chat } from '@/components/chat/chat';
import { LoginRedirect } from '@/components/login-redirect';
import { SidebarDesktopLeft, SidebarDesktopRight } from '@/components/sidebar-desktop';

type Params = {
  params: {
    id: string;
  };
};

export default async function EmbedPage({ params }: Params) {
  const roomName = decodeURIComponent(params.id)

  return (
    // <AI initialAIState={{ chatId: id, messages: [] }}>
    <div className="w-full relative flex h-screen overflow-hidden">
      <Chat
        room={roomName}
      />
    </div>
    // </AI>
  );
}
