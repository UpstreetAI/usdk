import React from 'react';
import { redirect } from 'next/navigation';
import { routes } from '@/routes';
import { getUserAccount, getUserAccountPrivate, getCredits, getAgents, waitForUser, getCreditsUsageHistory } from '@/utils/supabase/server';
import { Tabs } from './tabs';
import { LoginRedirect } from '@/components/login-redirect';

export interface AccountProps {
  params: {
    id: string
  }
}

export async function AccountForm({
  id,
}: {
  id: string
}) {
  let user = null
  let userPrivate = null
  let credits = 0
  let creditsUsageHistory = null;
  let userIsCurrentUser = false

  const currentUser = await waitForUser();
  if (!currentUser) {
    // return redirect( routes.home )
    return null;
  }

  // Fetch agents with the linked credits_usage table data
  const agentsPromise = getAgents(id || currentUser.id, `
    *,
    credits_usage ( * )  
  `);

  // Display user for given ID if provided, else get current user.
  if (id) {
    user = await getUserAccount(id, 'name,id,playerSpec,preview_url')

    // Redirect if a user isn't found, otherwise check if it's the
    // logged-in user.
    if (!user) return redirect( routes.home )
    userIsCurrentUser = user?.id === currentUser.id
  } else {
    user = currentUser
    userIsCurrentUser = true
  }
  // load private data
  if (userIsCurrentUser) {
    [userPrivate, credits, creditsUsageHistory] = await Promise.all([
      getUserAccountPrivate(user.id, 'stripe_connect_account_id,stripe_subscription_id,plan'),
      getCredits(user.id),
      getCreditsUsageHistory(user.id)
    ]);
  }

  const agents = await agentsPromise;

  return (
    <div className="flex w-full flex-col flex-nowrap p-4 mx-auto max-w-4xl">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-14 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Welcome, {user?.name}
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            Credits Available: <span className='text-purple-500'>{Math.round(credits)}</span>
          </p>
        </div>
      </div>

      <Tabs user={user} creditsUsageHistory={creditsUsageHistory} userPrivate={userPrivate} agents={agents} userIsCurrentUser={userIsCurrentUser} />

    </div>
  );
}

export async function Account({ params: { id }}: AccountProps) {
  return (
    <>
      <LoginRedirect />
      <AccountForm id={id} />
    </>
  );
}
