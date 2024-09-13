import { aiHost } from './util/endpoints.mjs'


const prefix = `${aiHost}/api`;


export const aiProxyAPI = {
  getUser: `${prefix}/getUser`,
};
