import { getCleanJwt } from './jwt-util.mjs';
import { aiProxyHost } from './endpoints.mjs';

const numRetries = 5;
export const lembed = async (s, { signal, overridenJwt = null } = {}) => {
  const jwt = overridenJwt == null ? getCleanJwt() : overridenJwt;
  const body = {
    input: s,
    model: 'text-embedding-3-large',
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
        const text = await res.text();
        throw new Error(`invalid embed response: ${res.status} : ${text} : ${JSON.stringify(fetchData)}`);
      }
    } catch (err) {
      console.warn(err);
    }
  }
  throw new Error(`failed to embed after ${numRetries} retries`);
};