import {
  metamaskHost,
} from './endpoints.mjs';

export const getAgentToken = async (jwt, guid) => {
  const jwtRes = await fetch(`${metamaskHost}/agent`, {
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

export const getCleanJwt = () => {
  if (typeof localStorage === 'undefined') {
    return '';
  }

  let jwt = localStorage.getItem('jwt');
  jwt = jwt.slice(1, jwt.length - 1);
  return jwt;
};