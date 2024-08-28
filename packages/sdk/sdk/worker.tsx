import './src/util/worker-globals.mjs';
import { DurableObject } from './durable-object.tsx';

//

const nativeImport = new Function('specifier', 'return import(specifier)');
const headersToObject = (headers: Headers) => {
  const result = {};
  for (const [key, value] of headers.entries()) {
    (result as any)[key] = value;
  }
  return result;
};

//

let durableObjectPromise: Promise<DurableObject> | null = null;
globalThis.onmessage = (event: any) => {
  // console.log('got event', event.data);
  const method = event.data?.method;
  switch (method) {
    case 'initDurableObject': {
      if (!durableObjectPromise) {
        durableObjectPromise = (async () => {
          const { args } = event.data;
          const { env, agentSrc } = args;
          if (typeof agentSrc !== 'string') {
            throw new Error('agent worker: missing agentSrc');
          }

          const agentModule = await nativeImport(`data:application/javascript,${encodeURIComponent(agentSrc)}`);
          const userRender = agentModule.default;
          // console.log('got user render', {
          //   agentSrc,
          //   agentModule,
          //   userRender,
          // });

          const state = {
            userRender,
            storage: {
              setAlarm(timestamp: number) {
                // nothing
              },
            },
          };
          // console.log('worker init 1', {
          //   state,
          //   env,
          // });
          const durableObject = new DurableObject(state, env);
          // console.log('worker init 2', {
          //   durableObject,
          // });
          return durableObject;
        })();
      } else {
        console.warn('agent worker: DurableObject already initialized', new Error().stack);
      }
      break;
    }
    case 'request': {
      (async () => {
        if (!durableObjectPromise) {
          throw new Error('agent worker: DurableObject not initialized');
        }
        const durableObject = await durableObjectPromise;

        const { args } = event.data;
        const {
          id,
          method,
          headers,
          body,
        } = args;
        if (!id) {
          throw new Error('request message missing id: ' + JSON.stringify(args));
        }

        let resultArrayBuffer = null;
        let resultStatus = null;
        let resultHeaders = null;
        let error = null;
        try {
          const request = new Request(args.url, {
            method,
            headers,
            body,
          });

          const res = await durableObject.fetch(request);
          // console.log('got durable object response', res.ok, res.status, res.headers);
          if (res.ok) {
            resultArrayBuffer = await res.arrayBuffer();
            resultStatus = res.status;
            resultHeaders = headersToObject(res.headers);
          } else {
            throw new Error('Failed to fetch: ' + res.status);
          }
        } catch (err) {
          console.error('Failed to fetch', err);
          error = err;
        }

        globalThis.postMessage({
          method: 'response',
          args: {
            id,
            status: resultStatus,
            body: resultArrayBuffer,
            headers: resultHeaders,
            error,
          },
        });
      })();
    }
  }
};