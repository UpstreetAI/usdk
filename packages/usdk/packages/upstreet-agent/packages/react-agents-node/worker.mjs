// import './util/worker-globals.mjs';
// import * as codecs from 'codecs/ws-codec-runtime-worker.mjs';
// import { AgentMain } from 'react-agents/entry.ts';
import { createServer as createViteServer } from 'vite';

// helpers

// const nativeImport = new Function('specifier', 'return import(specifier)');
const headersToObject = (headers) => {
  const result = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
};

// initialize the dev server
const viteServerPromise = createViteServer({
  server: { middlewareMode: 'ssr' },
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  optimizeDeps: {
    // entries: {
    //   agent: './agent.tsx',
    //   agentMain: './packages/react-agents/entry.ts',
    // },
    entries: [
      './agent.tsx',
      './packages/upstreet-agent/packages/react-agents/entry.ts',
    ],
  },
});
// get AgentMain
const ensureAgentMain = (() => {
  let p = null;
  return () => {
    if (!p) {
      p = (async () => {
        const viteServer = await viteServerPromise;
        // console.log('get agent module 1');
        const agentModule = await viteServer.ssrLoadModule('/packages/upstreet-agent/packages/react-agents/entry.ts');
        // console.log('get agent module 2', agentModule);
        return agentModule.AgentMain;
      })();
    }
    return p;
  };
})();

process.on('message', async (eventData) => {
  console.log('got event', eventData);

  const method = eventData?.method;
  switch (method) {
    case 'init': {
      console.log('init 1');
      const viteServer = await viteServerPromise;
      console.log('init 2', !!viteServer);

      const [userRender, AgentMain] = await Promise.all([
        (async () => {
          const agentModule = await viteServer.ssrLoadModule('/agent.tsx');
          return agentModule.default;
        })(),
        ensureAgentMain(),
      ]);
      console.log('init 3', userRender, AgentMain);

      // if (!agentMainPromise) {
      //   agentMainPromise = (async () => {
      //     const { args } = eventData;
      //     const { env, agentSrc } = args;
      //     if (typeof agentSrc !== 'string') {
      //       throw new Error('agent worker: missing agentSrc');
      //     }

      //     // build the module here
      //     console.log('init 1');
      //     const agentModule = await buildAgentSrc(agentSrc);
      //     console.log('init 2', agentModule);

      //     /* const agentModule = await nativeImport(`data:application/javascript,${encodeURIComponent(agentSrc)}`);
      //     const userRender = agentModule.default;
      //     // console.log('got user render', userRender.toString());

      //     let alarmTimestamp = null;
      //     const state = {
      //       userRender,
      //       codecs,
      //       storage: {
      //         async getAlarm() {
      //           return alarmTimestamp;
      //         },
      //         setAlarm(timestamp) {
      //           alarmTimestamp = timestamp;
      //         },
      //       },
      //     };
      //     const durableObject = new AgentMain(state, env);
      //     return durableObject; */
      //   })();
      // } else {
      //   console.warn('agent worker: DurableObject already initialized', new Error().stack);
      // }
      break;
    }
    case 'request': {
      (async () => {
        if (!agentMainPromise) {
          throw new Error('agent worker: DurableObject not initialized');
        }
        const agentMain = await agentMainPromise;

        const { args } = eventData;
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