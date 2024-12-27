import { aiHost, authHost } from './endpoints.mjs';
import { aiProxyAPI } from '../api.mjs';

export const getTokenFromRequest = (request) => {
  let authHeader;
  if (request.headers.get) {
    authHeader = request.headers.get('authorization');
  } else {
    authHeader = request.headers['authorization'];
  }

  const match = authHeader?.match(/^Bearer\s+(.*)$/i);
  if (match) {
    return match[1];
  } else {
    return '';
  }
};

export const getUserIdForJwt = async (jwt) => {
  const res = await fetch(`${aiHost}/checkLogin`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    return j.userId;
  } else {
    const text = await res.text();
    // console.warn('getUserIdForJwt: ' + text);
    return null;
  }
};
export const getUserForJwt = async (jwt, {
  private: _private = false,
} = {}) => {
  const u = new URL(aiProxyAPI.getUser);
  _private && u.searchParams.set('private', true + '');
  const res = await fetch(u, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    return j.data;
  } else {
    const text = await res.text();
    throw new Error('getUserForJwt error: ' + res.status + ' : ' + text);
  }
};

// generate an agent-specific token
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