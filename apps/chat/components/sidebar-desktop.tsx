import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat/chat-history'
import { RoomUi } from '@/components/chat/room-ui'
import { LeftSidebarToggle, RightSidebarToggle } from './sidebar-toggle'


export async function SidebarDesktopLeft() {
  return (
    <Sidebar position="left" className="hidden md:block peer peerLeft absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:w-[250px] xl:w-[300px] left-0">
      <ChatHistory />
    </Sidebar>
  )
}

export async function SidebarDesktopRight() {
  return (
    <Sidebar position="right" className="hidden md:block peer peerRight absolute inset-y-0 z-30 hidden translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 w-[300px] lg:w-[300px] xl:w-[300px] right-0">
      <RoomUi />
    </Sidebar>
  )
}