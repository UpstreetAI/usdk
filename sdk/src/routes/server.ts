import 'localstorage-polyfill';
import { AgentRenderer, compileUserAgentServer } from '../runtime';
import type { AgentObject, ActionMessages, UserHandler, AgentConsole, ActiveAgentObject } from '../types';
// import { makeAnonymousClient } from '../util/supabase-client.mjs';
import { getConnectedWalletsFromMnemonic } from '../util/ethereum-utils.mjs';
import { ConversationContext } from '../classes/conversation-context.mjs';
// import { console } from '../classes/console.mjs';

//

export default async function handler(
  request: Request,
  agent: ActiveAgentObject,
) {
  // console.log('nudge handler', { enabled });
  // if (typeof enabled !== 'boolean') {
  //   throw new Error('serverHandler: enabled must be a boolean');
  // }

  const handleServer = async () => {
    // const userArgs = await prepareUserArgs(
    //   conversationContext,
    //   env,
    //   userRender,
    //   // enabled,
    // );
    const agentServer = await compileUserAgentServer({
      agentRenderer,
    });
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
