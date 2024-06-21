import { Sidebar } from '@/components/sidebar'
import { ChatHistory } from '@/components/chat/chat-history'


export async function SidebarDesktop() {
  return (
    <Sidebar className="hidden md:block peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      <ChatHistory />
    </Sidebar>
  )
}
