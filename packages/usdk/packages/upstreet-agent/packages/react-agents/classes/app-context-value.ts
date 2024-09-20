import { useState, useEffect, useMemo, useRef } from 'react';
import type {
  ZodTypeAny,
} from 'zod';
import type {
  ActiveAgentObject,
  SubtleAi,
  TtsArgs,
  ChatArgs,
  SubtleAiCompleteOpts,
  SubtleAiImageOpts,
  ChatMessages,
  RenderRegistry,
  ReadableAudioStream,
  ChatsSpecification,
} from '../types';
import { AutoVoiceEndpoint, VoiceEndpointVoicer } from '../lib/voice-output/voice-endpoint-voicer.mjs';
// import { createOpusReadableStreamSource } from '../lib/multiplayer/public/audio/audio-client.mjs';
// import { NetworkRealms } from "../lib/multiplayer/public/network-realms.mjs";
import {
  lembed,
} from '../util/embedding.mjs';
import { fetchChatCompletion, fetchJsonCompletion } from '../util/fetch.mjs';
import { fetchImageGeneration } from '../util/generate-image.mjs';
import { useAgent } from '../hooks';
import {
  uint8ArrayToBase64,
  makePromise,
  base64ToUint8Array,
} from '../util/util.mjs';
import { zbdecode, zbencode } from '../lib/zjs/encoding.mjs';

//

export class AppContextValue {
  // members
  subtleAi: SubtleAi;
  agentJson: object;
  wallets: any;
  authToken: string;
  supabase: any;
  chatsSpecification: ChatsSpecification;
  registry: RenderRegistry;

  constructor({
    subtleAi,
    agentJson,
    wallets,
    authToken,
    supabase,
    chatsSpecification,
    registry,
  }: {
    subtleAi: SubtleAi;
    agentJson: object;
    wallets: any;
    authToken: string;
    supabase: any;
    chatsSpecification: ChatsSpecification;
    registry: RenderRegistry;
  }) {
    this.subtleAi = subtleAi;
    this.agentJson = agentJson;
    this.wallets = wallets;
    this.authToken = authToken;
    this.supabase = supabase;
    this.chatsSpecification = chatsSpecification;
    this.registry = registry;
  }

  // hooks

  useAgentJson() {
    return this.agentJson;
  }
  useWallets() {
    return this.wallets;
  }
  useAuthToken() {
    return this.authToken;
  }
  useSupabase() {
    return this.supabase;
  }
  useChatsSpecification() {
    return this.chatsSpecification;
  }
  useRegistry() {
    return this.registry;
  }

