import { aiHost } from './endpoints.mjs';

const devSuffix = `_test`;

export const createSession = async (opts, {
  jwt,
}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const res = await fetch(`${aiHost}/stripe${devSuffix}/checkout/session`, {
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
  jwt,
}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

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
  } else {
    const text = await res.text();
    console.warn('failed to create checkout session:', res.status, text);
  }
};