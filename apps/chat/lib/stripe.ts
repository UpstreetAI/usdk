import { aiHost } from './endpoints.mjs';
import { getStripeProxyUrl } from 'react-agents/util/stripe-utils.mjs';

export const createSession = async (opts, {
  environment,
  jwt,
}: {
  environment: string;
  jwt: string;
}) => {
  if (!environment) {
    throw new Error('no environment');
  }
  if (!jwt) {
    throw new Error('no jwt');
  }

  const u = getStripeProxyUrl(environment);
  const res = await fetch(`${u}/checkout/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(opts),
  });
  if (res.ok) {
    const j = await res.json();
    return j;
  } else {
    const text = await res.text();
    throw new Error(`failed to create checkout session: ${res.status}: + ${text}`);
  }
};

export const cancelPlan = async ({
  environment,
  jwt,
}: {
  environment: string;
  jwt: string;
}) => {
  if (!environment) {
    throw new Error('no environment');
  }
  if (!jwt) {
    throw new Error('no jwt');
  }

  const u = getStripeProxyUrl(environment);
  const res = await fetch(`${aiHost}/plans${stripeDevSuffix}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    console.log('got cancel result', j);
  } else {
    const text = await res.text();
    console.warn('failed to create checkout session:', res.status, text);
  }
};