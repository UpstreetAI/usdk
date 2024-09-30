import { compileUserAgentServer } from '../runtime';
import { headers } from '../constants.mjs';
import {
  AgentRenderer,
} from '../classes/agent-renderer';

//

export async function serverHandler(request: Request, {
  agentRenderer,
  env,
}: {
  agentRenderer: AgentRenderer;
  env: any;
}) {
  const agents = agentRenderer.registry.agents;
  if (agents.length > 0) {
    const agent = agents[0];
    const agentServer = await compileUserAgentServer({
      agent,
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
    const requestHeaders: {
      [key: string]: string;
    } = {};
    // convert headers object into plain object
    request.headers.forEach((v, k) => {
      requestHeaders[k] = v;
    });
    // create the proxy request
    const opts = {
      method: request.method,
      headers: requestHeaders,
      body: null,
    };
    if (!['GET', 'HEAD'].includes(method)) {
      opts.body = request.body;
    }
    const proxyReq = new Request(u, opts);
    const proxyRes = await agentServer.fetch(proxyReq, env);

    const arrayBuffer = await proxyRes.arrayBuffer();
    const proxyRes2 = new Response(arrayBuffer, {
      status: proxyRes.status,
      headers: {
        ...headers,
        'Content-Type': proxyRes.headers.get('Content-Type'),
      },
    });
    return proxyRes2;
  } else {
    return new Response('durable object: no agents', {
      status: 404,
      headers,
    });
  }
}
