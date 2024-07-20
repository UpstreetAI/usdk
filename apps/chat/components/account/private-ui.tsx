'use client';

// import { Bio } from '@/components/account/bio'
// import { Name } from '@/components/account/name'
// import { ProfileImage } from '@/components/account/profile-image'
import { Button, type ButtonProps } from '@/components/ui/button';
import { aiHost } from '@/utils/const/endpoints';
// import { EditableText } from '@/components/editable-text'
// import { env } from '@/lib/env'
// import { makeAnonymousClient } from '@/utils/supabase/supabase-client'
import React, { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { IconEdit } from '@/components/ui/icons'
// import { redirect } from 'next/navigation'
// import { resolveRelativeUrl } from '@/lib/utils'
// import { routes } from '@/routes'
// import { getUserAccount, getUserAccountPrivate, waitForUser } from '@/utils/supabase/server'
import { cn } from '@/lib/utils'
import { getJWT } from '@/lib/jwt';

//

export interface AccountPrivateUiProps {
  user: any
  userPrivate: any
}

//

const plans = [
  {
    price: 'price_1PeZL6GQNhufWPO8mlI4H88D',
    name: 'hobby',
    value: 5,
    currency: `$`,
    interval: 'mo'
  },
  {
    price: 'price_1PeZLaGQNhufWPO8830LJKJg',
    name: 'pro',
    value: 25,
    currency: `$`,
    interval: 'mo'
  },
  {
    price: 'price_1PeZLmGQNhufWPO8OgwLkWlH',
    name: 'advanced',
    value: 150,
    currency: `$`,
    interval: 'mo'
  }
];

//

const creditUnit = 1000; // is multiplied by the value in plans array

//

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const SubscriptionPlans = ({
  user,
  userPrivate,
}: AccountPrivateUiProps) => {
  const {
    plan: currentPlan,
  }: {
    plan: string;
  } = userPrivate;
  const [selectedPlan, setSelectedPlan] = useState(() => currentPlan);

  return (
    <div>
      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 flex flex-wrap justify-center gap-6 lg:mx-auto xl:max-w-none xl:mx-0">
        {plans.map((plan, i) => {
          const {
            name,
            currency,
            value,
            interval
          } = plan;
          return (
            <div
              key={i}
              className={cn(
                'flex flex-col shadow-sm divide-y divide-zinc-600 bg-zinc-900 border rounded-md border-zinc-700',
                {
                  'border border-pink-500': name === selectedPlan
                },
                'flex-1',
                'basis-1/4',
                'max-w-xs'
              )}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6 text-white capitalize">
                  {name}
                </h2>
                <p className="mt-4 text-zinc-300">{value * creditUnit} Credits</p>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold white">
                    {currency}{value}
                  </span>
                  <span className="text-base font-medium text-zinc-100">
                    /{interval}
                  </span>
                </p>
                {currentPlan !== name ? (
                  <Button
                    className='w-full mt-8'
                    onClick={async (e) => {
                      // create the checkout session
                      const jwt = await getJWT();
                      const res = await fetch(`${aiHost}/stripe/checkout/session`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${jwt}`,
                        },
                        body: JSON.stringify({
                          plan: name,
                          success_url: location.href,
                        }),
                      });
                      if (res.ok) {
                        const j = await res.json();
                        const {
                          id,
                          url,
                        } = j;
                        location.href = url;
                      } else {
                        console.warn('failed to create checkout session:', res.status);
                      }
                    }}
                  >
                    Subscribe
                  </Button>
                ) : (
                  <Button
                    className='w-full mt-8'
                  >
                    Manage
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StripeConnectButtons = ({
  user,
  userPrivate,
}: AccountPrivateUiProps) => {
  const {
    stripe_connect_account_id,
  } = userPrivate;

  return (
    <div className="flex m-auto w-full max-w-4xl mt-8">
      {!stripe_connect_account_id ? (
        <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
          <div className="px-5 py-4">
            <h3 className="mb-1 text-2xl font-medium">Stripe connect</h3>
            <p className="text-zinc-300">No stripe account connected.</p>
          </div>
          <div className="p-4 border-t rounded-b-md border-zinc-700 text-zinc-500">
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">Connect to your stripe account</p>
              <Button
                onClick={async () => {
                  // stripe connect
                  console.log('stripe connect');

                  const res = await fetch(`${aiHost}/stripe/account`, {
                    method: 'POST',
                  });
                  if (res.ok) {
                    const j = await res.json();
                    console.log('created account', j);

                    const res2 = await fetch(`${aiHost}/stripe/account_link`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        account: j.account,
                        return_url: `${window.location.origin}`,
                        refresh_url: `${window.location.origin}`,
                      }),
                    })
                    if (res2.ok) {
                      const j = await res2.json();
                      const { url, error } = j;
                      if (!error) {
                        window.location.href = url;
                      } else {
                        console.warn(error);
                      }
                    } else {
                      console.warn('failed to create account link:', res2.status);
                    }
                  } else {
                    console.warn('failed to create account:', res.status);
                  }

                  // setIsLoading(true)
                  // // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
                  // signIn('github', { callbackUrl: `/` })
                }}
              >
                Connect Stripe
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
          <div className="px-5 py-4">
            <h3 className="mb-1 text-2xl font-medium">Stripe connect</h3>
            <p className="text-zinc-300">Connected stripe account: {stripe_connect_account_id}</p>
          </div>
          <div className="p-4 border-t rounded-b-md border-zinc-700 text-zinc-500">
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">Connect to your stripe account</p>
              <Button
                onClick={() => {
                  // stripe connect
                  console.log('stripe disconnect');

                  // setIsLoading(true)
                  // // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
                  // signIn('github', { callbackUrl: `/` })
                }}
              >
                Disonnect Stripe
              </Button>
            </div>
          </div>
        </div>
      )}

      {/*<div className="whitespace-pre-wrap">
        {JSON.stringify( user, null, ' ' )}
      </div>*/}

    </div>
  );
};

export function AccountPrivateUi({
  user,
  userPrivate,
}: AccountPrivateUiProps) {
  return (
    <>
      <div className="sm:flex sm:flex-col sm:align-center pt-8">
        <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
          Subscription Plans
        </h1>
        <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
          Subscribe to a plan to get monthly credits.
        </p>
      </div>
      <SubscriptionPlans user={user} userPrivate={userPrivate} />
      <StripeConnectButtons user={user} userPrivate={userPrivate} />
    </>
  );
}
