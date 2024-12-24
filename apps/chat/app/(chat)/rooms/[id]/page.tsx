import React from 'react';
import { Chat } from '@/components/chat/chat';
import { LoginRedirect } from '@/components/login-redirect';
import { SidebarDesktopLeft, SidebarDesktopRight } from '@/components/sidebar-desktop';

type Params = {
  params: {
    id: string;
  };
  searchParams: {
    desktop?: string;
  };
};

export default async function RoomPage({ params, searchParams }: Params) {
  const roomName = decodeURIComponent(params.id);
  const desktop = searchParams.desktop === '1';

  return (
    // <AI initialAIState={{ chatId: id, messages: [] }}>
    <div className="w-full relative flex h-screen overflow-hidden">

      <LoginRedirect />

      <SidebarDesktopLeft />
      
      <Chat
        room={roomName}
        desktop={desktop}
      />

      <SidebarDesktopRight />
    </div>
    // </AI>
  );
}
