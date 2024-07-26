"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
// import * as React from "react"
// import * as DialogPrimitive from "@radix-ui/react-dialog"
// import { Cross2Icon } from "@radix-ui/react-icons"
import { redirectToLoginTool } from '@/lib/redirectToLoginTool'

// import { cn } from "@/lib/utils"

// bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)]

export const LoginPlaceholder = () => {
  return (
    <div className="flex flex-col p-4 mx-auto my-8 w-full max-w-xl rounded border border-zinc-700">
      <h1 className="mb-4 text-xl text-white sm:text-2xl">Not logged in</h1>
      {/* <Link
        href='/login'
      > */}
      <div className="mr-auto">
        <Button
          variant='outline'
          onClick={async (e) => {
            await redirectToLoginTool();
          }}
        >
          Sign in
        </Button>
      {/* </Link> */}
      </div>
    </div>
  );
};