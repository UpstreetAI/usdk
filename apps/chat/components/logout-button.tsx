'use client';

import * as React from 'react'
import { logout } from '@/lib/logout'
import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconGitHub, IconSpinner, IconUser } from '@/components/ui/icons'

interface LoginButtonProps extends ButtonProps {
  showGithubIcon?: boolean
  text?: string
}

export function LogoutButton({
  className,
  ...props
}: LoginButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={logout}
      className={cn(className)}
      {...props}
    >
      <IconUser className="mr-2" />
      Logout
    </Button>
  )
}
