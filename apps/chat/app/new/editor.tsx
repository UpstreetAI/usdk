'use client';

import { useState, useRef, useEffect } from 'react';
import dedent from 'dedent';
import { z } from 'zod';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';
import { Interactor } from 'usdk/lib/interactor';
import { ValueUpdater } from 'usdk/lib/value-updater';
import { fetchJsonCompletion  } from '@/utils/fetch';
import { generateCharacterImage } from 'usdk/sdk/src/util/generate-image';

export default function AgentEditor() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visualDescription, setVisualDescription] = useState('');
  const [deploying, setDeploying] = useState(false);
  // const [autofilling, setAutofilling] = useState(false);
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
            const jwt = await getJWT();

            const visualDescriptionValueUpdater = new ValueUpdater(async (visualDescription, {
              signal,
            }) => {
              const {
                blob,
              } = await generateCharacterImage(visualDescription, undefined, {
                jwt,
              });
              return blob;
            });

            const interactor = new Interactor({
              prompt: dedent`\
                Generate and configure an AI agent character.
                The \`visualDescription\` should be an image prompt to use for an image generator. Visually describe the character without referring to their pose or emotion.
                e.g. 'teen girl with medium blond hair and blue eyes, purple dress, green hoodie, jean shorts, sneakers'
              ` + '\n' +
                dedent`\
                  The available capabilities are:
                ` + '\n' +
                // capabilitySpecs.map(({ name, description }) => {
                //   return `'${name}': ${description}`;
                // }).join('\n') + '\n' +
                (prompt ? ('The user has provided the following prompt:\n' + prompt) : ''),
              // object: agentJson,
              objectFormat: z.object({
                name: z.string().optional(),
                bio: z.string().optional(),
                visualDescription: z.string().optional(),
                // capabilities: z.array(z.enum(capabilityNames)),
              }),
              jwt,
            });
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
