import path from 'path';
import crossSpawn from 'cross-spawn';
import 'react-agents-builder';

import Worker from 'web-worker';
globalThis.Worker = Worker;

//

const localDirectory = new URL('.', import.meta.url).pathname;

//

export class ReactAgentsNodeRuntime {
  agentSpec;
  cp = null;
  constructor(agentSpec) {
    this.agentSpec = agentSpec;
  }
  async start({
    debug = false,
  } = {}) {
    const {
      directory,
      portIndex,
    } = this.agentSpec;

    const cp = crossSpawn(
      'node',
      [
        '--no-warnings',
        '--experimental-wasm-modules',
        '--experimental-transform-types',
        path.join(localDirectory, 'worker.mjs'),
      ],
      {
        stdio: 'pipe',
        // stdio: 'inherit',
        cwd: directory,
      },
    );
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
    cp.on('error', err => {
      console.warn('node runtime got error', err);
    });
    cp.on('exit', (code) => {
      console.warn('node runtime got exit', code);
    });

    /* this.worker = new Worker(new URL('./worker.ts', import.meta.url));

    const env = {
      AGENT_JSON: JSON.stringify(agentJson),
      AGENT_TOKEN: apiKey,
      WALLET_MNEMONIC: mnemonic,
      SUPABASE_URL,
      SUPABASE_PUBLIC_API_KEY,
      WORKER_ENV: 'development', // 'production',
    };
    console.log('starting worker with env:', env);
    this.worker.postMessage({
      method: 'initDurableObject',
      args: {
        env,
        agentSrc,
      },
    });
    this.worker.addEventListener('error', e => {
      console.warn('got error', e);
    }); */
  }
  async fetch(url, opts) {
    const requestId = crypto.randomUUID();
    const {
      method, headers, body,
    } = opts;
    this.worker.postMessage({
      method: 'request',
      args: {
        id: requestId,
        url,
        method,
        headers,
        body,
      },
    }, []);
    const res = await new Promise<Response>((accept, reject) => {
      const onmessage = (e) => {
        // console.log('got worker message data', e.data);
        try {
          const { method } = e.data;
          switch (method) {
            case 'response': {
              const { args } = e.data;
              const {
                id: responseId,
              } = args;
              if (responseId === requestId) {
                cleanup();

                const {
                  error, status, headers, body,
                } = args;
                if (!error) {
                  const res = new Response(body, {
                    status,
                    headers,
                  });
                  accept(res);
                } else {
                  reject(new Error(error));
                }
              }
              break;
            }
            default: {
              console.warn('unhandled worker message method', e.data);
              break;
            }
          }
        } catch (err) {
          console.error('failed to handle worker message', err);
          reject(err);
        }
      };
      this.worker.addEventListener('message', onmessage);

      const cleanup = () => {
        this.worker.removeEventListener('message', onmessage);
      };
    });
    return res;
  }
  terminate() {
    this.worker.terminate();
  }
}