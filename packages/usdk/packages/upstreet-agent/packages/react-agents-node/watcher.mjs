import path from 'path';
// import fs from 'fs';
// import os from 'os';
import crossSpawn from 'cross-spawn';
import { program } from 'commander';
import { createServer as createViteServer, build as viteBuild } from 'vite';
import { Debouncer } from 'debouncer';

//

const dirname = path.dirname(import.meta.url.replace('file://', ''));
// const homeDir = os.homedir();

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

      // initialize args
      const args = [
        path.join(dirname, 'worker.mjs'),
        'run',
        directory,
      ];
      // pass the opts
      if (opts.var) {
        if (Array.isArray(opts.var)) {
          for (const v of opts.var) {
            args.push('--var', v);
          }
        } else {
          args.push('--var', opts.var);
        }
      }
      if (opts.ip) {
        args.push('--ip', opts.ip);
      }
      if (opts.port) {
        args.push('--port', opts.port);
      }

      // create the worker
      const cp = crossSpawn(process.execPath, args, {
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

      const agentWorker = {
        terminate() {
          return new Promise((accept, reject) => {
            if (cp.exitCode !== null) {
              // Process already terminated
              accept(cp.exitCode);
            } else {
              // Process is still running
              cp.on('exit', (code) => {
                accept(code);
              });
              cp.on('error', (err) => {
                reject(err);
              });
              cp.kill('SIGTERM');
            }
          });
        },
      };
      return agentWorker;
    })();
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
      listenForChanges(directory, opts);
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
