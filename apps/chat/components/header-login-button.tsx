'use client'

import { redirectToLoginTool } from '@/lib/redirectToLoginTool'
import * as React from 'react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps, buttonVariants } from '@/components/ui/button'
import { IconLogin, IconSpinner, IconUser } from '@/components/ui/icons'

interface LoginButtonProps extends ButtonProps {}

export function HeaderLoginButton({
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <Button
      variant="ghost"
      onClick={async () => {
        setIsLoading( true )
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        await redirectToLoginTool()
      }}
      disabled={isLoading}
      className={cn(buttonVariants({ variant: 'ghost' }), "h-full rounded")}
      {...props}
    >
      <div className="mr-2">
        {
          isLoading
            ? <IconSpinner className="animate-spin"/>
            : <IconLogin className='mr-2 size-5' />
        }
      </div>

      <span>Login</span>
    </Button>
  )
}
