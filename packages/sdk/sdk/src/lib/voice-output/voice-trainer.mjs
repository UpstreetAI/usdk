import { aiProxyHost } from '../../util/endpoints.mjs';
// import { getCleanJwt } from '../../utils/jwt-util.js';

const voiceEndpointBaseUrl = `https://${aiProxyHost}/api/ai/voices`;

export class VoiceTrainer {
  // constructor() {}
  async getVoices({
    jwt,
  }) {
    const res = await fetch(`${voiceEndpointBaseUrl}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const j = await res.json();
    // console.log('got get response', j);
    return j;
  }
  async getVoice(voiceId, {
    jwt,
  }) {
    const res = await fetch(`${voiceEndpointBaseUrl}/${voiceId}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const j = await res.json();
    // console.log('got get response', j);
    return j;
  }
  async getVoiceSample(voiceId, voiceSample, {
    jwt,
  }) {
    const res = await fetch(`${voiceEndpointBaseUrl}/${voiceId}/samples/${voiceSample}/audio`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const ab = await res.arrayBuffer();
    // console.log('got get response', j);
    return ab;
  }
  async addVoice(name, files, {
    jwt,
  }) {
    const fd = new FormData();
    fd.append('name', name);
    for (const file of files) {
      fd.append('files', file);
    }
    // const jwt = getCleanJwt();
    const res = await fetch(`${voiceEndpointBaseUrl}/add`, {
      method: 'POST',
      body: fd,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const j = await res.json();
    // console.log('got add response', j);
    return j;
  }
  async removeVoice(voiceId, {
    jwt,
  }) {
    // const fd = new FormData();
    // fd.append('voice_id', voiceId);
    const res = await fetch(`${voiceEndpointBaseUrl}/${voiceId}`, {
      method: 'DELETE',
      // body: fd,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    const j = await res.json();
    // console.log('got remove response', j);
    return j;
  }
}
const voiceTrainer = new VoiceTrainer();
export default voiceTrainer;
