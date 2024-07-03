'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import { IconPlus, IconImage, IconAudio, IconCapture, IconUpstreet } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'
// import { newChat } from '@/lib/chat/actions'
import { cn } from '@/lib/utils'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const [mediaPickerOpen, setMediaPickerOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { sendChatMessage } = useMultiplayerActions()

  const toggleMediaPicker = () => {
    setMediaPickerOpen(open => !open)
  };

  const submitMessage = () => {
    const value = input.trim()
    setInput('')
    if (!value) return

    // // Optimistically add user message UI
    // setMessages(currentMessages => [
    //   ...currentMessages,
    //   {
    //     id: nanoid(),
    //     display: <UserMessage>{value}</UserMessage>
    //   }
    // ])

    // Submit and get response message
    // const responseMessage = await submitUserMessage(value)
    // setMessages(currentMessages => [...currentMessages, responseMessage])
    console.log('submit chat message', value);
    sendChatMessage(value);
  };

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // formRef.current?.requestSubmit()
      event.preventDefault();
  
      // Blur focus on mobile
      if (window.innerWidth < 600) {
        const target = event.target as HTMLTextAreaElement;
        target.blur();
      }
  
      submitMessage();
    }
  };

  return (
    <form
      // ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()
        submitMessage()
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col bg-background px-8 sm:rounded-md sm:border sm:px-12">
        {mediaPickerOpen && (
          <div className="absolute left-0 bottom-16 py-2 flex flex-col bg-background border rounded">
            <div className="mx-4 my-2 text-xs text-muted-foreground">Add media...</div>
            <Button
              variant="secondary"
              className="flex justify-start relative rounded bg-background mx-2 p-2 overflow-hidden"
            >
              <input className="absolute -top-12 bottom-0 -left-12 right-0 cursor-pointer" type="file" onChange={e => {
                const files = Array.from((e.target as any).files);
                const file = files[0];
                console.log('image file', file);

                toggleMediaPicker();
                (e.target as any).value = null;
              }} />
              <IconImage className="mr-2" />
              <div>Image</div>
            </Button>
            {/* <Button
              variant="secondary"
              className="flex justify-start relative rounded bg-background mx-2 p-2 overflow-hidden"
              onClick={() => {
                console.log('click audio');
              }}
            >
              <IconAudio className="mr-2" />
              <div>Audio</div>
            </Button> */}
            {/* <Button
              variant="secondary"
              className="flex justify-start relative rounded bg-background mx-2 p-2 overflow-hidden"
              onClick={() => {
                console.log('click capture');
              }}
            >
              <IconCapture className="mr-2" />
              <div>Capture</div>
            </Button> */}
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className={cn(`absolute left-0 md:left-4 top-[14px] size-8 rounded-full bg-background p-0`, mediaPickerOpen && `bg-secondary/80`)}
              onClick={() => {
                toggleMediaPicker();
              }}
            >
              <IconPlus />
              <span className="sr-only">Add Media</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Media</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 pl-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          // autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconUpstreet />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}