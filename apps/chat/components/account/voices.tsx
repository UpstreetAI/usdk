'use client';

import React, { useState } from 'react';
import dedent from 'dedent';
import { Button } from '@/components/ui/button';
import { IconDots } from '@/components/ui/icons';
import { useRouter } from 'next/navigation';
import { makeAnonymousClient } from '@/utils/supabase/supabase-client';
import { getJWT } from '@/lib/jwt';
import { env } from '@/lib/env'
import { AutoVoiceEndpoint, VoiceEndpointVoicer } from 'react-agents/lib/voice-output/voice-endpoint-voicer.mjs';
import { AudioDecodeStream } from '@upstreet/multiplayer/public/audio-worker/audio-decode.mjs';
import { AudioContextOutputStream } from '@/lib/audio/audio-context-output';
import { aiProxyHost } from '../../utils/const/endpoints';
import * as codecs from '@upstreet/multiplayer/public/audio-worker/ws-codec-runtime-worker.mjs';

const voicesEndpointApiUrl = `https://${aiProxyHost}/api/ai-voice/voices`;

export interface AgentsProps {
  voices: object[];
  userIsCurrentUser: boolean;
}

export interface ActionsProps {
  id: string;
  i: number;
}

export function Voices({ voices: voicesInit, userIsCurrentUser }: AgentsProps) {
  const router = useRouter();
  const [voices, setVoices] = useState(() => voicesInit);
  const [openVoiceIndex, setOpenVoiceIndex] = useState(-1);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [adding, setAdding] = useState(false);

  // Agent row actions
  const RowActions = ({ id, i }: ActionsProps) => {
    return (
      <>
        <div
          className="w-8 text-center flex flex-col px-2 py-1 mb-auto cursor-pointer rounded border bg-primary/10 hover:bg-primary/20 active:bg-primary/30"
          onClick={(e) => {
            setOpenVoiceIndex(
              i === openVoiceIndex ? -1 : i
            );
          }}
        >
          <IconDots />
        </div>
        {i === openVoiceIndex && (
          <div className="absolute flex flex-col top-0 right-10 p-2 rounded border cursor-auto bg-primary/10">
            <Button
              variant="outline"
              className="text-xs mb-1"
              onClick={(e) => {
                // setOpenVoiceIndex(-1);

                (async () => {
                  const sampleText = dedent`\
                    Let's do tricks with bricks and blocks, sir.
                    First, I'll make a quick trick brick stack.
                    Then I'll make a quick trick block stack.
                  `;

                  const jwt = await getJWT();
                  const supabase = makeAnonymousClient(env, jwt);
                  const result = await supabase.from('assets')
                    .select('*')
                    // .eq('name', voiceName)
                    .eq('id', id)
                    // .eq('user_id', userId)
                    .eq('type', 'voice')
                    .maybeSingle();
                  const { error, data } = result;
                  if (!error) {
                    // console.log(JSON.stringify(data, null, 2));
                    if (data) {
                      const { start_url } = data;
                      const res = await fetch(start_url);
                      if (res.ok) {
                        const voiceJson = await res.json();

                        const { voiceEndpoint: voiceEndpointString } = voiceJson;
                        const match = voiceEndpointString.match(/^([^:]+?):([^:]+?):([^:]+?)$/);
                        if (match) {
                          const [_, model, voiceName, voiceId] = match;

                          // input
                          const voiceEndpoint = new AutoVoiceEndpoint({
                            model,
                            voiceId,
                          });
                          const voiceEndpointVoicer = new VoiceEndpointVoicer({
                            voiceEndpoint,
                            // audioManager: null,
                            // sampleRate,
                            jwt,
                          });
                          const readableStream = voiceEndpointVoicer.getVoiceStream(sampleText);

                          // output
                          const outputStream = new AudioContextOutputStream();
                          const { sampleRate } = outputStream;
                          // decode stream
                          const decodeStream = new AudioDecodeStream({
                            type: 'audio/mpeg',
                            sampleRate,
                            format: 'f32',
                            codecs,
                          }) as any;
                          readableStream
                            .pipeThrough(decodeStream)
                            .pipeTo(outputStream);
                        } else {
                          console.warn('invalid voice endpoint:', voiceEndpointString);
                          throw new Error('invalid voice endpoint');
                        }
                      } else {
                        console.warn('could not get voice json:', res.status);
                        throw new Error('could not get voice json');
                      }
                    } else {
                      console.warn('no such voice: ' + voiceName);
                      throw new Error('no such voice');
                    }
                  } else {
                    console.warn('error getting voice:', error);
                    throw error;
                  }
                })();
                console.log('voice test', id);
              
              }}
            >
              Test
            </Button>
            <Button
              variant="outline"
              className="text-xs mb-1"
              onClick={(e) => {
                // setOpenVoiceIndex(-1);

                (async () => {
                  const jwt = await getJWT();

                  const u = `${voicesEndpointApiUrl}/${id}`;
                  const res = await fetch(u, {
                    method: 'DELETE',
                    headers: {
                      Authorization: `Bearer ${jwt}`,
                    },
                  });
                  if (res.ok) {
                    const j = await res.json();
                    // console.log('got remove response', j);
                    // return j;

                    setVoices((voices) => voices.filter((voice) => (voice as any).id !== id));
                  } else {
                    if (res.status === 404) {
                      console.log(`voice not found: ${id}`);
                    } else {
                      const text = await res.text();
                      throw new Error(`failed to get voice response: ${u}: ${res.status}: ${text}`);
                    }
                  }
                })();
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="m-auto w-full max-w-4xl">
      <div className="sm:flex sm:flex-col sm:align-center py-2 md:py-4">
        <h1 className="text-2xl font-extrabold text-white sm:text-center sm:text-4xl">
          Voices
        </h1>
        <p className="max-w-2xl m-auto md:mt-4 text-lg text-zinc-200 sm:text-center sm:text-xl">
          Uploaded voices: <span className="text-purple-500 font-bold">{voices.length}</span>
        </p>
      </div>
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          <div className="w-full">
            {voices.length > 0 ? (
              <>
                {/* Desktop View */}
                <div className="hidden md:block relative shadow-md sm:rounded-lg">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-50 uppercase bg-border">
                      <tr>
                        {/* <th scope="col" className="px-6 w-[60px] py-3 text-[rgba(255,255,255,0.6)]">PFP</th> */}
                        <th scope="col" className="px-2 md:px-6 min-w-40 py-3 text-[rgba(255,255,255,0.6)]">Name</th>
                        {/* <th scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)] text-center">Credits Used</th> */}
                        {/* <th scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Chart</th> */}
                        <th scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voices.map((voice: object, i: number) => {
                        const {
                          id,
                          name,
                          description,
                        } = voice as any;

                        return (
                          <tr
                            className="w-full hover:bg-border text-white bg-[rgba(255,255,255,0.1)] mt-1"
                            key={i}
                          >
                            <td className="px-2 md:px-6 min-w-40 py-4 text-md capitalize align-top">
                              <a href={`/agents/${id}`} className="block hover:underline">
                                <div className="font-bold line-clamp-1">{name}</div>
                                <div className="w-full line-clamp-1">
                                  {description}
                                </div>
                              </a>
                            </td>
                            <td className="relative px-2 md:px-6 py-4 text-md capitalize align-middle text-right">
                              <div className="relative inline-block w-8">
                                {userIsCurrentUser && <RowActions id={id} i={i} />}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden block space-y-4">
                  {voices.map((voice: object, i: number) => {
                    const {
                      id,
                      name,
                      description,
                      // start_url,
                      // preview_url,
                      // version,
                      // credits_usage,
                    } = voice as any;

                    return (
                      <div
                        className="bg-[rgba(255,255,255,0.1)] rounded-lg p-4 relative"
                        key={i}
                      >
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className='flex'>
                              <div className="font-bold text-white line-clamp-2">{name}</div>
                            </div>
                            <div className="text-gray-400 line-clamp-1">{description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>)
            : (
              <div className="">
                No voices
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">
          {/* voice add upload */}
          <h2 className="mb-4 text-2xl font-extrabold text-white sm:text-center sm:text-4xl">
            Add voice
          </h2>
          <div className="flex flex-col w-full">
            <input type="text" value={voiceName} placeholder="Voice name" onChange={e => {
              setVoiceName(e.target.value);
            }} disabled={adding} />
            <input type="text" value={voiceDescription} placeholder="Voice description" onChange={e => {
              setVoiceDescription(e.target.value);
            }} disabled={adding} />
            <input type="file" multiple onChange={e => {
              setFiles(Array.from(e.target.files ?? []));
            }} disabled={adding} />
            <Button
              variant="outline"
              className="text-xs mb-1"
              onClick={(e) => {
                if (voiceName && files.length > 0 && !adding) {
                  (async () => {
                    try {
                      setAdding(true);

                      const jwt = await getJWT();
                      
                      const fd = new FormData();
                      fd.append('name', voiceName);
                      fd.append('description', voiceDescription);
                      for (const file of files) {
                        fd.append('files', file, file.name);
                      }

                      const res = await fetch(`${voicesEndpointApiUrl}/add`, {
                        method: 'POST',
                        body: fd,
                        headers: {
                          Authorization: `Bearer ${jwt}`,
                        },
                      });
                      if (res.ok) {
                        const j = await res.json();
                        // console.log('got add response', j);
                        // return j;

                        setVoices((voices) => [...voices, j]);
                      } else {
                        const text = await res.text();
                        throw new Error(`failed to get voice response: ${res.status}: ${text}`);
                      }
                    } finally {
                      setAdding(false);
                    }
                  })();
                }
              }}
              disabled={!(voiceName && voiceDescription && files.length > 0) || adding}
            >
              {!adding ? `Upload voice` : `Uploading...`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
