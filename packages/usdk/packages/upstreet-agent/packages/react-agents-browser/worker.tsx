import React from 'react';
import 'react-agents/util/worker-globals.mjs';
import * as codecs from 'codecs/ws-codec-runtime-worker.mjs';
import { createRoot, Root } from 'react-agents/root.ts';

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

let rootPromise: Promise<Root> | null = null;
globalThis.onmessage = (event: any) => {
  // console.log('got event', event.data);
  const method = event.data?.method;
  switch (method) {
    case 'init': {
      if (!rootPromise) {
        rootPromise = (async () => {
          const { args } = event.data;
          const { agentJson, env, agentModuleSrc } = args;
          if (typeof agentModuleSrc !== 'string') {
            throw new Error('agent worker: missing agentModuleSrc');
          }

          const agentModule = await nativeImport(`data:application/javascript,${encodeURIComponent(agentModuleSrc)}`);
          const App = agentModule.default;
          // console.log('got app', App.toString());

          const rootOpts = {
            agentJson,
            codecs,
            env,
          };
          const root = createRoot(rootOpts);
          root.render(<App />);
          return root;
        })();
      } else {
        console.warn('agent worker: root already initialized', new Error().stack);
      }
      break;
    }
    case 'request': {
      (async () => {
        if (!rootPromise) {
          throw new Error('agent worker: root not initialized');
        }
        const root = await rootPromise;

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

          const res = await root.fetch(request);
          // console.log('got agent main response', res.ok, res.status, res.headers);
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