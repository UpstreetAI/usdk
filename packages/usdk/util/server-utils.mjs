import path from 'path';
import {
  tryReadFile,
} from '../lib/file.mjs';
import {
  certsLocalPath,
} from '../lib/locations.mjs';

const defaultCorsHeaders = [
  // {
  //   "key": "Access-Control-Allow-Origin",
  //   "value": "*"
  // },
  {
    key: 'Access-Control-Allow-Methods',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: ['content-type'].join(', '),
  },
  {
    key: 'Access-Control-Expose-Headers',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Private-Network',
    value: 'true',
  },
  {
    key: 'Access-Control-Allow-Credentials',
    value: 'true',
  },
];
export const makeCorsHeaders = (req) => {
  const headers = [...defaultCorsHeaders];
  // set Access-Control-Allow-Origin to the origin of the request
  const origin = req.headers['origin'];
  if (origin) {
    headers.push({
      key: 'Access-Control-Allow-Origin',
      value: origin,
    });
  }
  return headers;
};

export const getServerOpts = () => {
  return {
    key: tryReadFile(path.join(certsLocalPath, 'privkey.pem')) || '',
    cert: tryReadFile(path.join(certsLocalPath, 'fullchain.pem')) || '',
  };
};