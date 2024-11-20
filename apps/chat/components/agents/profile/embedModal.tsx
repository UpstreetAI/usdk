'use client';

import { encrypt } from '@/utils/crypto/cryptouUtils';
import { useState } from 'react';
import { Button } from 'ucom';

export default function EmbedModal({agent, close}: {agent: any, close: () => void}) {
  const [trustedUrls, setTrustedUrls] = useState<string[]>([]);
  const [embedCode, setEmbedCode] = useState<string>('');

  const addUrl = () => {
    const urlInput = document.getElementById('trusted-url-input') as HTMLInputElement;
    const urlValue = urlInput.value.trim();
    if (urlValue) {
      setTrustedUrls([...trustedUrls, urlValue]);
      urlInput.value = '';
    }
  };

  const removeUrl = (url: string) => {
    setTrustedUrls(trustedUrls.filter((item) => item !== url));
  };

  const generateEmbedCode = () => {

    const generateToken = (agentId: string, roomId: string, domain: string) => {
      const tokenData = JSON.stringify({ agentId, roomId, domain });
      return encrypt(tokenData);
    };
  
    const roomId = crypto.randomUUID();
    const domain = 'example.com';
  
    const token = generateToken(agent.id, roomId, domain);

    const embedCode = `<iframe src="${window.location.origin}/embed/${token}" width="600" height="400" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999, background: 'transparent' }}></iframe>`;
    setEmbedCode(embedCode);
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 bg-zinc-950 flex justify-center items-center z-50 text-zinc-900">
      <div className="bg-[#C8CFD7] rounded-lg w-full max-w-4xl">
        <div className='bg-zinc-900 px-4 py-3 text-xl font-bold text-center text-white'>Embed Agent</div>
        <div className="p-6 flex gap-4">
          <div className="w-1/2 border-r border-zinc-400 pr-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="mb-6">
              <label className="block font-medium mb-2">Trusted URLs</label>
              <ul className="mb-4">
                {trustedUrls.map((url, index) => (
                  <li key={index} className="flex justify-between items-center mb-2">
                    <span>{url}</span>
                    <button className="text-red-500" onClick={() => removeUrl(url)}>Remove</button>
                  </li>
                ))}
              </ul>
              <input 
                type="text" 
                id="trusted-url-input" 
                className='w-full px-4 py-2 bg-[#E4E8EF] border-2 border-[#475461] text-gray-900 text-sm mb-2'
                placeholder="Enter a trusted URL"
              />
              <Button onClick={addUrl} className='w-full'>
                Add URL
              </Button>
            </div>
            <div className="flex gap-4">
              <Button onClick={generateEmbedCode}>
                Generate Embed Code
              </Button>
              <Button onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
          {/* Generated Code Section */}
          <div className="w-1/2 pl-6">
            <h2 className="text-xl font-semibold mb-4">Generated Embed Code</h2>
            <textarea value={embedCode} className="w-full h-64 p-4 border-[2px] border-[#475461] bg-[#E4E8EF]" readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}