'use client';

import { useSupabase } from '@/lib/hooks/use-supabase'
import React, { useState } from 'react'
import { ProfileImage } from '@/components/account/profile-image'
import { Button } from '@/components/ui/button';


export interface ProfileProps {
  user: any
  userIsCurrentUser: boolean
}

export function Profile({ user, userIsCurrentUser }: ProfileProps) {
  const { supabase } = useSupabase()

  const [name, setName] = useState<string>(user.name);
  const [bio, setBio] = useState<string>(user.playerSpec.bio);

  const saveInfo = async () => {
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
    <div className="m-auto w-full max-w-4xl">
      <div className="sm:flex sm:flex-col sm:align-center py-2 md:py-4">
        <h1 className="text-2xl font-extrabold text-white sm:text-center sm:text-4xl">
          Profile
        </h1>
        <p className="max-w-2xl m-auto md:mt-4 text-lg text-zinc-200 sm:text-center sm:text-xl">
          Update your profile information.
        </p>
      </div>
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <div className="mt-5 mb-4 text-xl font-semibold flex">
            <ProfileImage user={user} userIsCurrentUser={userIsCurrentUser} />
            <div className='w-full'>
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
                value={bio}
                placeholder="Bio"
                onChange={e => setBio(e.target.value)}
              />
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
