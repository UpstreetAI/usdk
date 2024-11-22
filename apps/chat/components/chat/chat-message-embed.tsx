import Link from 'next/link'
import { isValidUrl } from '@/utils/helpers/urls'
import { IconChat, IconDownload, IconShare } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'
import { isImageType, isAudioType, isVideoType, isModelType } from '@/utils/helpers/media-types'
import { Model } from '../model'
import ReactMarkdown from 'react-markdown'
import { timeAgo } from 'react-agents/util/time-ago.mjs';

export interface ChatMessageEmbedProps {
  id: string
  content: any
  media: any
  name: string
  player: any
  room: string
  timestamp: Date
  isOwnMessage: any
  profileUrl: string
}

export function ChatMessageEmbed({
  id,
  content,
  media,
  name,
  player,
  timestamp,
  isOwnMessage,
}: ChatMessageEmbedProps) {
  if (!player) {
    throw new Error('Player is required')
  }

  return (
    <div>
      <div className={`relative bt-0 mt-2 ${isOwnMessage ? 'pl-14' : 'pr-14'}`}>
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <div className={`bg-slate-100 py-[11px] px-4 w-fit border border-gray-400 text-black ${isOwnMessage ? 'mr-2 bg-green-50' : 'ml-2'}`}>
            {!isOwnMessage && (
              <span
                className="font-bold mr-2 cursor-pointer hover:underline"
              >
                {name}
              </span>
            )}

            {(() => {
              if (isImageType(media?.type)) {
                return (<ChatMessageImage url={media.url} timestamp={timestamp} />);
              }
              if (isAudioType(media?.type)) {
                return (<ChatMessageAudio url={media.url} timestamp={timestamp} />);
              }
              if (isVideoType(media?.type)) {
                return (<ChatMessageVideo url={media.url} timestamp={timestamp} />);
              }
              if (isModelType(media?.type)) {
                return (<ChatMessageModel url={media.url} timestamp={timestamp} />);
              }
              return null;
            })()}
            {content && (
              <div className="relative">
                <div className={`float-left mr-2`}>
                  <ReactMarkdown className='chat-markdown'>
                    {content}
                  </ReactMarkdown>
                </div>
                <div className="float-right text-md text-right text-gray-400">
                  {timeAgo(timestamp)}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// CHAT MESSAGE AVATAR

export interface ChatMessageAvatarProps {
  name: string
  avatarURL: string
  profileUrl: string
}

export function ChatMessageAvatar({
  name,
  avatarURL,
  profileUrl
}: ChatMessageAvatarProps) {
  return (
    <Link href={profileUrl}>
      <div
        className="w-12 h-12 bg-cover bg-top border border-gray-400"
        style={{
          backgroundImage: isValidUrl(avatarURL)
            ? `url(${avatarURL})`
            : 'none',
          backgroundColor: isValidUrl(avatarURL) ? 'transparent' : '#ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#fff',
        }}
      >
        {!isValidUrl(avatarURL) && name.charAt(0)}
      </div>
    </Link>
  )
}

// MEDIA AUDIO

export interface ChatMessageAudioProps {
  url: string
  timestamp: Date
}

export function ChatMessageAudio({
  url,
  timestamp
}: ChatMessageAudioProps) {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] rounded-[16px] p-4 shadow-lg mt-2">
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
  timestamp: Date
}

export function ChatMessageVideo({
  url,
  timestamp
}: ChatMessageVideoProps) {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] rounded-[16px] p-4 shadow-lg mt-2">
      <video id={`videoPlayer-${timestamp}`} controls className="w-full rounded-[8px] h-auto outline-none">
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

// MEDIA: MODEL

export interface ChatMessageModelProps {
  url: string
  timestamp: Date
}

export function ChatMessageModel({
  url,
  timestamp
}: ChatMessageModelProps) {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] rounded-[16px] p-4 shadow-lg mt-2">
      <Model src={url} />
      <Button
        variant="secondary"
        onClick={e => {
          const a = document.createElement('a');
          a.href = url;
          a.download = url;
          a.click();
        }}
      >
        <IconDownload className="mr-2" />
        <div>Download</div>
      </Button>
    </div>
  )
}

// MEDIA: IMAGE

export interface ChatMessageImageProps {
  url: string
  timestamp: Date
}

export function ChatMessageImage({
  url,
  timestamp
}: ChatMessageImageProps) {
  return (
    <div className="bg-[rgba(255,255,255,0.1)] mt-2 mb-2">
      <img id={`image-${timestamp}`} className='w-full' src={url} alt='' />
    </div>
  )
}


