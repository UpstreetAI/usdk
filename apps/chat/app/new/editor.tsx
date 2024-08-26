'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import path from 'path';
// import dedent from 'dedent';
// import { z } from 'zod';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';
// import { Interactor } from 'usdk/lib/interactor';
// import { ValueUpdater } from 'usdk/lib/value-updater';
// import { generateCharacterImage } from 'usdk/sdk/src/util/generate-image.mjs';

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

export default function AgentEditor() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visualDescription, setVisualDescription] = useState('');
  const [deploying, setDeploying] = useState(false);
  // const [autofilling, setAutofilling] = useState(false);
  const builder = useMemo(() => {
    (async () => {
      await ensureEsbuild();

      // escape all characters that need to be escaped in a regular expression
      // const regexpEscape = (s: string) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

      const sourceCode = `\
        import React from 'react';
        import * as ReactAgents from 'react-agents';
        import { example } from './example.ts';

        console.log({
          React,
          ReactAgents,
          example,
        });
      `;
      const files = [
        {
          path: '/example.ts',
          content: `\
            export const example = 'This is an example module';
          `,
        },
      ];
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
                    contents: `module.exports = ${globalName};`,
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
        console.log('got contents');
        console.log(text);
      } else {
        console.warn('build errors: ', errors);
        throw new Error('Failed to build: ' + JSON.stringify(errors));
      }
    })();
  }, []);
  const durableObjectWorker = useMemo(() => {
    const durableObjectWorker = new Worker(new URL('usdk/sdk/durable-object.tsx', import.meta.url));
    durableObjectWorker.addEventListener('message', e => {
      console.log('got message', e.data);
    });
    durableObjectWorker.addEventListener('error', e => {
      console.warn('got error', e);
    });
    console.log('created durableObjectWorker', durableObjectWorker);
    return durableObjectWorker;
  }, []);
  const formEl = useRef<HTMLFormElement>(null);

  const monaco = useMonaco();

  const [prompt, setPrompt] = useState('');

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1">
        <div className="flex flex-col flex-1 bg-primary/10">
          Chat history
        </div>
        <form
          className="flex"
          onSubmit={async e => {
            // const jwt = await getJWT();
            console.warn('nor implemented');
          }}
        >
          <input
            type="text"
            className="flex-1 px-4"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              formEl.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }}
          >Send</Button>
        </form>
      </div>
      <form className="relative flex flex-col flex-1" ref={formEl} onSubmit={e => {
        e.preventDefault();

        // check if the form is validated
        const valid = formEl.current?.checkValidity();
        if (valid) {
          (async () => {
            setDeploying(true);

            // get the value from monaco editor
            const value = monaco?.editor.getModels()[0].getValue();
            console.log('deploy', {
              name,
              description,
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
          {/* <Button
            className='mr-2'
            onClick={async e => {
              e.preventDefault();
              e.stopPropagation();

              setAutofilling(true);
              try {
                
              } finally {
                setAutofilling(false);
              }
            }}
            disabled={autofilling}
          >{!autofilling ? `Autofill` : 'Autofilling...'}</Button> */}
          <Button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();

              formEl.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
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
          onMount={editor => {
            (editor as any)._domElement.parentNode.style.flex = 1;
          }}
        />
      </form>
      
    </div>
  );
};
