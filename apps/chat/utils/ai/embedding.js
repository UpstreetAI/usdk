import { aiProxyHost } from '../const/endpoints.js';
import { getJWT } from '@/lib/jwt'

const numRetries = 5;
export const embed = async (s, { signal, overridenJwt = null } = {}, ) => {
  const jwt = overridenJwt == null ? await getJWT() : overridenJwt;
  const fd = new FormData();
  fd.append('s', s);
  // for (let i = 0; i < numRetries; i++) {
  //   try {
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
  //   } catch (err) {
  //     if (signal?.aborted) {
  //       throw err;
  //     } else {
  //       console.warn(err);
  //     }
  //   }
  // }
  // throw new Error(`failed to embed after ${numRetries} retries`);
};

export const oembed = async (s, { signal, overridenJwt = null } = {}, ) => {
  const jwt = overridenJwt == null ? await getJWT() : overridenJwt;
  const body = {
    input: s,
    model: 'text-embedding-3-small',
  };
  // for (let i = 0; i < numRetries; i++) {
  //   try {
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
  //   } catch (err) {
  //     if (signal?.aborted) {
  //       throw err;
  //     } else {
  //       console.warn(err);
  //     }
  //   }
  // }
  // throw new Error(`failed to embed after ${numRetries} retries`);
};
export const lembed = async (s, { signal, overridenJwt = null } = {}, ) => {
  const jwt = overridenJwt == null ? await getJWT() : overridenJwt;
  const body = {
    input: s,
    model: 'text-embedding-3-large',
  }
  // for (let i = 0; i < numRetries; i++) {
  //   try {
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
    // } catch (err) {
    //   if (signal?.aborted) {
    //     throw err;
    //   } else {
    //     console.warn(err);
    //   }
    // }
  // }
  // throw new Error(`failed to embed after ${numRetries} retries`);
};

export const split = async (s, { signal } = {}) => {
  const jwt = await getJWT();
  const fd = new FormData();
  fd.append('s', s);
  // for (let i = 0; i < numRetries; i++) {
  //   try {
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
  //   } catch (err) {
  //     if (signal?.aborted) {
  //       throw err;
  //     } else {
  //       console.warn(err);
  //     }
  //   }
  // }
  // throw new Error(`failed to embed after ${numRetries} retries`);
};
