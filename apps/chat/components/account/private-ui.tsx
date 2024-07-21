'use client';

// import { Bio } from '@/components/account/bio'
// import { Name } from '@/components/account/name'
// import { ProfileImage } from '@/components/account/profile-image'
import { Button, type ButtonProps } from '@/components/ui/button';
import { aiHost } from '@/utils/const/endpoints';
// import { EditableText } from '@/components/editable-text'
// import { env } from '@/lib/env'
import React, { useEffect, useState, useMemo } from 'react'
// import { Button } from '@/components/ui/button'
// import { IconEdit } from '@/components/ui/icons'
// import { redirect } from 'next/navigation'
// import { resolveRelativeUrl } from '@/lib/utils'
// import { routes } from '@/routes'
// import { getUserAccount, getUserAccountPrivate, waitForUser } from '@/utils/supabase/server'
import { env } from '@/lib/env'
import { getJWT } from '@/lib/jwt';
import { makeAnonymousClient } from '@/utils/supabase/supabase-client'
import { cn } from '@/lib/utils'

//

export interface AccountPrivateUiProps {
  user: any
  userPrivate: any
}

//

const plans = [
  {
    price: null,
    name: 'free',
    value: 0,
    currency: `$`,
    interval: 'mo'
  },
  {
    price: 'price_1PeZL6GQNhufWPO8mlI4H88D',
    name: 'hobby',
    value: 20,
    currency: `$`,
    interval: 'mo'
  },
  {
    price: 'price_1PeZLaGQNhufWPO8830LJKJg',
    name: 'developer',
    value: 50,
    currency: `$`,
    interval: 'mo'
  },
  {
    price: 'price_1PeZLmGQNhufWPO8OgwLkWlH',
    name: 'business',
    value: 200,
    currency: `$`,
    interval: 'mo'
  },
];

//

const creditUnit = 1000; // is multiplied by the value in plans array
const useStripeSubscription = () => {
  const u = new URL(location.href);
  const id = u.searchParams.get('stripe_subscription_id');
  const plan = u.searchParams.get('plan');
  if (id) {
    return {
      id,
      plan,
    };
  } else {
    return null;
  }
};

//

const SubscriptionPlans = ({
  user,
  userPrivate,
  setUserPrivate,
}: {
  user: any;
  userPrivate: any;
  setUserPrivate: (userPrivate: any) => void;
}) => {
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
            price,
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
                  'border border-pink-500': name === selectedPlan,
                },
                'flex-1',
                'basis-1/6',
                'max-w-xs'
              )}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6 text-white capitalize">
                  {name}
                </h2>
                <p className="mt-4 text-zinc-300">{value ? (value * creditUnit) + ' Credits' : '\xa0'}</p>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold white">
                    {currency}{value}
                  </span>
                  <span className="text-base font-medium text-zinc-100">
                    /{interval}
                  </span>
                </p>
                {price ?
                  <Button
                    className='w-full mt-8'
                    disabled={currentPlan === name}
                    onClick={async (e) => {
                      // create the checkout session
                      const jwt = await getJWT();
                      
                      const success_url_object = new URL(`${aiHost}/plans/redirect`);
                      success_url_object.searchParams.set('stripe_session_id', 'CHECKOUT_SESSION_ID');
                      success_url_object.searchParams.set('redirect_url', location.href);
                      const success_url = (success_url_object + '').replace('CHECKOUT_SESSION_ID', '{CHECKOUT_SESSION_ID}');
                      
                      const res = await fetch(`${aiHost}/stripe/checkout/session`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${jwt}`,
                        },
                        body: JSON.stringify({
                          plan: name,
                          success_url,
                        }),
                      });
                      if (res.ok) {
                        const j = await res.json();
                        const {
                          id,
                          url,
                        } = j;
                        // console.log('got checkout session:', j);
                        location.href = url;
                      } else {
                        console.warn('failed to create checkout session:', res.status);
                      }
                    }}
                  >
                    {currentPlan !== name ? 'Subscribe' : 'Current'}
                  </Button>
                :
                  <Button
                    className='w-full mt-8'
                    disabled={!currentPlan}
                    onClick={async (e) => {
                      // cancel the plan
                      const jwt = await getJWT();
                      const res = await fetch(`${aiHost}/plans`, {
                        method: 'DELETE',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${jwt}`,
                        },
                      });
                      if (res.ok) {
                        const j = await res.json();
                        console.log('got cancel result', j);

                        setUserPrivate((userPrivate: object) => {
                          return {
                            ...userPrivate,
                            stripe_subscription_id: null,
                            plan: null,
                          };
                        });
                        // const {
                        //   id,
                        //   url,
                        // } = j;
                        // location.href = url;
                      } else {
                        console.warn('failed to create checkout session:', res.status);
                      }
                    }}
                  >
                    Cancel
                  </Button>
                }
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
  userPrivate: initUserPrivate,
}: AccountPrivateUiProps) {
  const [userPrivate, setUserPrivate] = useState(() => initUserPrivate);

  // console.log('load user private', userPrivate);

  const stripeSubscription = useStripeSubscription();
  useEffect(() => {
    if (stripeSubscription) {
      console.log('got stripe subscription', stripeSubscription);
      const {
        id: stripeSubscriptionId,
        plan,
      } = stripeSubscription;
      (async () => {
        const jwt = await getJWT();
        const supabase = makeAnonymousClient(env, jwt);
        await supabase
          .from('accounts_private')
          .update({
            stripe_subscription_id: stripeSubscriptionId,
            plan,
          })
          .eq('id', user.id);

        setUserPrivate((userPrivate: object) => {
          return {
            ...userPrivate,
            stripe_subscription_id: stripeSubscriptionId,
            plan,
          };
        });

       history.replaceState(null, '', location.pathname);
      })();
    }
  }, [stripeSubscription?.id]);

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
      <SubscriptionPlans user={user} userPrivate={userPrivate} setUserPrivate={setUserPrivate} />
      <StripeConnectButtons user={user} userPrivate={userPrivate} />
    </>
  );
}
