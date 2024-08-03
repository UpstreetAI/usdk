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
import { fetchChatCompletion } from '../util/fetch.mjs';

//

export class AppContextValue {
  // members
  subtleAi: SubtleAi;
  agentJson: object;
  wallets: any;
  authToken: string;
  supabase: any;
  chatsSpecification: ChatsSpecification;

  constructor({
    subtleAi,
    agentJson,
    wallets,
    authToken,
    supabase,
    chatsSpecification,
  }: {
    subtleAi: SubtleAi;
    agentJson: object;
    wallets: any;
    authToken: string;
    supabase: any;
    chatsSpecification: ChatsSpecification;
  }) {
    this.subtleAi = subtleAi;
    this.agentJson = agentJson;
    this.wallets = wallets;
    this.authToken = authToken;
    this.supabase = supabase;
    this.chatsSpecification = chatsSpecification;
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
          getAudioStream: (text: string, opts: any) => {
            const readableStream = voiceEndpointVoicer.getStream(text, opts) as ReadableAudioStream;
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
    const embedding = await lembed(text);
    return embedding;
  }
  async complete(messages: ChatMessages, opts: SubtleAiCompleteOpts) {
    const { model } = opts;
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
  async generateImage(prompt: string, opts: SubtleAiImageOpts) {
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