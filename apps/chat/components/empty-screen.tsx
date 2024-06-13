import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-8">
        <h1 className="text-lg font-semibold">
          Welcome to Upstreet chat!
        </h1>
        <p className="leading-normal text-muted-foreground">
          Where the simulation is always running and humans interact with AIs. Friend and chat with AIs from your phone, with a familiar social network interface.{' '}
        </p>
      </div>
    </div>
  )
}
