// import fs from 'fs';
import os from 'os';
import { createServer as createViteServer, build as viteBuild } from 'vite';
// import toml from '@iarna/toml';
// import * as codecs from 'codecs/ws-codec-runtime-worker.mjs';
// import { globalImports } from 'react-agents/util/worker-global-imports.mjs'
import { Debouncer } from 'debouncer';

//

// const globalImportMap = new Map(Array.from(Object.entries(globalImports)));
// const globalNamespace = 'globals';

//

const cwd = process.cwd();
const homeDir = os.homedir();
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
  server: { 
    middlewareMode: true
  },
  appType: 'custom',
  esbuild: {
    jsx: 'transform',
    // jsxFactory: 'React.createElement',
    // jsxFragment: 'React.Fragment',
  },
  optimizeDeps: {
    // XXX make this watch only, instead of rebuilding. we build manually
    entries: [
      './agent.tsx',
      './packages/upstreet-agent/packages/react-agents/entry.ts',
    ],
  },
  watch: {
    include: [
      'wrangler.toml',
    ],
  },
});
// const loadModule = async (p) => {
//   const viteServer = await viteServerPromise;
//   return await viteServer.ssrLoadModule(p);
// };
const loadModuleSource = async (p) => {
  const result = await viteBuild({
    // root: cwd,
    build: {
      write: false,
      ssr: true,
      sourcemap: true,
      rollupOptions: {
        input: p,
      },
    },
    cacheDir: path.join(homeDir, '.usdk', 'vite'),
    esbuild: {
      jsx: 'transform',
    },
    plugins: [
      // {
      //   name: 'virtual-module',
      //   resolveId(id) {
      //     if (id === p) {
      //       return id;
      //     }
      //   },
      //   load(id) {
      //     if (id === p && sourceCode) {
      //       return sourceCode;
      //     }
      //   }
      // },
    ],
  });
  
  if (!result || !result.output || !result.output[0]) {
    throw new Error('Build failed to produce output');
  }

  const code = result.output[0].code;
  const map = result.output[0].map;
  const base64Map = Buffer.from(JSON.stringify(map)).toString('base64');
  const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${base64Map}`;
  return `${code}\n${sourceMapComment}`;
};
//
// const getEnv = async () => {
//   // load the wrangler.toml
//   const wranglerTomlPath = './wrangler.toml';
//   const wranglerTomlString = await fs.promises.readFile(wranglerTomlPath, 'utf8');
//   const wranglerToml = toml.parse(wranglerTomlString);

//   const agentJsonString = wranglerToml.vars.AGENT_JSON;
//   if (!agentJsonString) {
//     throw new Error('missing AGENT_JSON in wrangler.toml');
//   }
//   const agentJson = JSON.parse(agentJsonString);

//   const apiKey = wranglerToml.vars.AGENT_TOKEN;
//   if (!apiKey) {
//     throw new Error('missing AGENT_TOKEN in wrangler.toml');
//   }

//   const mnemonic = wranglerToml.vars.WALLET_MNEMONIC;
//   if (!mnemonic) {
//     throw new Error('missing WALLET_MNEMONIC in wrangler.toml');
//   }

//   const {
//     SUPABASE_URL,
//     SUPABASE_PUBLIC_API_KEY,
//   } = wranglerToml.vars;
//   if (!SUPABASE_URL || !SUPABASE_PUBLIC_API_KEY) {
//     throw new Error('missing SUPABASE_URL or SUPABASE_PUBLIC_API_KEY in wrangler.toml');
//   }

//   // send init message
//   const env = {
//     AGENT_JSON: JSON.stringify(agentJson),
//     AGENT_TOKEN: apiKey,
//     WALLET_MNEMONIC: mnemonic,
//     SUPABASE_URL,
//     SUPABASE_PUBLIC_API_KEY,
//     WORKER_ENV: 'development', // 'production',
//   };
//   return env;
// };
// const getAgentMain = async () => {
//   const agentModule = await loadModule('/packages/upstreet-agent/packages/react-agents/entry.ts');  
//   return agentModule.AgentMain;
// };
// const getUserRender = async () => {
//   const userRenderModule = await loadModule('/agent.tsx');

//   // const userRenderSource = await loadModuleSource('/agent.tsx');
//   // console.log('userRenderSource', userRenderSource);
  
//   return userRenderModule.default;
// };
//
let agentWorkerPromise = null;
const reloadDebouncer = new Debouncer();
const reloadAgentWorker = async () => {
  await reloadDebouncer.waitForTurn(async () => {
    const oldAgentWorkerPromise = agentWorkerPromise;
    agentWorkerPromise = (async () => {
      // wait for the old agent process to terminate
      if (oldAgentWorkerPromise) {
        const oldAgentWorker = await oldAgentWorkerPromise;
        await oldAgentWorker.terminate();
      }

      const moduleSource = await loadModuleSource('./worker.mjs');
      console.log('moduleSource', moduleSource);

      /* // start the new agent process
      const [
        AgentMain,
        env,
        userRender,
      ] = await Promise.all([
        getAgentMain(),
        getEnv(),
        getUserRender(),
      ]);

      // XXX need to handle command line args e.g.
      // '--var', 'WORKER_ENV:development',
      // '--ip', '0.0.0.0',
      // '--port', devServerPort + portIndex,

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
      const agentMain = new AgentMain(state, env);
      return agentMain; */

      const agentWorker = {
        async terminate() {
          // XXX implement this
        },
      };
      return agentWorker;
    })();
  });
};
reloadAgentWorker();
//
const listenForChanges = async () => {
  const viteServer = await viteServerPromise;
  viteServer.watcher.on('change', () => {
    reloadAgentWorker();
  });
};
listenForChanges();

process.on('message', async (eventData) => {
  console.log('got event', eventData);

  throw new Error('not implemented');

  /* const method = eventData?.method;
  switch (method) {
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
      break;
    }
    default: {
      console.error('unknown method', method);
      break;
    }
  } */
});