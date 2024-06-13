import 'localstorage-polyfill';
import { AgentRenderer, nudgeUserAgent } from '../runtime';
import type { AgentObject, ActionMessages, UserHandler, AgentConsole } from '../types';
// import { makeAnonymousClient } from '../util/supabase-client.mjs';
import { getConnectedWalletsFromMnemonic } from '../util/ethereum-utils.mjs';
// import { getStaticAsset } from '../util/static-asset-utils.js';
import { ConversationContext } from '../classes/conversation-context.mjs';
// import { console } from '../classes/console.mjs';

//

// support BigInt
/* const jsonStringify = (o?: any, replacer?: any, space?: number) => JSON.stringify(o, (key, value) => {
  if (typeof value === 'bigint') {
    return value.toString();
  } else if (replacer) {
    return replacer(key, value);
  } else {
    return value;
  }
}, space); */

//

export default async function handler(
  agentRenderer: AgentRenderer,
) {
  // console.log('nudge handler', { enabled });
  // if (typeof enabled !== 'boolean') {
  //   throw new Error('nudgeHandler: enabled must be a boolean');
  // }

  const prepareUserArgs = async (
    conversationContext: ConversationContext,
    env: object,
    userRender: UserHandler,
    enabled: boolean,
  ) => {
    // const scene = conversationContext.getScene();
    // const currentAgent = conversationContext.getCurrentAgent();
    // const agents = conversationContext.getAgents().concat([currentAgent]);
    // const messages = conversationContext.getMessages();

    // console.log('nudge prepare user args 1', {
    //   currentAgent,
    //   agents,
    //   messages,
    // });

    // const host = 'http://localhost';
    // const proxyRes2 = await getStaticAsset(
    //   new Request(`${host}/agent.npc`),
    //   env,
    // );

    const mnemonic = env.WALLET_MNEMONIC;
    const wallets = getConnectedWalletsFromMnemonic(mnemonic);

    // console.log('nudge prepare user args 2', {
    //   currentAgent,
    //   agents,
    //   messages,
    // });

    return {
      env,
      userRender,
      conversationContext,
      // scene,
      // agents,
      // currentAgent,
      // messages,
      wallets,
      enabled,
    };
  };
  const handleNudge = async () => {
    const userArgs = await prepareUserArgs(
      conversationContext,
      env,
      userRender,
      enabled,
    );
    try {
      await nudgeUserAgent(userArgs);
    } catch (err) {
      console.warn(err.stack);
    }
  };

  return await handleNudge();
}