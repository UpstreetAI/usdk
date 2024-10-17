import {
  authHost,
} from './endpoints.mjs';

export const isGuid = (guid) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(guid);
};
export const createAgentGuid = async ({
  jwt,
}) => {
  const res = await fetch(`${authHost}/createAgentGuid`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      supabaseJwt: jwt,
    }),
  });
  if (res.ok) {
    const j = await res.json();
    const {
      agentId,
    } = j;
    return agentId;
  } else {
    throw new Error('failed to create agent guid: ' + res.status);
  }
};
