/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client'

import { useSupabase } from '@/lib/hooks/use-supabase'
import React, { useState } from 'react'
import { ProfileImage } from '@/components/account/profile-image'
import { Button } from '../ui/Button'


export interface InfoProps {
  user: any
  userIsCurrentUser: boolean
}

export function Info({ user, userIsCurrentUser }: InfoProps) {
  const { supabase } = useSupabase()

  const [name, setName] = useState<string>(user.name);
  const [bio, setBio] = useState<string>(user.playerSpec.bio);

  const saveInfo = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const { error } = await supabase
      .from('accounts')
      .update({
        playerSpec: {
          ...user.playerSpec,
          bio,
        },
        name
      })
      .eq('id', user.id);

    if (error) {
      console.error(error)
    } else {
      location.reload()
    }
  }

  return (
    <div className="flex m-auto w-full max-w-4xl">
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <h3 className="mb-1 text-2xl font-medium">Personal Info</h3>
          <p className="text-zinc-300">Your personal information, including your name, bio, and image, will be used during interactions with agents and other users. This helps create a personalized and tailored experience.</p>
          <div className="mt-8 mb-4 text-xl font-semibold flex">
            <ProfileImage user={user} userIsCurrentUser={userIsCurrentUser} />
            <div>
              <input
                type="text"
                name="fullName"
                className="w-full p-3 rounded-md bg-zinc-800 mb-2"
                placeholder="Display name"
                maxLength={64}
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <textarea
                name="fullName"
                className="w-full h-32 p-3 rounded-md bg-zinc-800 text-sm"
                placeholder="Bio"
                onChange={e => setBio(e.target.value)}
              >
                {bio}
              </textarea>
            </div>
          </div>
        </div>
        <div className="p-4 border-t rounded-b-md border-zinc-700 text-zinc-500">
          <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="pb-4 sm:pb-0">64 characters maximum</p>
          <Button
            onClick={saveInfo}
          >
            Save Info
          </Button>
        </div>
        </div>
      </div>


    </div>

  )
}
