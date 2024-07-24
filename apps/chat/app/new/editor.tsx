'use client';

import { useState, useEffect } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';

export default function AgentEditor() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deploying, setDeploying] = useState(false);
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      console.log('here is the monaco instance:', monaco);
    }
  }, [monaco]);

  return (
    <div className="relative flex flex-col flex-1">
      <div className="flex m-4">
        <input type="text" className="p-2 mr-2" value={name} placeholder="Name" onChange={e => {
          setName(e.target.value);
        }} />
        <input type="text" className="p-2 mr-2 flex-1" value={description} placeholder="Description" onChange={e => {
          setDescription(e.target.value);
        }} />
        <Button onClick={e => {
          (async () => {
            setDeploying(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            setDeploying(false);
          })();
        }} disabled={deploying}>{!deploying ? `Deploy` : 'Deploying...'}</Button>
      </div>
      <Editor
        theme="vs-dark"
        defaultLanguage="javascript"
        defaultValue="// some comment"
        options={{
          readOnly: deploying,
        }}
        onMount={editor => {
          (editor as any)._domElement.parentNode.style.flex = 1;
        }}
      />
    </div>
  );
};
