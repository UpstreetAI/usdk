import './util/worker-globals.mjs';
import * as codecs from 'codecs/ws-codec-runtime-worker.mjs';
import { AgentMain } from 'react-agents/entry.ts';
import { buildAgentSrc } from 'react-agents-builder';

//

const nativeImport = new Function('specifier', 'return import(specifier)');
const headersToObject = (headers) => {
  const result = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
};

//

let agentMainPromise = null;
process.on('message', (eventData) => {
  console.log('got event', eventData);

  const method = eventData?.method;
  switch (method) {
    case 'init': {
      if (!agentMainPromise) {
        agentMainPromise = (async () => {
          const { args } = event.data;
          const { env, agentSrc } = args;
          if (typeof agentSrc !== 'string') {
            throw new Error('agent worker: missing agentSrc');
          }

          const agentModule = await nativeImport(`data:application/javascript,${encodeURIComponent(agentSrc)}`);
          const userRender = agentModule.default;
          // console.log('got user render', userRender.toString());

          let alarmTimestamp = null;
          const state = {
            userRender,
            codecs,
            storage: {
              async getAlarm() {
                return alarmTimestamp;
              },
              setAlarm(timestamp) {
                alarmTimestamp = timestamp;
              },
            },
          };
          // console.log('worker init 1', {
          //   state,
          //   env,
          // });
          const durableObject = new AgentMain(state, env);
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
        if (!agentMainPromise) {
          throw new Error('agent worker: DurableObject not initialized');
        }
        const agentMain = await agentMainPromise;

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

          const res = await agentMain.fetch(request);
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
});