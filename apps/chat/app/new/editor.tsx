'use client';

import { useState, useRef, useEffect } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';

export default function AgentEditor() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deploying, setDeploying] = useState(false);
  const formEl = useRef<HTMLFormElement>(null);

  const monaco = useMonaco();
  // useEffect(() => {
  //   if (monaco) {
  //     console.log('here is the monaco instance:', monaco);
  //   }
  // }, [monaco]);

  return (
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
      }} required />
      <input type="text" className="p-2 mr-2 flex-1" value={description} placeholder="Description" onChange={e => {
        setDescription(e.target.value);
      }} required />
      <Button onClick={e => {
        formEl.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }} disabled={deploying}>{!deploying ? `Deploy` : 'Deploying...'}</Button>
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

export default function MyAgent(props) {
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
  );
};
