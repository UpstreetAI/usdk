import path from 'path';
import fs from 'fs';
import os from 'os';
import crossSpawn from 'cross-spawn';
import { program } from 'commander';
import { createServer as createViteServer, build as viteBuild } from 'vite';
// import wasm from 'vite-plugin-wasm';
// import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { Debouncer } from 'debouncer';

//

const dirname = path.dirname(import.meta.url.replace('file://', ''));

//

// const cwd = process.cwd();
const homeDir = os.homedir();

const loadModuleSource = async (directory, p) => {
  // read the source code at the path
  const sourceCode = await fs.promises.readFile(p, 'utf8');
  // console.log('build dir', directory);
  const moduleName = './module.mjs';
  const result = await viteBuild({
    root: directory,
    ssr: {
      noExternal: true,
      // target: 'node',
    },
    build: {
      write: false,
      sourcemap: true,
      rollupOptions: {
        input: moduleName,
        // external: [],
      },
      // commonjsOptions: {
      //   include: /node_modules/,
      // },
    },
    cacheDir: path.join(homeDir, '.usdk', 'vite'),
    esbuild: {
      jsx: 'transform',
    },
    // optimizeDeps: {
    //   disabled: false,
    //   include: ['**/*'],
    //   exclude: [],
    // },
    plugins: [
      // nodePolyfills({
      //   // globals: {
      //   //   process: false,
      //   //   Buffer: false,
      //   // },
      // }),
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

  // XXX debugging
  fs.writeFileSync('/tmp/result.json', JSON.stringify(result.output[0], null, 2));
  
  if (!result || !result.output || !result.output[0]) {
    throw new Error('Build failed to produce output');
  }

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
const reloadAgentWorker = async (directory, opts) => {
  await reloadDebouncer.waitForTurn(async () => {
    const oldAgentWorkerPromise = agentWorkerPromise;
    agentWorkerPromise = (async () => {
      // wait for the old agent process to terminate
      if (oldAgentWorkerPromise) {
        const oldAgentWorker = await oldAgentWorkerPromise;
        await oldAgentWorker.terminate();
      }

      const p = path.join(dirname, 'entry.mjs');
      // console.log('load module source 1', directory, p);
      const moduleSource = await loadModuleSource(directory, p);
      console.log('moduleSource', moduleSource.length);

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

      const agentWorker = {
        async terminate() {
          // XXX implement this
        },
      };
      return agentWorker;
    })();
  });
};
const listenForChanges = async (directory, opts) => {
  const viteServerPromise = createViteServer({
    root: directory,
    watch: {
      include: [
        'wrangler.toml',
        './agent.tsx',
        './packages/upstreet-agent/packages/react-agents/entry.ts'
      ],
      // plugins: [
      //   nodePolyfills({
      //     // globals: {
      //     //   process: false,
      //     //   Buffer: false,
      //     // },
      //   }),
      // ],
    },
  });
  const viteServer = await viteServerPromise;
  viteServer.watcher.on('change', () => {
    reloadAgentWorker(directory, opts);
  });
};

const main = async () => {
  let commandExecuted = false;

  program
    .command('run')
    .description('Run the agent')
    .argument(`[directory]`, `Agent directory`)
    .option('--var <vars...>', 'Environment variables in format KEY:VALUE')
    .requiredOption('--ip <ip>', 'IP address to bind to')
    .requiredOption('--port <port>', 'Port to bind to')
    .action(async (directory, opts) => {
      commandExecuted = true;

      reloadAgentWorker(directory, opts);
      // listenForChanges(directory, opts);
    });

  await program.parseAsync();

  if (!commandExecuted) {
    console.error('Command missing');
    process.exit(1);
  }
};
main().catch(err => {
  console.error(err);
  process.exit(1);
});
