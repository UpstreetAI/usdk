import { aiProxyHost } from './endpoints.js';
import { getCleanJwt } from './util.js';

//

export const generateDance = async (blob) => {
  const jwt = getCleanJwt();
  const u = new URL(`https://${aiProxyHost}/api/generateDance`);
  const res = await fetch(u, {
    method: 'POST',
    body: blob,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const json = await res.json();
  const { name } = json;
  return name;
};
export const getDance = async (name) => {
  const jwt = getCleanJwt();
  const u = new URL(`https://${aiProxyHost}/api/getDance/${name}`);
  const res = await fetch(u, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (res.ok) {
    if (res.status === 204) {
      return null;
      // const blob = await res.blob();
      // return blob;
    } else {
      const blob = await res.blob();
      return blob;
      // const json = await res.json();
      // const {error} = json;
      // throw new Error(error);
    }
  } else {
    // return null;
    throw new Error('invalid status code: ' + res.status);
  }
};

//

const generateFull = (generator, getter) => async (args, opts) => {
  const name = await generator(args, opts);

  const blob = await new Promise((accept, reject) => {
    const recurse = async () => {
      const blob = await getter(name);

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
export const generateDanceFull = generateFull(generateDance, getDance);
