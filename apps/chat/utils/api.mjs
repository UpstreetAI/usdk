import { aiHost } from "./const/endpoints";


const prefix = `${aiHost}/api`;


export const aiProxyAPI = {
  getUser: `${prefix}/getUser`,
};