import { aiProxyHost } from './endpoints.js';
import { getCleanJwt } from './utils/jwt-util.js';
//

export const embeddingDimensions = 768;

// export const embeddingZeroVector = new Float32Array(embeddingDimensions);
export const embeddingZeroVector = Array(embeddingDimensions).fill(0);

const numRetries = 5;
export const embed = async (s, { signal, overridenJwt = null } = {}, ) => {
  const jwt = overridenJwt == null ? getCleanJwt() : overridenJwt;
  const fd = new FormData();
  fd.append('s', s);
  for (let i = 0; i < numRetries; i++) {
    try {
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
    } catch (err) {
      console.warn(err);
    }
  }
  throw new Error(`failed to embed after ${numRetries} retries`);
};

export const oembed = async (s, { signal, overridenJwt = null } = {}, ) => {
  const jwt = overridenJwt == null ? getCleanJwt() : overridenJwt;
  const body = {
    input: s,
    model: 'text-embedding-3-small',
  };
  for (let i = 0; i < numRetries; i++) {
    try {
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
    } catch (err) {
      console.warn(err);
    }
  }
  throw new Error(`failed to embed after ${numRetries} retries`);
};
export const lembed = async (s, { signal, overridenJwt = null } = {}, ) => {
  const jwt = overridenJwt == null ? getCleanJwt() : overridenJwt;
  const body = {
    input: s,
    model: 'text-embedding-3-large',
  }
  for (let i = 0; i < numRetries; i++) {
    try {
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
    } catch (err) {
      console.warn(err);
    }
  }
  throw new Error(`failed to embed after ${numRetries} retries`);
};

export const split = async (s, { signal } = {}) => {
  const jwt = getCleanJwt();
  const fd = new FormData();
  fd.append('s', s);
  for (let i = 0; i < numRetries; i++) {
    try {
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
    } catch (err) {
      console.warn(err);
    }
  }
  throw new Error(`failed to embed after ${numRetries} retries`);
};
