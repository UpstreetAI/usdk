import { Bio } from '@/components/account/bio'
import { Name } from '@/components/account/name'
import { ProfileImage } from '@/components/account/profile-image'
import { AccountPrivateUi } from './private-ui';
// import { EditableText } from '@/components/editable-text'
// import { env } from '@/lib/env'
// import { makeAnonymousClient } from '@/utils/supabase/supabase-client'
import React from 'react'
// import { Button } from '@/components/ui/button'
// import { IconEdit } from '@/components/ui/icons'
import { redirect } from 'next/navigation'
// import { resolveRelativeUrl } from '@/lib/utils'
import { routes } from '@/routes'
import { getUserAccount, getUserAccountPrivate, waitForUser } from '@/utils/supabase/server'


export interface AccountProps {
  params: {
    id: string
  }
}

export async function Account({ params: { id }}: AccountProps) {
  const currentUser = await waitForUser()

  let user = null
  let userPrivate = null
  let userIsCurrentUser = false

  // Display user for given ID if provided, else get current user.
  if (id) {
    user = await getUserAccount(id, 'name,id,playerSpec,preview_url')

    // Redirect if a user isn't found, otherwise check if it's the
    // logged-in user.
    if (!user) redirect( routes.home )
    userIsCurrentUser = user?.id === currentUser.id
  } else {
    user = currentUser
    userIsCurrentUser = true
  }

  if (userIsCurrentUser) {
    userPrivate = await getUserAccountPrivate(user.id, 'stripe_connect_account_id')
  }

  return (
    <div className="flex flex-col flex-nowrap p-4">
      <ProfileImage user={user} userIsCurrentUser={userIsCurrentUser} />
      <Name user={user} userIsCurrentUser={userIsCurrentUser} />
      <Bio user={user} userIsCurrentUser={userIsCurrentUser} />
      {userIsCurrentUser && <AccountPrivateUi
        user={user}
        userPrivate={userPrivate}
      />}

      {/*<div className="whitespace-pre-wrap">
        {JSON.stringify( user, null, ' ' )}
      </div>*/}
    </div>
  );
}
