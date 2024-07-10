import type {
  ActiveAgentObject,
  SubtleAi,
  TtsArgs,
  ChatArgs,
  SubtleAiCompleteOpts,
  SubtleAiImageOpts,
  ChatMessages,
} from '../types';
import { AutoVoiceEndpoint, VoiceEndpointVoicer } from '../lib/voice-output/voice-endpoint-voicer.mjs';
import { createOpusReadableStreamSource } from '../lib/multiplayer/public/audio/audio-client.mjs';
import { NetworkRealms } from "../lib/multiplayer/public/network-realms.mjs";
import {
  lembed,
} from '../util/embedding.mjs';
import { fetchChatCompletion } from '../util/fetch.mjs';

//

const defaultSampleRate = 48000;

//

export class AppContextValue {
  // arguments
  subtleAi: SubtleAi;
  agentJson: object;
  wallets: any;
  authToken: string;
  supabase: any;
  // members
  agentRegistry: Map<symbol, ActiveAgentObject> = new Map();

  constructor({
    subtleAi,
    agentJson,
    wallets,
    authToken,
    supabase,
  }: {
    subtleAi: SubtleAi;
    agentJson: object;
    wallets: any;
    authToken: string;
    supabase: any;
  }) {
    this.subtleAi = subtleAi;
    this.agentJson = agentJson;
    this.wallets = wallets;
    this.authToken = authToken;
    this.supabase = supabase;
  }

  // registry

  registerAgent(key: symbol, value: ActiveAgentObject) {
    this.agentRegistry.set(key, value);
  }
  unregisterAgent(key: symbol) {
    this.agentRegistry.delete(key);
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

  useTts(opts?: TtsArgs) { // XXX memoize this
    const voiceEndpoint = (() => {
      if (opts?.voiceEndpoint) {
        return opts.voiceEndpoint;
      } else {
        // const agentJsonString = (env as any).AGENT_JSON as string;
        // const agentJson = JSON.parse(agentJsonString);
        return (this.agentJson as any).voiceEndpoint as string;
      }
    })();
    const sampleRate = opts?.sampleRate ?? defaultSampleRate;
    if (voiceEndpoint) {
      const match = voiceEndpoint.match(/^([^:]+?):([^:]+?):([^:]+?)$/);
      if (match) {
        const [_, model, voiceName, voiceId] = match;
        const voiceEndpoint = new AutoVoiceEndpoint({
          model,
          voiceId,
        });
        const voiceEndpointVoicer = new VoiceEndpointVoicer({
          voiceEndpoint,
          // audioManager: null,
          sampleRate,
        });
        return {
          getAudioStream: (text: string, opts: any) => {
            const transformStream = voiceEndpointVoicer.getStream(text, opts);
            return transformStream.readable;
          },
        };
      } else {
        throw new Error('invalid voice endpoint: ' + voiceEndpoint);
      }
    } else {
      throw new Error('no voice endpoint');
    }
  }
  useChat(opts?: ChatArgs) {
    return {
      playAudioStream: (readableStream) => {
        const audioSource = createOpusReadableStreamSource({
          readableStream,
          // audioContext,
        });

        const virPlayerEndpointUrl = opts.endpointUrl;
        const virPlayerId = opts.playerId;

        const realms = new NetworkRealms({
          virPlayerEndpointUrl,
          playerId: virPlayerId,
          audioManager: null,
        });
        
        // XXX make this bind to the realms
        realms.addAudioSource(audioSource);

        audioSource.output.addEventListener('end', e => {
          realms.removeAudioSource(audioSource);
        });

        return {
          id: audioSource.id,
        };
      },
    };
  }

  async embed(text: string) {
    const embedding = await lembed(text);
    return embedding;
  }
  async complete(messages: ChatMessages, opts?: SubtleAiCompleteOpts) {
    // XXX get the model in the opts
    const currentAgent = conversationContext.getCurrentAgent();
    const { model = currentAgent.model } = opts ?? {};
    // const jwt = (env as any).AGENT_TOKEN as string;
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
  async generateImage(prompt: string, opts?: SubtleAiImageOpts) {
    const {
      model = 'dall-e-3',
      width = 1024, // [1024, 1792]
      height = 1024,
      quality = 'hd', // ['hd', 'standard']
    } = opts ?? {};
    // const jwt = (env as any).AGENT_TOKEN as string;
    const jwt = this.authToken;
    // localStorage.setItem('jwt', JSON.stringify(jwt));
    const u = `https://${aiProxyHost}/api/ai/images/generations`;
    const j = {
      prompt,
      model,
      size: `${width}x${height}`,
      quality,
      n: 1,
    };
    const res = await fetch(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
    });
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return arrayBuffer;
    } else {
      const json = await res.json();
      const { error } = json;
      console.log('got generate image error', error);
      throw new Error(`image generation error: ${error}`);
    }
  }
};