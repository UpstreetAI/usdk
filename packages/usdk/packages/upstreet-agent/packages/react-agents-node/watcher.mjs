import path from 'path';
import fs from 'fs';
import os from 'os';
import crossSpawn from 'cross-spawn';
import { program } from 'commander';
import { createServer as createViteServer, build as viteBuild } from 'vite';
import { Debouncer } from 'debouncer';

//

// const dirname = path.dirname(import.meta.url.replace('file://', ''));

//

const homeDir = os.homedir();

const loadModule = async (directory, p) => {
  const viteServer = await makeViteServer(directory);
  // console.log('get agent module 1');
  const entryModule = await viteServer.ssrLoadModule(p);
  console.log('get agent module 2', entryModule);
  return entryModule.default;
};
/* const loadModuleSource = async (directory, p) => {
  // read the source code at the path
  const sourceCode = await fs.promises.readFile(p, 'utf8');
  // console.log('build dir', directory);
  const moduleName = './module.mjs';
  const result = await viteBuild({
    root: directory,
    ssr: {
      noExternal: true,
    },
    build: {
      write: false,
      sourcemap: true,
      rollupOptions: {
        input: moduleName,
      },
    },
    cacheDir: path.join(homeDir, '.usdk', 'vite'),
    esbuild: {
      jsx: 'transform',
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

  const code = result.output[0].code;
  return code;
  // const map = result.output[0].map;
  // const base64Map = Buffer.from(JSON.stringify(map)).toString('base64');
  // const sourceMapComment = `//# sourceMappingURL=data:application/json;base64,${base64Map}`;
  // return `${code}\n${sourceMapComment}`;
}; */
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

      // const p = path.join(dirname, 'entry.mjs');
      const p = '/packages/upstreet-agent/packages/react-agents-node/entry.mjs';
      // console.log('load module source 1', directory, p);
      const module = await loadModule(directory, p);
      console.log('module', module);

      /* // create the worker
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
      }); */

      const agentWorker = {
        async terminate() {
          // XXX implement this
        },
      };
      return agentWorker;
    })();
  });
};
const makeViteServer = (directory) => {
  return createViteServer({
    root: directory,
    server: { middlewareMode: 'ssr' },
    esbuild: {
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    },
    optimizeDeps: {
      entries: [
        './packages/upstreet-agent/packages/react-agents-node/entry.mjs',
      ],
    },
  });
};
const makeViteWatcher = (directory) => {
  return createViteServer({
    root: directory,
    watch: {
      include: [
        './packages/upstreet-agent/packages/react-agents-node/entry.mjs',
      ],
    },
  });
};
const listenForChanges = async (directory, opts) => {
  const viteWatcher = await makeViteWatcher(directory);
  viteWatcher.watcher.on('change', () => {
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
