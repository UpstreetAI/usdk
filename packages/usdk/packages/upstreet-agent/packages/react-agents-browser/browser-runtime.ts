import { FetchOpts } from './types';

//

export class ReactAgentsWorker {
  worker: Worker;
  constructor({
    agentJson,
    agentModuleSrc,
    auth,
  }: {
    agentJson: any,
    agentModuleSrc: string,
    auth: any,
  }) {
    if (
      !agentJson ||
      !agentModuleSrc ||
      !auth
    ) {
      throw new Error('missing required options: ' + JSON.stringify({
        agentJson,
        agentModuleSrc,
        auth,
      }));
    }
    console.log('got agent src', agentModuleSrc);

    this.worker = new Worker(new URL('./worker.ts', import.meta.url));

    this.worker.postMessage({
      method: 'init',
      args: {
        agentJson,
        auth,
        agentModuleSrc,
      },
    });
    this.worker.addEventListener('error', e => {
      console.warn('got error', e);
    });
  }
  async fetch(url: string, opts: FetchOpts) {
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
      const onmessage = (e: MessageEvent) => {
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