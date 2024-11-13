import {
  ethers,
} from 'ethers';

import {
  ALCHEMY_API_KEY,
} from '../constants/auth.js';
import TitleDeedABI from '../ethereum/abis/title-deed-abi.json';
import LandClaimABI from '../ethereum/abis/land-claim-abi.json';
import SilkABI from '../ethereum/abis/silk.json';
import contractAddresses from '../ethereum/contract-addresses.json';
const titleDeedAddress = contractAddresses.titleDeed;
const landClaimAddress = contractAddresses.landClaim;
const silkAddress = contractAddresses.silk;

//

export const getLandContractsAsync = async () => {
  // await ensure();

  const provider = globalThis.ethereum ?
    new ethers.BrowserProvider(globalThis.ethereum)
  :
    new ethers.AlchemyProvider(
      'homestead',
      ALCHEMY_API_KEY,
    );
  // get the signer from METAMASK (window.ethereum)
  const signer = globalThis.ethereum ? await provider.getSigner() : null;
  // Create a contract instances
  const titleDeed = new ethers.Contract(titleDeedAddress, TitleDeedABI, signer);
  const landClaim = new ethers.Contract(landClaimAddress, LandClaimABI, signer);
  return {
    titleDeed,
    landClaim,
  };
};
export const getSilkContractsAsync = async () => {
  // await ensure();

  const provider = globalThis.ethereum ?
    new ethers.BrowserProvider(globalThis.ethereum)
  :
  new ethers.AlchemyProvider(
    'homestead',
    ALCHEMY_API_KEY,
  );
  // get the signer from METAMASK (window.ethereum)
  const signer = globalThis.ethereum ? await provider.getSigner() : null;
  // Create a contract instances
  const silk = new ethers.Contract(silkAddress, SilkABI, signer);
  return {
    silk,
  };
};