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
import type {
  ZodTypeAny,
} from 'zod';
import { AutoVoiceEndpoint, VoiceEndpointVoicer } from '../lib/voice-output/voice-endpoint-voicer.mjs';
// import { createOpusReadableStreamSource } from '../lib/multiplayer/public/audio/audio-client.mjs';
// import { NetworkRealms } from "../lib/multiplayer/public/network-realms.mjs";
import {
  lembed,
} from '../util/embedding.mjs';
import { fetchChatCompletion, fetchJsonCompletion } from '../util/fetch.mjs';
import { fetchImageGeneration } from '../util/generate-image.mjs';

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