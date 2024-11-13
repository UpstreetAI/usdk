// import {
//   voicePacksUrl,
//   voiceEndpointsUrl,
// } from './endpoints.js';
import voicePacks from '../../public/voice/voicepacks/all_packs.json';
import voiceEndpoints from '../../public/voice/voice_models.json';

export class Voices {
  constructor() {
    this.voicePacks = voicePacks;
    this.voiceEndpoints = voiceEndpoints;

    // this.loadPromise = (async () => {
    //   await Promise.all([
    //     (async () => {
    //       const res = await fetch(voicePacksUrl);
    //       const j = await res.json();
    //       this.voicePacks = j;
    //     })(),
    //     (async () => {
    //       const res = await fetch(voiceEndpointsUrl);
    //       const j = await res.json();
    //       this.voiceEndpoints = j;
    //     })(),
    //   ]);
    // })();
  }
  // waitForLoad() {
  //   return this.loadPromise;
  // }
}

const firstVoiceCategory = Object.keys(voiceEndpoints)[0];
export const defaultVoiceEndpoint = `${firstVoiceCategory}:${voiceEndpoints[firstVoiceCategory][0].name}:${voiceEndpoints[firstVoiceCategory][0].voiceId}`;

export const defaultVoicePack = voicePacks[0].name;