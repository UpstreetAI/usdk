import React from 'react';
import * as ethers from 'ethers';
const { Contract } = ethers;
import {
  useAgents,
  useCurrentAgent,
  // useActions,
  // AgentEvent,
  ActionEvent,
  PerceptionEvent,
  PendingActionEvent,
  // AgentObject,
  ActionMessage,
  // Scene,
  Agent,
  Action,
  Perception,
  AgentAppProps,
  DefaultAgentComponents,
  DefaultActions,
  DefaultPrompts,
  DefaultParsers,
  DefaultPerceptions,
  DefaultSchedulers,
/* IMPORTS REGEX HOOK */
} from 'react-agents';
import { IdGatewayABI } from './abi/IdGatewayABI';

//

const WARPCAST_RECOVERY_PROXY = '0x00000000FcB080a4D6c39a9354dA9EB9bC104cd7';
const CreateFarcasterAccountAction = () => {
  // const currentAgent = useCurrentAgent();
  // const agents = useAgents();
  return (
    <Action
      name="createFarcasterAccount"
      description={`Create a Farcaster account and print the id.`}
      args={{}}
      handler={async (e: PendingActionEvent) => {
        const {
          agent,
          message: { args },
        } = e.data;

        const address = agent.wallets.opMainnet.address;

        const idGatewayContract = new Contract(
          '0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69',
          IdGatewayABI,
          agent.wallets.opMainnet,
        );
        console.log('getting agent address', agent.address, address);
        const price = await idGatewayContract.price();
        console.log('got price', price);

        console.log('register result 1', {
          address,
        });
        const registerResult = await idGatewayContract.register(
          WARPCAST_RECOVERY_PROXY,
          0n,
          {
            value: price,
          },
        );
        console.log('register result 2', {
          address,
          registerResult,
        });

        // const { data: price }: { data: bigint | undefined } = useContractRead({
        //   address: '0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69',
        //   abi: IdGatewayABI,
        //   functionName: 'price',
        //   chainId: farcasterChain.id,
        // });

        // const { config, isError, error } = usePrepareContractWrite({
        //   address: '0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69',
        //   abi: IdGatewayABI,
        //   functionName: 'register',
        //   args: [recoveryAddress],
        //   enabled: Boolean(recoveryAddress),
        //   value: BigInt(price ?? 0),
        // });
        // const { data: registerFidTxHash, write } = useContractWrite(config);

        // const { userId, amount } = args as any;
        // await agent.wallet.sendTransaction({
        //   to: agents.find((agent) => agent.id === userId).address,
        //   value: '0x' + BigInt(amount * 1e18).toString(16),
        // });
        // await currentAgent.addAction(e.data.message);
      }}
    />
  );
};
const FarcasterActions = () => {
  return (
    <>
      <CreateFarcasterAccountAction />
    </>
  );
};

const GetBalanceAction = () => {
  return (
    <Action
      name="getBalanceAction"
      description={`Get the current blockchain account balance.`}
      args={{}}
      handler={async (e: PendingActionEvent) => {
        const { agent, message } = e.data;
        const { args } = message;

        // console.log('got balance 1');
        // console.log(
        //   'got balance 2',
        //   // balance,
        //   // agent.wallets.opMainnet.getBalance.toString(),
        //   Object.keys(agent.wallets.opMainnet),
        // );

        // const address = agent.wallets.opMainnet.address;
        const balance = await agent.wallets.opMainnet.provider.getBalance(
          agent.wallets.opMainnet.address,
        );
        const balanceEth = Number(balance) / 1e18;
        const newMessage = {
          ...message,
          args: {
            ...message.args,
            balance: balanceEth,
          },
        };
        const s = `Character checked their balance and it is: ${balanceEth} ETH`;
        // console.log('monologue', s);
        await agent.monologue(s);
        await agent.addAction(newMessage);

        /* const idGatewayContract = new Contract(
          '0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69',
          IdGatewayABI,
          agent.wallets.opMainnet,
        );
        console.log('getting agent address', agent.address, address);
        const price = await idGatewayContract.price();
        console.log('got price', price);

        console.log('register result 1', {
          address,
        });
        const registerResult = await idGatewayContract.register(
          WARPCAST_RECOVERY_PROXY,
          0n,
          {
            value: price,
          },
        );
        console.log('register result 2', {
          address,
          registerResult,
        }); */

        // const { data: price }: { data: bigint | undefined } = useContractRead({
        //   address: '0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69',
        //   abi: IdGatewayABI,
        //   functionName: 'price',
        //   chainId: farcasterChain.id,
        // });

        // const { config, isError, error } = usePrepareContractWrite({
        //   address: '0x00000000Fc25870C6eD6b6c7E41Fb078b7656f69',
        //   abi: IdGatewayABI,
        //   functionName: 'register',
        //   args: [recoveryAddress],
        //   enabled: Boolean(recoveryAddress),
        //   value: BigInt(price ?? 0),
        // });
        // const { data: registerFidTxHash, write } = useContractWrite(config);

        // const { userId, amount } = args as any;
        // await agent.wallet.sendTransaction({
        //   to: agents.find((agent) => agent.id === userId).address,
        //   value: '0x' + BigInt(amount * 1e18).toString(16),
        // });
        // await currentAgent.addAction(e.data.message);
      }}
    />
  );
};
const WalletActions = () => {
  return (
    <>
      <GetBalanceAction />
    </>
  );
};

export default function MyAgent() {
  return (
    <Agent>
      <WalletActions />
      <FarcasterActions />
{/* JSX REGEX HOOK */}
    </Agent>
  );
}
