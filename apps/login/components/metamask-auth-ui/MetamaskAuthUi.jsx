import React from // useContext,
// useState,
'react';

import { resolveIpfsUrl } from '../../../packages/engine/util.js';
import { ALCHEMY_API_KEY } from '../../../packages/engine/constants/auth.js';

import styles from '../../../styles/MetamaskAuthUi.module.css';

import { ethers } from 'ethers';

import { authEndpoint } from '../../../endpoints.js';

const ACCOUNT_DATA = {
  EMAIL: 'email',
  AVATAR: 'avatar',
};

//

export const getEthereumAccountDetails = async (address) => {
  // const provider = new ethers.Web3Provider(window.ethereum)
  const provider = new ethers.AlchemyProvider('homestead', ALCHEMY_API_KEY);
  const check = ethers.getAddress(address);

  try {
    const name = await provider.lookupAddress(check);
    if (!name) return { address };
    const resolver = await provider.getResolver(name);

    const accountDetails = {};

    await Promise.all(
      Object.keys(ACCOUNT_DATA).map(async (key) => {
        const data = await resolver.getText(ACCOUNT_DATA[key]);
        accountDetails[ACCOUNT_DATA[key]] = data;
      }),
    );

    const result = {
      ...accountDetails,
      name,
      address,
    };
    result.avatar = result.avatar ? resolveIpfsUrl(result.avatar) : '';
    return result;
  } catch (err) {
    console.warn(err.stack);
    return {};
  }
};

//

export const ensureEthereum = () => {
  return globalThis.ethereum !== undefined;
  if (typeof globalThis.ethereum === 'undefined') {
    throw new Error('Please install a wallet extension like MetaMask');
  }
};
const ensureNetwork = async (chainId = '0x1') => {
  // 0x1 refers to the Ethereum mainnet
  await globalThis.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId }],
  });
};
export const ensure = async () => {
  if (ensureEthereum()) {
    await ensureNetwork();
  }
};

//

const getEthereumAccount = async () => {
  const accounts = await globalThis.ethereum.request({
    method: 'eth_requestAccounts',
  });
  const account = accounts[0];
  return account;
};

//

export const MetamaskAuthUi = ({ localStorageManager, method = 'connect', args = {}, onClose }) => {
  const connectMetamask = async (args) => {
    await ensure();
    const account = await getEthereumAccount();

    const message = `\
This lets you log in to Upstreet.

${JSON.stringify(
  {
    sign_in: 'upstreet',
    address: account,
    timestamp: Date.now(),
  },
  null,
  2,
)}
  `;

    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, account],
    });

    // console.log('got signature 1', signature);

    const res = await fetch(authEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        signature,
      }),
    });
    const jwtResult = await res.json();

    localStorageManager.setJwt(jwtResult);

    onClose(jwtResult);
  };
  const fundMetamask = async (args) => {
    // await ensureEthereum();
    const account = await getEthereumAccount();

    if (args.chain) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [args.chain],
      });
    }

    const wei = BigInt(args.amount * 1e18);

    console.log('send 1', { account });
    const hash = await window.ethereum.request({
      method: "eth_sendTransaction",
      // The following sends an EIP-1559 transaction. Legacy transactions are also supported.
      params: [
        {
          // The user's active address.
          from: account,
          // Required except during contract publications.
          to: args.dstAddress,
          // Only required to send ether to the recipient from the initiating external account.
          value: '0x' + wei.toString(16),
          // // Customizable by the user during MetaMask confirmation.
          // gasLimit: '0x5028',
          // // Customizable by the user during MetaMask confirmation.
          // maxPriorityFeePerGas: '0x3b9aca00',
          // // Customizable by the user during MetaMask confirmation.
          // maxFeePerGas: '0x2540be400',
        },
      ],
    });
    console.log('send 2', { hash });

    let result = null;
    const maxWait = 60;
    for (let i = 0; i < maxWait; i++) {
      result = await window.ethereum.request({
        "method": "eth_getTransactionReceipt",
        "params": [
          hash,
        ],
      });
      if (result) {
        console.log('send 3', { result });
        break;
      } else {
        if (i < maxWait - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          throw new Error('getting transaction receipt timed out: ' + hash);
        }
      }
    }

    const postResult = async (j) => {
      const res = await fetch(args.cbUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(j),
      });
      if (res.ok) {
        await res.blob();
      } else {
        throw new Error('invalid status code: ' + res.status);
      }
    };
    await postResult(result);
  };
  const click = async () => {
    switch (method) {
      case 'connect': {
        await connectMetamask(args);
        break;
      }
      case 'fund': {
        await fundMetamask(args);
        break;
      }
      default: {
        throw new Error('unknown method: ' + method);
      }
    }
  };

  //

  return (
    <div className={styles.metamaskAuthUi}>
      <div className={styles.buttons}>
        <div className={styles.button} onClick={click}>
          <img className={styles.image} src="/images/metamask.png" />
          <div className={styles.text}>Metamask</div>
        </div>
      </div>
    </div>
  );
};
