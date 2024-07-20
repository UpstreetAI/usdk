'use client';

// import { Bio } from '@/components/account/bio'
// import { Name } from '@/components/account/name'
// import { ProfileImage } from '@/components/account/profile-image'
import { Button, type ButtonProps } from '@/components/ui/button'
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
    label: `$20/mo`
  },
  {
    price: 'price_1PeZLaGQNhufWPO8830LJKJg',
    name: 'developer',
    label: `$50/mo`
  },
  {
    price: 'price_1PeZLmGQNhufWPO8OgwLkWlH',
    name: 'business',
    label: `$200/mo`
  },
];

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
      <div>Subscription Plans</div>
      <div className="flex">
        {plans.map((plan, i) => {
          const {
            name,
            label,
          } = plan;
          return (
            <Button
              variant="outline"
              className={cn("cursor-pointer", name === selectedPlan && 'bg-primary/10')}
              onClick={e => {
                setSelectedPlan(name);
              }}
              key={i}
            >
              {capitalize(name)} - {label}
            </Button>
          );
        })}
      </div>
      <Button
        variant="outline"
        disabled={selectedPlan === currentPlan}
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
              plan: selectedPlan,
              success_url: location.href,
            }),
          });
          if (res.ok) {
            const j = await res.json();
            const {
              id,
              url,
            } = j;
            // console.log('got res', j);
            location.href = url;
          } else {
            console.warn('failed to create checkout session:', res.status);
          }
          // regex: /^\/stripe\/checkout\/session$/,
          // async fn({ req, res, env }) {
          //   const j = await req.json();
          //   const { plan, success_url } = j;
        }}
      >Update plan</Button>
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
    <>
    {!stripe_connect_account_id ? (
      <>
        <div>Stripe connect</div>
        <Button
          variant="outline"
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
          // disabled={isLoading}
          // className={cn(className)}
          // {...props}
        >
          Connect Stripe 
        </Button>
      </>
    ) : (
      <div>
        <div>Connected stripe account: {stripe_connect_account_id}</div>
        <Button
          variant="outline"
          onClick={() => {
            // stripe connect
            console.log('stripe disconnect');

            // setIsLoading(true)
            // // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
            // signIn('github', { callbackUrl: `/` })
          }}
          // disabled={isLoading}
          // className={cn(className)}
          // {...props}
        >
          Disonnect Stripe
        </Button>
      </div>
    )}

      {/*<div className="whitespace-pre-wrap">
        {JSON.stringify( user, null, ' ' )}
      </div>*/}
    </>
  );
};

export function AccountPrivateUi({
  user,
  userPrivate,
}: AccountPrivateUiProps) {
  return (
    <>
      <SubscriptionPlans user={user} userPrivate={userPrivate} />
      <StripeConnectButtons user={user} userPrivate={userPrivate} />
    </>
  );
}
