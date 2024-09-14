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

  // resize the image blob using jimp
  // the available sizes are 1024x576 or 576x1024 or 768x768
  // console.log('load blob 1', imageBlob);
  const dimensions = {
    width: 768,
    height: 768,
  };
  const image = await blob2jimp(imageBlob);
  // resize to the needed size
  // console.log('load blob 2', image);
  image.resize(dimensions.width, dimensions.height);
  console.log('load blob 3', image);
  // const resizedImage = await resizeImageBlob(image, 768, 768);
  const imageBlob2 = await jimp2blob(image, {
    type: 'image/jpeg',
  });
  console.log('load blob 4', imageBlob2);

  const fd = new FormData();
  fd.append('image', imageBlob2);
  const res = await fetch(`https://${aiProxyHost}/api/ai/image-to-video`, {
    method: 'POST',

    headers: {
      Authorization: `Bearer ${jwt}`,
    },

    body: fd,
  });
  // console.log('generate model req', res.ok, res.headers);
  if (res.ok) {
  // console.log('generate model blob 0');
    const j = await res.json();
    const { id } = j;
    const loadPromise = (async () => {
      const pollTime = 1000;
      const result = await new Promise((accept, reject) => {
        console.log('video load promise 0');
        const check = async () => {
          console.log('video load promise tick 1', {
            id,
          });

          const res2 = await fetch(`https://${aiProxyHost}/api/ai/image-to-video/result/${id}`, {
            headers: {
              Authorization: `Bearer ${jwt}`,
              Accept: 'video/*',
            },
          });
          const blob = await res2.blob();
          if (blob.type === 'application/json') {
            const s = await blob.text();
            const j = JSON.parse(s);
            console.log('got json', j);
            timeout = setTimeout(check, pollTime);
          } else {
            console.log('got non-json, returning it as the media blob', blob);
            accept(blob);
            clearTimeout(timeout);
            timeout = null;
          }
          console.log('video load promise tick 3', { id, blob });
          // https://platform.stability.ai/account/credits
        };
        let timeout = setTimeout(check, pollTime);
      });
      return result;
    })();
    // const waitForLoad = () => loadPromise;
    // return {
    //   id,
    //   waitForLoad,
    // };
    return await loadPromise;
    // const blob = await res.blob();
    // // console.log('generate model blob 2');
    // return blob;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};