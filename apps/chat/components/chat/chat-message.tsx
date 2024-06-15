import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import Image from 'next/image'
import { resolveRelativeUrl } from '@/lib/utils'


TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')


export interface ChatMessageProps {
  content: string
  media: object
  name: string
  player: any
  timestamp: number
}

export function ChatMessage({
  content,
  media,
  name,
  player,
  timestamp,
}: ChatMessageProps) {

  return (
    <div>
      {/*{ JSON.stringify( player )}*/}
      <div className={"grid grid-cols-message"}>
        <div className="mr-4">
          <Image src={resolveRelativeUrl(player.playerSpec.previewUrl)} alt="" className="s-300" width={48} height={48} />
        </div>
        <div className="">
          <span className="font-bold mr-2">
          { name }
        </span>
          <span className="opacity-75 text-xs font-medium">
          { timestamp ? timeAgo.format(timestamp) : null}
        </span>
          <br/>
          <div className="">
            { content }
          </div>
        </div>
      </div>
    </div>
  )
}