  useKv() {
    const agent = useAgent();
    const supabase = agent.useSupabase();

    const getFullKey = (key: string) => `${agent.id}:${key}`;

    const [kvCache, setKvCache] = useState(() => new Map<string, any>());
    const kvLoadPromises = useMemo(() => new Map<string, Promise<any>>(), []);
    const makeLoadPromise = async (key: string, defaultValue?: any) => {
      const fullKey = getFullKey(key);
      const result = await supabase
        .from('keys_values')
        .select('*')
        .eq('key', fullKey)
        .maybeSingle();
      const { error, data } = result;
      if (!error) {
        if (data) {
          const base64Data = data.data as string;
          const encodedData = base64ToUint8Array(base64Data);
          const value = zbdecode(encodedData);
          return value;
        } else {
          return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        }
      } else {
        throw error;
      }
    };
    const ensureLoadPromise = (key: string, defaultValue?: any) => {
      let loadPromise = kvLoadPromises.get(key);
      if (!loadPromise) {
        loadPromise = makeLoadPromise(key, defaultValue);
        loadPromise.then((value: any) => {
          setKvCache((kvCache) => {
            kvCache.set(key, value);
            return kvCache;
          });
        });
        kvLoadPromises.set(key, loadPromise);
      }
      return loadPromise;
    };

    const kv = useMemo(() => ({
      async get<T>(key: string, defaultValue?: T | (() => T)) {
        const loadPromise = ensureLoadPromise(key, defaultValue);
        return await loadPromise as T | undefined;
      },
      async set<T>(key: string, value: T | ((oldValue: T | undefined) => T)) {
        const fullKey = getFullKey(key);

        if (typeof value === 'function') {
          const oldValue = await kv.get<T>(fullKey);
          const newValue = (value as (oldValue: T | undefined) => T)(oldValue);
          value = newValue;
        }

        const newLoadPromise = Promise.resolve(value);
        const encodedData = zbencode(value);
        const base64Data = uint8ArrayToBase64(encodedData);

        kvLoadPromises.set(key, newLoadPromise);
        setKvCache((kvCache) => {
          kvCache.set(key, value);
          return kvCache;
        });

        const result = await supabase
          .from('keys_values')
          .upsert({
            agent_id: agent.id,
            key: fullKey,
            value: base64Data,
          });
        const { error } = result;
        if (!error) {
          // nothing
        } else {
          console.error('error setting key value', error);
          throw new Error('error setting key value: ' + JSON.stringify(error));
        }
      },
      // note: key must be the same across calls, changing it is not allowed!
      use: <T>(key: string, defaultValue?: T | (() => T)) => {
        const ensureDefaultValue = (() => {
          let cachedDefaultValue: T | undefined;
          return () => {
            if (cachedDefaultValue === undefined) {
              cachedDefaultValue = typeof defaultValue === 'function' ? (defaultValue as () => T)() : defaultValue;
            }
            return cachedDefaultValue;
          };
        })();
        const [valueEpoch, setValueEpoch] = useState(0);
        // get the fresh value each render
        const value = kvCache.get(key) ?? ensureDefaultValue();
        const setValue2 = async (value: T | ((oldValue: T | undefined) => T)) => {
          // trigger re-render of the use() hook
          setValueEpoch((epoch) => epoch + 1);
          // perform the set
          return await kv.set<T>(key, value);
        };

        // trigger the initial load
        useEffect(() => {
          ensureLoadPromise(key, ensureDefaultValue);
        }, []);

        return [value, setValue2];
      },
    }), []);

    return kv;
  }
  useTts(opts?: TtsArgs) {
    const voiceEndpointString = (() => {
      if (opts?.voiceEndpoint) {
        return opts.voiceEndpoint;
      } else {
        return (this.agentJson as any).voiceEndpoint as string;
      }
    })();
    // const sampleRate = opts?.sampleRate ?? defaultSampleRate;
    if (voiceEndpointString) {
      const match = voiceEndpointString.match(/^([^:]+?):([^:]+?):([^:]+?)$/);
      if (match) {
        const [_, model, voiceName, voiceId] = match;
        const voiceEndpoint = new AutoVoiceEndpoint({
          model,
          voiceId,
        });
        const voiceEndpointVoicer = new VoiceEndpointVoicer({
          voiceEndpoint,
          // audioManager: null,
          // sampleRate,
        });
        return {
          getVoiceStream: (text: string, opts: any) => {
            const readableStream = voiceEndpointVoicer.getVoiceStream(text, opts) as ReadableAudioStream;
            return readableStream;
          },
          getVoiceConversionStream: (blob: Blob, opts: any) => {
            const readableStream = voiceEndpointVoicer.getVoiceConversionStream(blob, opts) as ReadableAudioStream;
            return readableStream;
          },
        };
      } else {
        throw new Error('invalid voice endpoint: ' + voiceEndpointString);
      }
    } else {
      throw new Error('no voice endpoint');
    }
  }

  async embed(text: string) {
    const jwt = this.authToken;
    const embedding = await lembed(text, {
      jwt,
    });
    return embedding;
  }
  async complete(messages: ChatMessages, opts: SubtleAiCompleteOpts) {
    const { model } = opts;
    const jwt = this.authToken;
    localStorage.setItem('jwt', JSON.stringify(jwt));
    const content = await fetchChatCompletion({
      model,
      messages,
    });
    return {
      role: 'assistant',
      content,
    };
  }
  async completeJson(messages: ChatMessages, format: ZodTypeAny, opts: SubtleAiCompleteOpts) {
    const { model } = opts;
    const jwt = this.authToken;
    localStorage.setItem('jwt', JSON.stringify(jwt));
    const content = await fetchJsonCompletion({
      model,
      messages,
    }, format);
    return {
      role: 'assistant',
      content,
    };
  }
  async generateImage(prompt: string, opts: SubtleAiImageOpts) {
    const jwt = this.authToken;
    localStorage.setItem('jwt', JSON.stringify(jwt));
    return await fetchImageGeneration(prompt, opts);
  }
};