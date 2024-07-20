import { env } from '@/lib/env'
import { makeAnonymousClient } from '@/utils/supabase/supabase-client'
import React from 'react'
import { redirect } from 'next/navigation'
import { routes } from '@/routes'
import { getUserAccount, waitForUser } from '@/utils/supabase/server'
import CustomerPortalForm from '@/components/ui/AccountForms/CustomerPortalForm';
import EmailForm from '@/components/ui/AccountForms/EmailForm';
import NameForm from '@/components/ui/AccountForms/NameForm';

export interface AccountProps {
  params: {
    id: string
  }
}

export async function Account({ params: { id }}: AccountProps) {
  const currentUser = await waitForUser()
  const supabase = makeAnonymousClient(env);

  let user;
  let userIsCurrentUser = false;

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

  const { data: subscription, error } = await supabase
    .from('up_subscriptions')
    .select('*, up_prices(*, up_products(*))')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.log(error);
  }

  if (!user) {
    return redirect('/signin');
  }

  console.log("Subscription: ", subscription);


  return (
    <section className="mb-32">
      <div className="max-w-6xl px-4 py-8 mx-auto sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-2xl font-bold text-white sm:text-center sm:text-6xl">
            Account
          </h1>
          <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
            We partnered with Stripe for a simplified billing.
          </p>
        </div>
      </div>
      <div className="p-4">
        <CustomerPortalForm subscription={subscription} />
        {/* <NameForm userName={userDetails?.full_name ?? ''} /> */}
        {/* <EmailForm userEmail={user.email} /> */}
      </div>
    </section>
  );


  // return (
  //   <div className="flex flex-col flex-nowrap p-4">
  //     <ProfileImage user={user} userIsCurrentUser={userIsCurrentUser} />
  //     <Name user={user} userIsCurrentUser={userIsCurrentUser} />
  //     <Bio user={user} userIsCurrentUser={userIsCurrentUser} />

  //     {/*<div className="whitespace-pre-wrap">
  //       {JSON.stringify( user, null, ' ' )}
  //     </div>*/}
  //   </div>
  // );
}