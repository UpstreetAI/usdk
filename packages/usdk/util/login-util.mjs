// import fs from 'fs';
import {
  tryReadFileAsync,
} from '../lib/file.mjs';
import {
  loginLocation,
} from '../lib/locations.mjs';

function jsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (err) {
    return null;
  }
}

export const getLoginJwt = async () => {
  const loginFile = await tryReadFileAsync(loginLocation);
  if (loginFile) {
    const o = jsonParse(loginFile);
    if (
      typeof o === 'object' &&
      typeof o?.id === 'string' &&
      typeof o?.jwt === 'string'
    ) {
      const { jwt } = o;
      return jwt;
    }
  }

  return null;
};