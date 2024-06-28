import { Bio } from '@/components/account/bio'
import { Name } from '@/components/account/name'
import { ProfileImage } from '@/components/account/profile-image'
import React from 'react'
import { redirect } from 'next/navigation'
import { routes } from '@/routes'
import { getUserAccount, waitForUser } from '@/utils/supabase/server'


export interface AccountProps {
  params: {
    id: string
  }
}

export async function Account({ params: { id }}: AccountProps) {
  const currentUser = await waitForUser()

  let user
  let userIsCurrentUser = false

  // Display user for given ID if provided, else get current user.
  if (id) {
    user = await getUserAccount(id, 'name,id,playerSpec,preview_url')
    userIsCurrentUser = user?.id === currentUser.id
  } else {
    user = currentUser
    userIsCurrentUser = true
  }

  // Redirect if a user isn't found, otherwise check if it's the
  // logged-in user.
  if (!user) redirect( routes.home )

  return user ? (
    <div className="flex p-4 max-w-2xl mx-auto mt-8">
      <div>
        <ProfileImage user={user} userIsCurrentUser={userIsCurrentUser} />
      </div>
      <div>
        <Name user={user} userIsCurrentUser={userIsCurrentUser} />
        <Bio user={user} userIsCurrentUser={userIsCurrentUser} />
      </div>
    </div>
  ) : null;
}
