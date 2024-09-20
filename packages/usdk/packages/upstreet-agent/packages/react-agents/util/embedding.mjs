import { aiProxyHost } from './endpoints.mjs';
import {
  retry,
} from './util.mjs';

const numRetries = 3;
export const embed = async (s, opts) => {
  const { signal, jwt } = opts;
  if (!jwt) {
    throw new Error('no jwt');
  }

  return await retry(async () => {
    const fd = new FormData();
    fd.append('s', s);
    const url = `https://${aiProxyHost}/embedding`;
    const fetchData = {
      method: 'POST',
      body: fd,
      signal,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
    const res = await fetch(url, fetchData);
    if (res.ok) {
      const j = await res.json();
      return j;
    } else {
      throw new Error(`invalid embed response: ${res.status}`);
    }
  }, numRetries);
};

export const oembed = async (s, opts) => {
  const { signal, jwt } = opts;
  if (!jwt) {
    throw new Error('no jwt');
  }

  return await retry(async () => {
    const body = {
      input: s,
      model: 'text-embedding-3-small',
    };
    const url = `https://${aiProxyHost}/api/ai/embeddings`;
    const fetchData = {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
    const res = await fetch(url, fetchData);
    if (res.ok) {
      const j = await res.json();
      const data = j.data;
      if (data && data.length) {
        return data[0].embedding;
      }
    } else {
      throw new Error(`invalid embed response: ${res.status}`);
    }
  }, numRetries);
};
export const lembed = async (s, opts) => {
  const { signal, jwt } = opts;
  if (!jwt) {
    throw new Error('no jwt');
  }

  return await retry(async () => {
    const body = {
      input: s,
      model: 'text-embedding-3-large',
    }
    const url = `https://${aiProxyHost}/api/ai/embeddings`;
    const fetchData = {
      method: 'POST',
      body: JSON.stringify(body),
      signal,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
    const res = await fetch(url, fetchData);
    if (res.ok) {
      const j = await res.json();
      const data = j.data;
      if (data && data.length) {
        return data[0].embedding;
      }
    } else {
      throw new Error(`invalid embed response: ${res.status}`);
    }
  }, numRetries);
};

/* export const split = async (s, opts) => {
  const { signal, jwt } = opts;
  if (!jwt) {
    throw new Error('no jwt');
  }

  const fd = new FormData();
  fd.append('s', s);
  const res = await fetch(`https://${aiProxyHost}/split`, {
    method: 'POST',
    body: fd,
    signal,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    return j;
  } else {
    throw new Error(`invalid split response: ${res.status}`);
  }
}; */
