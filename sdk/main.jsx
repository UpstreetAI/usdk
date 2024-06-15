export { DurableObject } from './durable-object.jsx';
// import { makeAnonymousClient } from './src/util/supabase-client.mjs';
import { headers } from './src/constants.js';

async function handleAgentRequest(request, env) {
  const guid = env.GUID;
  const id = env.AGENT.idFromName(guid);
  const stub = env.AGENT.get(id);
  return await stub.fetch(request);
}

export default {
  async fetch(request, env, ctx) {
    try {
      // console.log('worker main request', request?.url);
      return await handleAgentRequest(request, env);
    } catch (err) {
      console.warn(err.stack);
      return new Response(err.stack, {
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
          ...headers,
        },
      });
    }
  },
  /* async tail(events, env, ctx) {
    // console.log('worker main tail', events);

    const guid = env.GUID;

    const supabase = makeAnonymousClient(env);
    await supabase.from('logs').upsert({
      user_id: guid,
      content: events,
    });
  }, */
};
