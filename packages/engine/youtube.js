import { aiProxyHost } from './endpoints.js';
import { getCleanJwt } from './utils/jwt-util.js';

//

export const importYoutubeAudio = async (url) => {
  const jwt = getCleanJwt();
  const u = new URL(`https://${aiProxyHost}/api/youtube`);
  u.searchParams.set('url', url);
  u.searchParams.set('type', 'audio');
  const numRetries = 3;
  for (let i = 0; i < numRetries; i++) {
    const res = await fetch(u, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      // method: 'POST',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      // body: JSON.stringify(j),
    });

    let title = res.headers.get('X-Title');
    title = decodeURIComponent(title);

    let description = res.headers.get('X-Description');
    description = decodeURIComponent(description);

    if (res.ok) {
      const blob = await res.blob();
      blob.name = title + '.mp3';
      blob.description = description;
      return blob;
    } else {
      console.warn('failed to generate image, retrying', res, i);
      continue;
    }
  }
  throw new Error('failed to generate image after retries');
};

export const importYoutubeVideo = async (url) => {
  const jwt = getCleanJwt();
  const u = new URL(`https://${aiProxyHost}/api/youtube`);
  u.searchParams.set('url', url);
  u.searchParams.set('type', 'video');
  const numRetries = 3;
  for (let i = 0; i < numRetries; i++) {
    const res = await fetch(u, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      // method: 'GET',
      // headers: {
      //   'Content-Type': 'application/json',
      // },
      // body: JSON.stringify(j),
    });

    let title = res.headers.get('X-Title');
    title = decodeURIComponent(title);

    let description = res.headers.get('X-Description');
    description = decodeURIComponent(description);

    if (res.ok) {
      const blob = await res.blob();
      blob.name = title + '.mp4';
      blob.description = description;
      return blob;
    } else {
      console.warn('failed to generate image, retrying', res, i);
      continue;
    }
  }
  throw new Error('failed to generate image after retries');
};
