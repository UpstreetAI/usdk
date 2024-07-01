import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat/chat-history'
import { RoomUi } from '@/components/chat/room-ui'


export async function SidebarDesktopLeft() {
  return (
    <Sidebar className="hidden md:block peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:w-[250px] xl:w-[300px]">
      <ChatHistory />
    </Sidebar>
  )
}

export async function SidebarDesktopRight() {
  return (
    <Sidebar className="hidden md:block peer absolute right-0 inset-y-0 z-30 hidden translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:w-[250px] xl:w-[300px]">
      <RoomUi />
    </Sidebar>
  )
}