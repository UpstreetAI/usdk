'use client';

import { useEffect, useState } from 'react';
import { Button } from 'ucom';
import { getUserForJwt, makeAnonymousClient } from '@/utils/supabase/supabase-client';
import { getJWT } from '@/lib/jwt';
import { env } from '@/lib/env';

export default function EmbedModal({agent, close}: {agent: any, close: () => void}) {
  const [trustedUrls, setTrustedUrls] = useState<string[]>(agent?.embed?.trusted_urls ?? []);
  const [embedCode, setEmbedCode] = useState<string>('');

  const updateTrustedUrls = async (urls: string[]) => {
    const jwt = await getJWT();
    const supabase = makeAnonymousClient(env, jwt);
    const { data, error } = await supabase
      .from('embed_agent')
      .upsert({ asset_id: agent.id, trusted_urls: urls }, { onConflict: 'asset_id' });

    if (error) {
      console.error('Error updating trusted URLs:', error);
    } else {
      console.log('Trusted URLs updated:', data);
    }
  };

  const addUrl = async () => {
    const urlInput = document.getElementById('trusted-url-input') as HTMLInputElement;
    const urlValue = urlInput.value.trim();
    if (urlValue) {
      const updatedUrls = [...trustedUrls, urlValue];
      setTrustedUrls(updatedUrls);
      urlInput.value = '';
      await updateTrustedUrls(updatedUrls);
    }
  };

  const removeUrl = async (url: string) => {
    const updatedUrls = trustedUrls.filter((item) => item !== url);
    setTrustedUrls(updatedUrls);
    await updateTrustedUrls(updatedUrls);
  };

  const generateEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.origin}/embed/${agent.id}" width="600" height="400" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999, background: 'transparent' }}></iframe>`;
    setEmbedCode(embedCode);
  };

  useEffect(() => {
    generateEmbedCode();
  }, []);

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