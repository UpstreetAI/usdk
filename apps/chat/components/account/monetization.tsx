'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { aiHost } from '@/utils/const/endpoints';
import React, { useState } from 'react'
import { getJWT } from '@/lib/jwt';

//

export interface MonetizationProps {
  userPrivate: any
}

//

const devSuffix = `_test`;

const StripeConnect = ({
  userPrivate,
  setUserPrivate,
}: {
  userPrivate: any,
  setUserPrivate: (userPrivate: any) => void;
}) => {
  const {
    stripe_connect_account_id,
  } = userPrivate;

  return (
    <div className="flex flex-col m-auto w-full max-w-4xl mt-16">
      <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
        Agent Monetization
      </h1>
      <p className="max-w-2xl m-auto mt-5 text-xl text-zinc-200 sm:text-center sm:text-2xl">
        Earn money from your agents.
      </p>
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

                  const jwt = await getJWT();
                  const res = await fetch(`${aiHost}/stripe${devSuffix}/account`, {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${jwt}`,
                    },
                  });
                  if (res.ok) {
                    const j = await res.json();
                    console.log('created account', j);

                    const return_url = new URL(`${aiHost}/stripe${devSuffix}/account/redirect`);
                    return_url.searchParams.set('stripe_connect_account_id', j.account);
                    return_url.searchParams.set('redirect_url', window.location.href);
                    const refresh_url = return_url;
                    
                    const res2 = await fetch(`${aiHost}/stripe${devSuffix}/account_link`, {
                      method: "POST",
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${jwt}`,
                      },
                      body: JSON.stringify({
                        account: j.account,
                        return_url,
                        refresh_url,
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
          </div>
          <div className="p-4 border-t rounded-b-md border-zinc-700 text-zinc-500">
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
              <p className="pb-4 sm:pb-0">Connected stripe account: {stripe_connect_account_id}</p>
              <Button
                onClick={async () => {
                  // stripe connect
                  console.log('stripe disconnect');

                  const jwt = await getJWT();
                  const res = await fetch(`${aiHost}/stripe${devSuffix}/account`, {
                    method: 'DELETE',
                    headers: {
                      Authorization: `Bearer ${jwt}`,
                    },
                  });
                  if (res.ok) {
                    const blob = await res.blob();
                    // console.log('got blob', blob);
                    console.log('disconnected stripe account');
                  } else {
                    console.warn(`invalid status code: ${res.status}`);
                  }

                  setUserPrivate((userPrivate: object) => {
                    return {
                      ...userPrivate,
                      stripe_connect_account_id: null,
                    };
                  });
                }}
              >
                Disconnect Stripe
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export function Monetization({
  userPrivate: initUserPrivate,
}: MonetizationProps) {
  const [userPrivate, setUserPrivate] = useState(() => initUserPrivate);
  return (
    <div className='w-full md:w-[900px]'>
      <StripeConnect userPrivate={userPrivate} setUserPrivate={setUserPrivate} />
    </div>
  );
}
