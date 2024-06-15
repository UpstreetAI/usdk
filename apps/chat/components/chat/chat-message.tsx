export interface ChatMessageProps {
  content: string
  name: string
}

export function ChatMessage({
  content,
  name,
}: ChatMessageProps) {
  return (
    <div>
      <div>
        { name }: { content }
      </div>
    </div>
  )
}
