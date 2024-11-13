import {
  aiProxyHost,
} from '../../endpoints.js';
import { getCleanJwt } from '../../utils/jwt-util.js';

//

export const generateAudio = async (text, {
  duration,
} = {}) => {
  const jwt = getCleanJwt();
  const u = new URL(`https://${aiProxyHost}/api/generateAudio`);
  u.searchParams.set('text', text);
  if (typeof duration === 'number') {
    u.searchParams.set('duration', duration + '');
  }
  const res = await fetch(u, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const file_name = await res.text();

  const audioUrl = new URL(`https://${aiProxyHost}/api/getAudio`);
  audioUrl.searchParams.set('file_name', file_name);
  return audioUrl.href;
}
export const getAudio = async (u) => {
  const res = await fetch(u);
  if (res.ok) {
    if (res.status === 204) {
      return null;
    } else {
      const blob = await res.blob();
      return blob;
    }
  } else {
    throw new Error('invalid status code: ' + res.status);
  }
};

//

const generateFull = (generator, getter) => async (args, opts) => {
  const u = await generator(args, opts);

  const blob = await new Promise((accept, reject) => {
    const recurse = async () => {
      const blob = await getter(u);

      if (blob !== null) {
        accept(blob);
      } else {
        setTimeout(recurse, 3000);
      }
    };
    recurse();
  });
  console.log('got blob', blob);
  return blob;
};
export const generateAudioFull = generateFull(generateAudio, getAudio);