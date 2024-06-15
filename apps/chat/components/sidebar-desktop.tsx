import { Sidebar } from '@/components/sidebar'

import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'
import { getUser } from '@/utils/auth-helpers/getUser'
import { createClient } from '@/utils/supabase/server'

export async function SidebarDesktop() {
  const
    client = createClient(),
    user = await getUser(client);
  // const session = await auth()

  console.log( 'ID:', user?.id)

  if (!user?.id) {
    return null
  }

  return (
    <Sidebar className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
      {/* @ts-ignore */}
      <ChatHistory userId={user.id} />
    </Sidebar>
  )
}
