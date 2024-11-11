import path from 'path';
import fs from 'fs';
import os from 'os';
import { createServer as createViteServer, build as viteBuild } from 'vite';
import crossSpawn from 'cross-spawn';
import { Debouncer } from 'debouncer';

//

// const globalImportMap = new Map(Array.from(Object.entries(globalImports)));
// const globalNamespace = 'globals';
const dirname = path.dirname(import.meta.url.replace('file://', ''));

//

const cwd = process.cwd();
const homeDir = os.homedir();
// const nativeImport = new Function('specifier', 'return import(specifier)');
/* const headersToObject = (headers) => {
  const result = {};
  for (const [key, value] of headers.entries()) {
    result[key] = value;
  }
  return result;
}; */

// initialize the dev server
const viteServerPromise = createViteServer({
  // server: { 
  //   middlewareMode: true
  // },
  // appType: 'custom',
  // esbuild: {
  //   jsx: 'transform',
  // },
  // optimizeDeps: {
  //   disabled: true // Disable dependency optimization/building
  // },
  watch: {
    include: [
      'wrangler.toml',
      './agent.tsx',
      './packages/upstreet-agent/packages/react-agents/entry.ts'
    ],
  },
});
// const loadModule = async (p) => {
//   const viteServer = await viteServerPromise;
//   return await viteServer.ssrLoadModule(p);
// };
const loadModuleSource = async (p) => {
  // read the source code at the path
  const sourceCode = await fs.promises.readFile(p, 'utf8');
  console.log('build dir', cwd);
  const moduleName = './module.mjs';
  const result = await viteBuild({
    root: cwd,
    ssr: {
      noExternal: true,
    },
    build: {
      write: false,
      sourcemap: true,
      rollupOptions: {
        input: moduleName,
        external: [],
      },
      commonjsOptions: {
        include: /node_modules/,
      },
    },
    cacheDir: path.join(homeDir, '.usdk', 'vite'),
    esbuild: {
      jsx: 'transform',
    },
    optimizeDeps: {
      disabled: false,
      include: ['**/*'],
      exclude: [],
    },
    plugins: [
      {
        name: 'virtual-module',
        resolveId(id) {
          if (id === moduleName) {
            return id;
          }
        },
        load(id) {
          if (id === moduleName) {
            return sourceCode;
          }
        }
      },
    ],
  });
  
  if (!result || !result.output || !result.output[0]) {
    throw new Error('Build failed to produce output');
  }

  // XXX debugging
  fs.writeFileSync('/tmp/result.json', JSON.stringify(result.output[0], null, 2));

  const code = result.output[0].code;
  return code;
  // const map = result.output[0].map;
  // const base64Map = Buffer.from(JSON.stringify(map)).toString('base64');
  // const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${base64Map}`;
  // return `${code}\n${sourceMapComment}`;
};
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

      const p = path.join(dirname, 'entry.mjs');
      // console.log('load module source', p);
      const moduleSource = await loadModuleSource(p);
      // console.log('moduleSource', moduleSource);

      // XXX debugging
      fs.writeFileSync('/tmp/module.mjs', moduleSource);

      // create the worker
      const cp = crossSpawn(process.execPath, [
        path.join(dirname, 'worker.mjs'),
      ], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      });
      cp.stdout.pipe(process.stdout);
      cp.stderr.pipe(process.stderr);
      cp.on('exit', (code) => {
        console.log('worker exited', code);
      });
      cp.on('error', (err) => {
        console.error('worker error', err);
      });

      cp.send({
        method: 'init',
        args: [
          moduleSource,
        ],
      });

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

// process.on('message', async (eventData) => {
//   console.log('got event', eventData);

//   throw new Error('not implemented');

//   /* const method = eventData?.method;
//   switch (method) {
//     case 'request': {
//       (async () => {
//         if (!agentMainPromise) {
//           throw new Error('agent worker: DurableObject not initialized');
//         }
//         const agentMain = await agentMainPromise;

//         const { args } = eventData;
//         const {
//           id,
//           method,
//           headers,
//           body,
//         } = args;
//         if (!id) {
//           throw new Error('request message missing id: ' + JSON.stringify(args));
//         }

//         let resultArrayBuffer = null;
//         let resultStatus = null;
//         let resultHeaders = null;
//         let error = null;
//         try {
//           const request = new Request(args.url, {
//             method,
//             headers,
//             body,
//           });

//           const res = await agentMain.fetch(request);
//           // console.log('got durable object response', res.ok, res.status, res.headers);
//           if (res.ok) {
//             resultArrayBuffer = await res.arrayBuffer();
//             resultStatus = res.status;
//             resultHeaders = headersToObject(res.headers);
//           } else {
//             throw new Error('Failed to fetch: ' + res.status);
//           }
//         } catch (err) {
//           console.error('Failed to fetch', err);
//           error = err;
//         }

//         globalThis.postMessage({
//           method: 'response',
//           args: {
//             id,
//             status: resultStatus,
//             body: resultArrayBuffer,
//             headers: resultHeaders,
//             error,
//           },
//         });
//       })();
//       break;
//     }
//     default: {
//       console.error('unknown method', method);
//       break;
//     }
//   } */
// });