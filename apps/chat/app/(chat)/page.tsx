import { Chat } from '@/components/chat'
// import { AI } from '@/lib/chat/actions'
import { nanoid } from '@/lib/utils'
import { getMissingKeys } from '@/app/actions'
import { getUser } from '@/utils/supabase/server'


export default async function IndexPage() {
  const id = nanoid()
  const user = await getUser()
  const missingKeys = await getMissingKeys()

  return (
    // <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} user={user} missingKeys={missingKeys} />
    // </AI>
  )
}
