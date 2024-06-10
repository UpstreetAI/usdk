import 'localstorage-polyfill';
import { AgentRenderer, compileUserAgentServer } from '../runtime';
import type { AgentObject, ActionMessages, UserHandler, AgentConsole } from '../types';
// import { makeAnonymousClient } from '../util/supabase-client.mjs';
import { getConnectedWalletsFromMnemonic } from '../util/ethereum-utils.mjs';
import { ConversationContext } from '../classes/conversation-context.mjs';
// import { console } from '../classes/console.mjs';

//

export default async function handler(
  request: Request,
  agentRegistry: AgentRenderer,
) {
  console.log('nudge handler', { enabled });
  if (typeof enabled !== 'boolean') {
    throw new Error('serverHandler: enabled must be a boolean');
  }

  const prepareUserArgs = async (
    conversationContext: ConversationContext,
    env: object,
    userRender: UserHandler,
    enabled: boolean,
  ) => {
    // const currentAgentId = (args as any).currentAgentId as string;
    // const agentIds = (args as any).agentIds as string;

    // const scene = conversationContext.getScene();
    // const currentAgent = conversationContext.getCurrentAgent();
    // const agents = conversationContext.getAgents().concat([currentAgent]);
    // const messages = conversationContext.getMessages();

    // console.log('server prepare user args', {
    //   // args,
    //   // argsJson: JSON.stringify(args),
    //   env,
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

    return {
      env,
      console,
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
  const handleServer = async () => {
    const userArgs = await prepareUserArgs(
      conversationContext,
      env,
      userRender,
      enabled,
    );
    const agentServer = await compileUserAgentServer(userArgs);
    const method = request.method as string;
    // const pathname = (args as any).pathname as string;

    const originalUrl = new URL(request.url);
    // originalUrl.pathname = originalUrl.pathname.replace(/^\/agents\/[^/]+/, '');
    const pathname =
      originalUrl.pathname + originalUrl.search + originalUrl.hash;

    // extract the url
    const u = new URL(pathname, 'http://localhost');
    // read the headers as an object
    const headers: {
      [key: string]: string;
    } = {};
    // convert headers object into plain object
    request.headers.forEach((v, k) => {
      headers[k] = v;
    });
    // create the proxy request
    const opts = {
      method: request.method,
      headers,
      body: null,
    };
    if (!['GET', 'HEAD'].includes(method)) {
      opts.body = request.body;
    }
    const proxyReq = new Request(u, opts);
    const proxyRes = await agentServer.fetch(proxyReq, env);
    return proxyRes;
  };

  return await handleServer();
}
