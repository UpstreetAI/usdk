import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat/chat-history'
import { RoomUi } from '@/components/chat/room-ui'
import { LeftSidebarToggle, RightSidebarToggle } from './sidebar-toggle'
import { SidebarMobileLeft, SidebarMobileRight } from './sidebar-mobile'


export async function SidebarDesktopLeft() {
  return (
    <Sidebar position="left" className="fixed md:absolute md:block peer peerLeft inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:w-[250px] xl:w-[300px] left-0">
      <ChatHistory />
    </Sidebar>
  )
}

export async function SidebarDesktopRight() {
  return (
    <>
      <Sidebar position="right" className="md:block bg-black fixed md:absolute peer peerRight inset-y-0 z-[110] hidden translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 w-[300px] lg:w-[300px] xl:w-[300px] right-0 top-0">
        <RoomUi />
      </Sidebar>
      <SidebarMobileLeft>
        <RoomUi />
      </SidebarMobileLeft>
    </>
  )
}