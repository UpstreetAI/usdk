import path from 'path';
import crossSpawn from 'cross-spawn';
import { devServerPort } from './util/ports.mjs';

//

const localDirectory = new URL('.', import.meta.url).pathname;

//

const bindProcess = (cp) => {
  process.on('exit', () => {
    // console.log('got exit', cp.pid);
    try {
      process.kill(cp.pid, 'SIGTERM');
    } catch (err) {
      console.warn(err.stack);
    }
  });
};

//

export class ReactAgentsNodeRuntime {
  agentSpec;
  cp = null;
  constructor(agentSpec) {
    this.agentSpec = agentSpec;
  }
  async start({
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
        path.join(localDirectory, 'watcher.mjs'),
        'run',
        directory,
        '--var', 'WORKER_ENV:development',
        '--ip', '0.0.0.0',
        '--port', devServerPort + portIndex,
      ],
      {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        // cwd: directory,
      },
    );
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
    bindProcess(cp);
    cp.on('error', err => {
      console.warn('node runtime got error', err);
    });
    cp.on('exit', (code) => {
      console.warn('node runtime got exit', code);
    });
    cp.on('error', e => {
      console.warn('got error', e);
    });
    console.log('node runtime wait 1');
    await new Promise((resolve) => {
      const message = (e) => {
        console.log('node runtime got message', e);
        cleanup();
        resolve(null);
      };
      cp.on('message', message);
      const cleanup = () => {
        cp.removeListener('message', message);
      };
    });
    console.log('node runtime wait 2');
    this.cp = cp;
  }
  /* async fetch(url, opts) {
    const requestId = crypto.randomUUID();
    const {
      method, headers, body,
    } = opts;
    this.cp.send({
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
      this.cp.on('message', onmessage);

      const cleanup = () => {
        this.cp.removeListener('message', onmessage);
      };
    });
    return res;
  } */
  terminate() {
    return new Promise((accept, reject) => {
      if (this.cp === null) {
        accept(null);
      } else {
        if (this.cp.exitCode !== null) {
          // Process already terminated
          accept(this.cp.exitCode);
        } else {
          // Process is still running
          this.cp.on('exit', (code) => {
            accept(code);
          });
          this.cp.on('error', (err) => {
            reject(err);
          });
          this.cp.kill('SIGTERM');
        }
      }
    });
  }
}