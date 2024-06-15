import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import Image from 'next/image'
import { resolveRelativeUrl } from '@/lib/utils'

import type { User } from '@supabase/supabase-js'


TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')


export interface ChatMessageProps {
  content: string
  media: any
  name: string
  player: any
  room: string
  timestamp: number
  user: User | null
}

export function ChatMessage({
  content,
  media,
  name,
  player,
  room,
  timestamp,
  user,
}: ChatMessageProps) {
  const isUser = player.playerId === user.id

  const avatarURL =
    player.playerSpec.previewUrl
      ? resolveRelativeUrl(player.playerSpec.previewUrl)
      : isUser
        ? user?.user_metadata?.avatar_url
        : null

  return (
    <div>
      {/*{ JSON.stringify( player )}*/}
      <div className={"grid grid-cols-message bt-0"}>
        <div className="mr-4 size-12 min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">

          {avatarURL ? (
            <Image src={avatarURL} alt="" className="s-300" width={48} height={48} />
          ) : (
            <div className='uppercase text-lg font-bold'>{name.charAt(0)}</div>
          )}
        </div>
        <div className="">
          <span className="font-bold mr-2">
            {name}
          </span>
          <span className="opacity-75 text-xs font-medium">
            {timestamp ? timeAgo.format(timestamp) : null}
          </span>
          <br />

          {media?.type === 'image' && (<ChatMessageImage url={media.url} timestamp={timestamp} />)}
          {media?.type === 'audio' && (<ChatMessageAudio url={media.url} timestamp={timestamp} />)}
          {media?.type === 'video' && (<ChatMessageVideo url={media.url} timestamp={timestamp} />)}
          {!media && (<div>{content}</div>)}

        </div>
      </div>
    </div>
  )
}

// MEDIA AUDIO

export interface ChatMessageAudioProps {
  url: string
  timestamp: number
}

export function ChatMessageAudio({
  url,
  timestamp
}: ChatMessageAudioProps) {

  return (
    <div className="bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[16px] p-4 shadow-lg mt-2">
      <audio id={`audioPlayer-${timestamp}`} controls className="w-full h-10 outline-none">
        <source src={url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  )
}

// MEDIA: VIDEO

export interface ChatMessageVideoProps {
  url: string
  timestamp: number
}

export function ChatMessageVideo({
  url,
  timestamp
}: ChatMessageVideoProps) {

  return (
    <div className="bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[16px] p-4 shadow-lg mt-2">
      <video id={`videoPlayer-${timestamp}`} controls className="w-full rounded-[8px] h-auto outline-none">
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

// MEDIA: IMAGE

export interface ChatMessageImageProps {
  url: string
  timestamp: number
}

export function ChatMessageImage({
  url,
  timestamp
}: ChatMessageImageProps) {

  return (
    <div className="bg-[rgba(0,0,0,0.1)] dark:bg-[rgba(255,255,255,0.1)] rounded-[16px] p-4 shadow-lg mt-2">
      <img id={`image-${timestamp}`} className='rounded-[8px] w-full' src={url} alt='' />
    </div>
  )
}
