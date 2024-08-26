import { DurableObject } from './durable-object.tsx';

globalThis.onmessage = (event: any) => {
  console.log('got event', event.data);
  const method = event.data?.method;
  if (method === 'initDurableObject') {
    const { args } = event.data;
    const { agentTsx } = args;

    const state = {};
    const env = {
      AGENT_TSX_SOURCE: agentTsx,
    };
    console.log('init 1', {
      state,
      env,
    });
    const durableObject = new DurableObject(state, env);
    console.log('init 2');

    // globalThis.postMessage({
    //   method: 'pong',
    //   data: event.data,
    // });
  }
};