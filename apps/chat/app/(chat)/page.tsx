import { Chat } from '@/components/chat'
import { auth } from '@/auth'
import { AI } from '@/lib/chat/actions'
import { nanoid } from '@/lib/utils'
import { Session } from '@/lib/types'
import { getMissingKeys } from '@/app/actions'


export default async function IndexPage() {
  const id = nanoid()
  const session = (await auth()) as Session
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
