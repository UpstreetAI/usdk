import { aiProxyHost } from './endpoints.mjs';
import Jimp from 'jimp';

const blob2jimp = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const image = await Jimp.fromBuffer(arrayBuffer);
  return image;
};
const jimp2blob = async (image, {
  type = 'image/png',
  quality,
}) => {
  // console.log('jimp2blob 1', image);
  const buffer = await image.getBuffer(type, { quality });
  // console.log('jimp2blob 2', buffer);
  const blob = new Blob([buffer], {
    type,
  });
  return blob;
};

export const generateVideo = async (imageBlob, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  // Resize image to required dimensions
  const dimensions = {
    width: 768,
    height: 768,
  };
  const image = await blob2jimp(imageBlob);
  image.resize(dimensions.width, dimensions.height);
  const imageBlob2 = await jimp2blob(image, {
    type: 'image/jpeg',
  });

  // Submit image for video generation
  const fd = new FormData();
  fd.append('image', imageBlob2);
  const res = await fetch(`https://${aiProxyHost}/api/ai/image-to-video`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Invalid status code: ${res.status}: ${text}`);
  }

  const { id } = await res.json();
  
  // Poll for results
  const pollTime = 1000;
  const maxAttempts = 60;
  let attempts = 0;
  let timeout;

  return new Promise((resolve, reject) => {
    const check = async () => {
      if (attempts++ >= maxAttempts) {
        clearTimeout(timeout);
        reject(new Error('Timeout waiting for video generation'));
        return;
      }

      try {
        const res2 = await fetch(`https://${aiProxyHost}/api/ai/image-to-video/result/${id}`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
            Accept: 'video/*',
          },
        });

        if (!res2.ok) {
          timeout = setTimeout(check, pollTime);
          return;
        }

        if (res2.status === 202) {
          try {
            const progressData = await res2.json();
            console.log('Generation in progress:', progressData);
          } catch (e) {} // Ignore progress parse errors
          
          timeout = setTimeout(check, pollTime);
          return;
        }

        const contentType = res2.headers.get('content-type');
        if (contentType?.includes('video/')) {
          const blob = await res2.blob();
          clearTimeout(timeout);
          resolve(blob);
          return;
        }

        timeout = setTimeout(check, pollTime);
      } catch (err) {
        console.error('Error checking video status:', err);
        timeout = setTimeout(check, pollTime);
      }
    };

    timeout = setTimeout(check, pollTime);
  });
};