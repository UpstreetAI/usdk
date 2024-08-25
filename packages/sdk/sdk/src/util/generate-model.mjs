import { aiProxyHost } from './endpoints.mjs';

export const generateModel = async (image, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const fd = new FormData();
  fd.append('image', image);
  const res = await fetch(`https://${aiProxyHost}/api/ai/3d/stable-fast-3d`, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${jwt}`,
    },

    body: fd,
  });
  // console.log('generate model req', res.ok, res.headers);
  if (res.ok) {
  // console.log('generate model blob 0');
    const blob = await res.blob();
    // console.log('generate model blob 2');
    return blob;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};