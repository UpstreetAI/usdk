'use client'

import { redirectToLoginTool } from '@/lib/redirectToLoginTool'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps, buttonVariants } from '@/components/ui/button'
import { IconSpinner, IconUser } from '@/components/ui/icons'

interface LoginButtonProps extends ButtonProps {}

export function HeaderLoginButton({
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <Button
      variant="outline"
      onClick={async () => {
        setIsLoading( true )
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        await redirectToLoginTool()
      }}
      disabled={isLoading}
      className={cn(buttonVariants({ variant: 'outline' }))}
      {...props}
    >
      {
        isLoading
          ? <IconSpinner className="mr-2 animate-spin"/>
          : <IconUser/>
      }

      <span className="ml-2 md:flex">
        Login
      </span>
    </Button>
  )
}
