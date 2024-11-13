'use client';

import React, { useState } from 'react';
import { getJWT } from '@/lib/jwt';
import { cn } from '@/lib/utils';
import { LoginButton } from '../ui/Header/login-button';
import { createSession, cancelPlan } from '@/lib/stripe';
import { environment } from '@/lib/env';
import { Button, Icon } from 'ucom';

export interface AccountPrivateUiProps {
  user: any;
  userPrivate: any;
}

const plans = [
  {
    name: 'free',
    value: 0,
    currency: `$`,
    interval: 'month',
  },
  {
    name: 'hobby',
    value: 20,
    currency: `$`,
    interval: 'month',
  },
  {
    name: 'developer',
    value: 50,
    currency: `$`,
    interval: 'month',
  },
  {
    name: 'business',
    value: 200,
    currency: `$`,
    interval: 'month',
  },
];
const creditUnit = 1000; // is multiplied by the value in plans array

const SubscriptionPlans = ({
  user,
  userPrivate,
  setUserPrivate,
}: {
  user: any;
  userPrivate: any;
  setUserPrivate: (userPrivate: any) => void;
}) => {
  const { plan: currentPlan }: { plan: string } = userPrivate;
  const [selectedPlan, setSelectedPlan] = useState(() => currentPlan);

  console.log(selectedPlan)

  return (
    <div>
      <div className="mt-4 md:mt-8 space-y-4 sm:mt-8 sm:space-y-0 md:flex md:flex-wrap justify-center gap-6 lg:mx-auto xl:max-w-none xl:mx-0">
        
        {currentPlan ? (
          <Button
            className="w-full mt-8"
            onClick={async (e) => {
              const jwt = await getJWT();
              await cancelPlan({
                environment,
                jwt,
              });
              setUserPrivate((userPrivate: object) => {
                return {
                  ...userPrivate,
                  stripe_subscription_id: null,
                  plan: null,
                };
              });
            }}
          >
            Cancel {currentPlan} Plan
          </Button>) : (
            <div className='w-full text-center text-xl text-zinc-800 bg-[#E4E8EF] p-4 opacity-[0.6]'>
              You don’t have any active subscription
            </div>
          )}


          <div className='w-full text-center text-xl text-zinc-800 font-bold'>
            Choose Your Subscription Plan
          </div>

        {plans.map((plan, i) => {
          const { name, currency, value, interval } = plan;

          const isFreePlan = !selectedPlan && name === 'free';

          return (
            <div
              key={i}
              className={cn(
                'flex flex-col shadow-sm divide-y divide-zinc-600 bg-zinc-100 border-[2px] border-zinc-800 relative',
                'flex-1',
                'basis-1/6',
                'md:max-w-xs'
              )}
            >
              <div style={{ backgroundImage: "url('/images/backgrounds/accounts/pattern-tile.png')", backgroundSize: "auto 100%" }} className='z-0 w-full h-full absolute top-0 left-0' />
              <div className="p-6 text-center text-zinc-800">
                <h2 className="text-2xl font-semibold leading-6 capitalize">
                  {name}
                </h2>
                <p className="mt-6 flex items-center justify-center text-zinc-800 font-bold text-4xl">
                  <Icon icon="Credits" className="size-12 text-[#00C0FF]" />{' '}
                  {value ? value * creditUnit : 5000}
                </p>
                {isFreePlan ? (
                  <Button className="w-full mt-8" disabled={true} variant="ghost">
                    Active
                  </Button>
                ) : (
                  <>
                    {value > 0 ? (
                      <Button
                        className="w-full mt-8"
                        disabled={currentPlan === name}
                        onClick={async (e) => {
                          const jwt = await getJWT();
                          const success_url = location.href;
                          const j = await createSession(
                            {
                              plan: name,
                              args: {
                                success_url,
                              },
                            },
                            {
                              environment,
                              jwt,
                            }
                          );
                          const { url } = j;
                          location.href = url;
                        }}
                      >
                        {currentPlan !== name ? 'Choose' : 'Current'}
                      </Button>
                    ) : (
                      <Button className="w-full mt-8" disabled={true} variant="ghost">
                        Active
                      </Button>
                    )
                    }
                  </>
                )}
                <p className="mt-8">
                  <span className="text-4xl font-bold">
                    {value > 0 ? `${currency}${value}` : '$0'}
                  </span>
                  <span className="text-base font-bold">
                    {value > 0 ? `/${interval}` : '/month'}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SubscriptionPlansPublic = () => {
  return (
    <div>
      <div className="mt-4 md:mt-8 space-y-4 sm:mt-8 sm:space-y-0 md:flex md:flex-wrap justify-center gap-6 lg:mx-auto xl:max-w-none xl:mx-0">
        {plans.map((plan, i) => {
          const { name, currency, value, interval } = plan;
          return (
            <div
              key={i}
              className={cn(
                'md:w-[25%] flex flex-col shadow-sm divide-y divide-zinc-600 bg-zinc-900 border rounded-md border-zinc-700',
                'flex-1',
                'basis-1/6',
                'md:max-w-xs'
              )}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6 text-white capitalize">
                  {name}
                </h2>
                <p className="mt-4 text-zinc-300">
                  {value ? value * creditUnit + ' Credits' : '5000 Credits'}
                </p>
                <p className="mt-8">
                  <span className="text-5xl font-extrabold white">
                    {value > 0 ? `${currency}${value}` : '$0'}
                  </span>
                  <span className="text-base font-medium text-zinc-100">
                    {value > 0 ? `/${interval}` : '/m'}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
        <div className="w-full text-center">
          <LoginButton className="text-xl">Login to you account to subscribe!</LoginButton>
        </div>
      </div>
    </div>
  );
};

const Subscriptions = ({
  user,
  userPrivate,
  setUserPrivate,
}: {
  user: any;
  userPrivate: any;
  setUserPrivate: (userPrivate: any) => void;
}) => {
  return (
    <>
      {user ? (
        <SubscriptionPlans
          user={user}
          userPrivate={userPrivate}
          setUserPrivate={setUserPrivate}
        />
      ) : (
        <SubscriptionPlansPublic />
      )}
    </>
  );
};

export function AccountSubscriptions({
  user,
  userPrivate: initUserPrivate,
}: AccountPrivateUiProps) {
  const [userPrivate, setUserPrivate] = useState(() => initUserPrivate);
  return (
    <div className="w-full">
      <Subscriptions
        user={user}
        userPrivate={userPrivate}
        setUserPrivate={setUserPrivate}
      />
    </div>
  );
}
