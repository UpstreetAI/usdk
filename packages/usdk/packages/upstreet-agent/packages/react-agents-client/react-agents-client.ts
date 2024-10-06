import path from 'path';
import * as esbuild from 'esbuild-wasm';
import { FetchOpts } from './types';
import {
  SUPABASE_URL,
  SUPABASE_PUBLIC_API_KEY,
} from './secrets.mjs';

const ensureEsbuild = (() => {
  let esBuildPromise: Promise<void> | null = null;
  return () => {
    if (!esBuildPromise) {
      esBuildPromise = (async () => {
        try {
          const u = new URL('esbuild-wasm/esbuild.wasm', import.meta.url);
          await esbuild.initialize({
            worker: true,
            wasmURL: u.href,
          });
        } catch (err) {
          console.warn('failed to initialize esbuild', err);
        }
      })();
    }
    return esBuildPromise;
  };
})();
const defaultFiles = [
  {
    path: '/example.ts',
    content: `\
      export const example = 'This is an example module';
    `,
  },
];

//

export const buildAgentSrc = async (sourceCode: string, {
  files = defaultFiles,
} = {}) => {
  await ensureEsbuild();

  const fileMap = new Map(files.map(file => [file.path, file.content]));
  const filesNamespace = 'files';
  const globalImportMap = new Map(Array.from(Object.entries({
    'react': 'React',
    'zod': 'zod',
    'react-agents': 'ReactAgents',
  })));
  const globalNamespace = 'globals';

  const result = await esbuild.build({
    stdin: {
      contents: sourceCode,
      resolveDir: '/', // Optional: helps with resolving imports
      sourcefile: 'app.tsx', // Optional: helps with error messages
      loader: 'tsx', // Set the appropriate loader based on the source type
    },
    bundle: true,
    outdir: 'dist',
    format: 'esm',
    plugins: [
      {
        name: 'globals-plugin',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const p = args.path;
            const globalName = globalImportMap.get(p);
            // console.log('got resolve', {args, p, globalName});
            if (globalName) {
              return { path: p, namespace: globalNamespace };
            }
            return null; // Continue with the default resolution
          });
          build.onLoad({ filter: /.*/, namespace: globalNamespace }, (args) => {
            const p = args.path;
            const globalName = globalImportMap.get(p);
            // console.log('got load', {args, p, globalName});
            if (globalName) {
              return {
                // globalImports is initialized by the worker wrapper
                contents: `module.exports = globalImports[${JSON.stringify(globalName)}];`,
                loader: 'js',
              };
            }
            return null; // Continue with the default loading
          });
        },
      },
      {
        name: 'files-plugin',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const p = path.resolve(args.resolveDir, args.path);
            // console.log('got resolve', {args, p});
            if (fileMap.has(p)) {
              return { path: p, namespace: filesNamespace };
            }
            return null; // Continue with the default resolution
          });
          build.onLoad({ filter: /.*/, namespace: filesNamespace }, (args) => {
            // console.log('got load', args);
            const p = args.path;
            const contents = fileMap.get(p);
            if (contents) {
              return { contents, loader: 'tsx' };
            }
            return null; // Continue with the default loading
          });
        },
      },
    ],
  });
  const {
    errors = [],
    outputFiles = [],
  } = result;
  if (errors.length === 0) {
    const outputFile = outputFiles[0];
    // console.log('got output file', outputFile);
    const { contents } = outputFile;
    const textDecoder = new TextDecoder();
    const text = textDecoder.decode(contents);
    // console.log('got contents');
    // console.log(text);
    return text;
  } else {
    console.warn('build errors: ', errors);
    throw new Error('Failed to build: ' + JSON.stringify(errors));
  }
};

//

class FetchableWorker extends Worker {
  constructor(url: string | URL) {
    super(url);
  }
  async fetch(url: string, opts: FetchOpts) {
    const requestId = crypto.randomUUID();
    const {
      method, headers, body,
    } = opts;
    this.postMessage({
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
      this.addEventListener('message', onmessage);

      const cleanup = () => {
        this.removeEventListener('message', onmessage);
      };
    });
    return res;
  }
}
export class ReactAgentsWorker extends FetchableWorker {
  constructor({
    agentJson,
    agentSrc,
    apiKey,
  }: {
    agentJson: any,
    agentSrc: string,
    apiKey: string,
  }) {
    super(new URL('react-agents-client/worker.tsx', import.meta.url));

    // const mnemonic = generateMnemonic();
    const env = {
      AGENT_JSON: JSON.stringify(agentJson),
      AGENT_TOKEN: apiKey,
      // WALLET_MNEMONIC: mnemonic,
      SUPABASE_URL,
      SUPABASE_PUBLIC_API_KEY,
      WORKER_ENV: 'development', // 'production',
    };
    console.log('starting worker with env:', env);

    this.postMessage({
      method: 'initDurableObject',
      args: {
        env,
        agentSrc,
      },
    });
    this.addEventListener('error', e => {
      console.warn('got error', e);
    });
  }
}