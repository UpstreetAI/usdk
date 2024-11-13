import {
  Alchemy,
  Network,
} from 'alchemy-sdk';
import {
  getNetwork,
} from '../util.js';

//

const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

//

const network = (() => {
  const networkName = getNetwork();
  switch (networkName) {
    case 'mainnet': return Network.ETH_MAINNET;
    case 'goerli': return Network.ETH_GOERLI;
    default: throw new Error('invalid network: ' + networkName);
  }
})();
const settings = {
  apiKey: ALCHEMY_API_KEY,
  network,
};

export const createClient = () => new Alchemy(settings);