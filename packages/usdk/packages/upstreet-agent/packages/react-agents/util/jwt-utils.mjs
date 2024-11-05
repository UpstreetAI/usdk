import {
  authHost,
} from './endpoints.mjs';

export const getAgentToken = async (jwt, guid) => {
  const jwtRes = await fetch(`${authHost}/agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      agentId: guid,
      supabaseJwt: jwt,
    }),
  });
  if (jwtRes.ok) {
    return jwtRes.json();
  } else {
    const text = await jwtRes.text();
    console.warn(`Failed to get agent token: ${text}`);
    throw new Error(`Failed to get agent token: ${text}`);
  }
};