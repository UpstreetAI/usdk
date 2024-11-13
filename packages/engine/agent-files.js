import { aiProxyHost } from './endpoints.js';
import { getCleanJwt } from './util.js';

export const uploadAiFile = async (blob, name) => {
  const jwt = getCleanJwt();
  const u = `https://${aiProxyHost}/api/ai/files`;
  const fd = new FormData();
  fd.append('purpose', 'assistants');
  fd.append('file', blob, name);
  const res = await fetch(u, {
    method: 'POST',
    body: fd,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const fileJson = await res.json();
  const { id } = fileJson;
  return id;
};
