'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import path from 'path';
import Editor, { useMonaco } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';
import {
  createAgentGuid,
} from 'usdk/sdk/src/util/guid-util.mjs';
import {
  getAgentToken,
} from 'usdk/sdk/src/util/jwt-utils.mjs';
import {
  generateMnemonic,
} from 'usdk/util/ethereum-utils.mjs';
import {
  Chat,
} from '@/components/chat/chat';

import * as esbuild from 'esbuild-wasm';
const ensureEsbuild = (() => {
  let esBuildPromise: Promise<void> | null = null;
  return () => {
    if (!esBuildPromise) {
      esBuildPromise = (async () => {
        const u = new URL('esbuild-wasm/esbuild.wasm', import.meta.url);
        await esbuild.initialize({
          worker: true,
          wasmURL: u.href,
        });
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
const buildAgentSrc = async (sourceCode: string, {
  files = defaultFiles,
} = {}) => {
  await ensureEsbuild();

  /* const sourceCode = `\
    import React from 'react';
    import {
      Agent,
    } from 'react-agents';
    import { example } from './example.ts';

    console.log({
      React,
      Agent,
      example,
      // error: new Error().stack,
    });

    //

    export default function MyAgent() {
      return (
        <Agent>
        </Agent>
      );
    };
  `; */
  const fileMap = new Map(files.map(file => [file.path, file.content]));
  const filesNamespace = 'files';
  const globalImportMap = new Map(Array.from(Object.entries({
    'react': 'React',
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

type FetchOpts = {
  method?: string;
  headers?: object | Headers;
  body?: string | ArrayBuffer;
};
type FetchableWorker = Worker & {
  fetch: (url: string, opts: FetchOpts) => Promise<Response>;
};

export default function AgentEditor() {
  // state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visualDescription, setVisualDescription] = useState('');

  const [deploying, setDeploying] = useState(false);
  const [room, setRoom] = useState('');
  const [starting, setStarting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const [worker, setWorker] = useState<FetchableWorker | null>(null);

  const [builderPrompt, setBuilderPrompt] = useState('');
  const [agentPrompt, setAgentPrompt] = useState('');

  const builderForm = useRef<HTMLFormElement>(null);
  // const agentForm = useRef<HTMLFormElement>(null);
  const editorForm = useRef<HTMLFormElement>(null);

  const monaco = useMonaco();

  // helpers
  const getEditorValue = (m = monaco) => m?.editor.getModels()[0].getValue() ?? '';
  const startAgent = async (sourceCode = getEditorValue()) => {
    stopAgent();

    setStarting(true);

    console.log('building agent src...', {monaco, sourceCode});
    const agentSrc = await buildAgentSrc(sourceCode);
    console.log('built agent src:', {agentSrc});

    console.log('getting agent id...');
    const jwt = await getJWT();
    const id = await createAgentGuid({
      jwt,
    });
    console.log('got agent id:', id);

    console.log('getting agent token...');
    const agentToken = await getAgentToken(jwt, id);
    console.log('got agent token:', agentToken);

    const agentJson = {
      id,
      name,
      bio: description,
      visualDescription,
    };
    const mnemonic = generateMnemonic();
    const env = {
      AGENT_JSON: JSON.stringify(agentJson),
      AGENT_TOKEN: agentToken,
      WALLET_MNEMONIC: mnemonic,
      SUPABASE_URL: "https://friddlbqibjnxjoxeocc.supabase.co",
      SUPABASE_PUBLIC_API_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyaWRkbGJxaWJqbnhqb3hlb2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDM2NjE3NDIsImV4cCI6MjAxOTIzNzc0Mn0.jnvk5X27yFTcJ6jsCkuXOog1ZN825md4clvWuGQ8DMI",
      WORKER_ENV: 'development', // 'production',
    };
    console.log('starting worker with env:', env);

    // initialize the agent worker
    const newWorker = new Worker(new URL('usdk/sdk/worker.tsx', import.meta.url)) as FetchableWorker;
    newWorker.postMessage({
      method: 'initDurableObject',
      args: {
        env,
        agentSrc,
      },
    });
    newWorker.addEventListener('error', e => {
      console.warn('got error', e);
    });
    // augment the agent worker
    newWorker.fetch = async (url: string, opts: FetchOpts) => {
      const requestId = crypto.randomUUID();
      const {
        method,
        headers,
        body,
      } = opts;
      newWorker.postMessage({
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
                    error,
                    status,
                    headers,
                    body,
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
        newWorker.addEventListener('message', onmessage);

        const cleanup = () => {
          newWorker.removeEventListener('message', onmessage);
        };
      });
      return res;
    };
    setWorker(newWorker);

    const newRoom = `rooms:${id}:browser`;
    setRoom(newRoom);
    setConnecting(true);

    // call the join request on the agent
    const agentHost = `${location.protocol}//${location.host}`;
    const joinReq = await newWorker.fetch(`${agentHost}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        room: newRoom,
        only: true,
      }),
    });
    if (joinReq.ok) {
      const j = await joinReq.json();
      console.log('agent join response json', j);
    } else {
      const text = await joinReq.text();
      console.error('agent failed to join room', joinReq.status, text);
    }

    setStarting(false);
  };
  const stopAgent = () => {
    if (worker) {
      worker.terminate();
      setWorker(null);
    }
    if (room) {
      setRoom('');
    }
  };
  const toggleAgent = async () => {
    if (!worker) {
      await startAgent();
    } else {
      stopAgent();
    }
  };

  // render
  return (
    <div className="flex flex-1">
      {/* builder */}
      <div className="flex flex-col flex-1">
        <div className="flex flex-col flex-1 bg-primary/10">
          Builder chat history
        </div>
        <form
          className="flex"
          onSubmit={async e => {
            e.preventDefault();
            e.stopPropagation();

            if (builderPrompt) {
              console.log('run builder prompt', builderPrompt);
              setBuilderPrompt('');
            }
          }}
          ref={builderForm}
        >
          <input
            type="text"
            className="flex-1 px-4"
            value={builderPrompt}
            onChange={e => setBuilderPrompt(e.target.value)}
          />
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              builderForm.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }}
          >Send</Button>
        </form>
      </div>
      {/* agent */}
      {/* <div className="flex flex-col flex-1">
        <div className="flex flex-col flex-1 bg-primary/10">
          Agent chat history
        </div>
        <form
          className="flex"
          onSubmit={async e => {
            e.preventDefault();
            e.stopPropagation();

            if (agentPrompt) {
              console.log('run agent prompt', agentPrompt);
              setAgentPrompt('');
            }
          }}
          ref={agentForm}
        >
          <input
            type="text"
            className="flex-1 px-4"
            value={agentPrompt}
            onChange={e => setAgentPrompt(e.target.value)}
          />
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              agentForm.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }}
            disabled={!worker}
          >Send</Button>
        </form>
      </div> */}
      <Chat
        room={room}
        onConnect={(connected) => {
          // console.log('got connected', {
          //   connected,
          // });
          if (connected) {
            setConnecting(false);
          }
        }}
      />
      {/* editor */}
      <form className="relative flex flex-col flex-1" ref={editorForm} onSubmit={e => {
        e.preventDefault();

        // check if the form is validated
        const valid = builderForm.current?.checkValidity();
        if (valid) {
          (async () => {
            setDeploying(true);

            // get the value from monaco editor
            const value = getEditorValue();
            console.log('deploy', {
              name,
              description,
              visualDescription,
              value,
            });

            try {
              const jwt = await getJWT();
              const res = await fetch(`${deployEndpointUrl}/agent`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/javascript',
                  Authorization: `Bearer ${jwt}`,
                  metadata: JSON.stringify({
                    name,
                    description,
                    visualDescription,
                  }),
                },
                body: value,
              });
              if (res.ok) {
                const j = await res.json();
                console.log('got deploy result', j);
                const {
                  guid,
                  name,
                  description,
                  visualDescription,
                } = j;
                location.href = `/agents/${guid}`;
                // await new Promise(resolve => setTimeout(resolve, 2000));
              } else {
                console.error('failed to deploy agent', res);
              }
            } finally {
              setDeploying(false);
            }
          })();
        }
      }}>
        <div className="flex m-4">
          <input type="text" className="p-2 mr-2" value={name} placeholder="Name" onChange={e => {
            setName(e.target.value);
          }} />
          <input type="text" className="p-2 mr-2 flex-1" value={description} placeholder="Description" onChange={e => {
            setDescription(e.target.value);
          }} />
          <input type="text" className="p-2 mr-2 flex-1" value={visualDescription} placeholder="Visual description" onChange={e => {
            setVisualDescription(e.target.value);
          }} />
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              toggleAgent();
            }}
          >{(() => {
            if (starting) {
              return 'Starting...';
            } else if (connecting) {
              return 'Connecting...';
            } else if (worker) {
              return 'Stop';
            } else {
              return 'Start';
            }
          })()}</Button>
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              builderForm.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }}
            disabled={deploying}
          >{!deploying ? `Deploy` : 'Deploying...'}</Button>
        </div>
        <Editor
          theme="vs-dark"
          defaultLanguage="javascript"
          defaultValue={`\
import React from 'react';
import {
  Agent,
} from 'react-agents';

//

export default function MyAgent() {
  return (
    <Agent>
      {/* ... */}
    </Agent>
  );
}
`}
          options={{
            readOnly: deploying,
          }}
          onMount={(editor, monaco) => {
            (editor as any)._domElement.parentNode.style.flex = 1;

            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              // // Add your save logic here
              // alert('Ctrl+S pressed');
              startAgent(getEditorValue(monaco));
            });
          }}
        />
      </form>
      
    </div>
  );
};
