'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { aiHost } from '@/utils/const/endpoints';
import React, { useState } from 'react'
import { getJWT } from '@/lib/jwt';
import { cn } from '@/lib/utils'

//

export interface AccountPrivateUiProps {
  user: any
  userPrivate: any
}

//

const devSuffix = `_test`;
const plans = [
  {
    name: 'free',
    value: 0,
    currency: `$`,
    interval: 'mo'
  },
  {
    name: 'hobby',
    value: 20,
    currency: `$`,
    interval: 'mo'
  },
  {
    name: 'developer',
    value: 50,
    currency: `$`,
    interval: 'mo'
  },
  {
    name: 'business',
    value: 200,
    currency: `$`,
    interval: 'mo'
  },
];
const creditUnit = 1000; // is multiplied by the value in plans array

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
      <div className="mt-8 space-y-4 sm:mt-8 sm:space-y-0 flex flex-wrap justify-center gap-6 lg:mx-auto xl:max-w-none xl:mx-0">
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
                  'border border-pink-500': name === selectedPlan || !selectedPlan && name === 'free',
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
                    {value > 0 ? `${currency}${value}` : '\xa0'}
                  </span>
                  <span className="text-base font-medium text-zinc-100">
                    {value > 0 ? `/${interval}` : '\xa0'}
                  </span>
                </p>
                {value > 0 ?
                  <Button
                    className='w-full mt-8'
                    disabled={currentPlan === name}
                    onClick={async (e) => {
                      // create the checkout session
                      const jwt = await getJWT();
                      
                      // const success_url_object = new URL(`${aiHost}/plans/redirect`);
                      // success_url_object.searchParams.set('stripe_session_id', 'CHECKOUT_SESSION_ID');
                      // success_url_object.searchParams.set('redirect_url', location.href);
                      // const success_url = (success_url_object + '').replace('CHECKOUT_SESSION_ID', '{CHECKOUT_SESSION_ID}');
                      const success_url = location.href;

                      const res = await fetch(`${aiHost}/stripe${devSuffix}/checkout/session`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${jwt}`,
                        },
                        body: JSON.stringify({
                          plan: name,
                          args: {
                            success_url,
                          },
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
                  (currentPlan && <Button
                    className='w-full mt-8'
                    onClick={async (e) => {
                      // cancel the plan
                      const jwt = await getJWT();
                      const res = await fetch(`${aiHost}/plans${devSuffix}`, {
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
                        const text = await res.text();
                        console.warn('failed to create checkout session:', res.status, text);
                      }
                    }}
                  >
                    Cancel
                  </Button>)
                }
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Subscriptions = ({
  user,
  userPrivate,
  setUserPrivate,
}: {
  user: any,
  userPrivate: any,
  setUserPrivate: (userPrivate: any) => void;
}) => {
  return (
    <>
      <div className="sm:flex sm:flex-col sm:align-center py-2 md:py-4">
        <h1 className="text-2xl font-extrabold text-white sm:text-center sm:text-4xl">
          Subscription Plans
        </h1>
        <p className="max-w-2xl m-auto md:mt-4 text-lg text-zinc-200 sm:text-center sm:text-xl">
          Subscribe to a plan to get monthly credits.
        </p>
      </div>
      <SubscriptionPlans user={user} userPrivate={userPrivate} setUserPrivate={setUserPrivate} />
    </>
  );
}

export function AccountSubscriptions({
  user,
  userPrivate: initUserPrivate,
}: AccountPrivateUiProps) {
  const [userPrivate, setUserPrivate] = useState(() => initUserPrivate);
  return (
    <div className='w-full'>
      <Subscriptions user={user} userPrivate={userPrivate} setUserPrivate={setUserPrivate} />
    </div>
  );
}
