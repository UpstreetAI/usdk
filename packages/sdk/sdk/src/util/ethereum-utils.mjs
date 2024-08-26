import { HDNodeWallet, JsonRpcProvider, getIndexedAccountPath } from 'ethers';

export const providers = {
  baseSepolia: new JsonRpcProvider('https://sepolia.base.org'),
  opMainnet: new JsonRpcProvider('https://mainnet.optimism.io'),
};
export const getWalletFromMnemonic = (mnemonic, accountIndex = 0) => {
  const accountPath = getIndexedAccountPath(accountIndex);
  const wallet = HDNodeWallet.fromPhrase(
    mnemonic,
    undefined,
    accountPath,
  );
  return wallet;
};
export const getConnectedWalletsFromMnemonic = (mnemonic, accountIndex = 0) => {
  const wallet = getWalletFromMnemonic(mnemonic, accountIndex);
  const result = {};
  for (const [name, provider] of Object.entries(providers)) {
    result[name] = wallet.connect(provider);
  }
  return result;
};
