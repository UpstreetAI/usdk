import './src/util/worker-globals.mjs';
import { DurableObject } from './durable-object.tsx';

globalThis.onmessage = (event: any) => {
  console.log('got event', event.data);
  const method = event.data?.method;
  if (method === 'initDurableObject') {
    const { args } = event.data;
    const { env } = args;

    const state = {
      storage: {
        setAlarm(timestamp: number) {
          // nothing
        },
      },
    };
    console.log('worker init 1', {
      state,
      env,
    });
    const durableObject = new DurableObject(state, env);
    console.log('worker init 2', {
      durableObject,
    });

    // globalThis.postMessage({
    //   method: 'pong',
    //   data: event.data,
    // });
  }
};