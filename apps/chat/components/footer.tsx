import React from 'react'

import { cn } from '@/lib/utils'
import { ExternalLink } from '@/components/external-link'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {

  const date = new Date();
  const year = date.getFullYear();

  return (
    <p
      className={cn(
        'px-2 text-center text-xs leading-normal text-muted-foreground',
        className
      )}
      {...props}
    >
      © {year}.{' '}
      <ExternalLink href="https://upstreet.ai">Upstreet, Inc.</ExternalLink>{' '}
      All rights reserved.
    </p>
  )
}
