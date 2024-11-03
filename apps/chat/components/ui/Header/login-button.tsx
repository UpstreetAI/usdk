'use client'

import { redirectToLoginTool } from '@/lib/redirectToLoginTool'
import * as React from 'react'
import { Button } from 'ucom'

interface LoginButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode
}

export function LoginButton({
  children,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
      <Button
        onClick={async () => {
          setIsLoading( true )
          // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
          await redirectToLoginTool()
        }}
        disabled={isLoading}
        {...props}
      >
        {children}
      </Button>
  );
}
