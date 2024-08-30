import { aiProxyHost } from '../../util/endpoints.mjs';
// import { getCleanJwt } from '../../utils/jwt-util.js';

const voicesEndpointProxyUrl = `https://${aiProxyHost}/api/ai/voices`;
const voicesEndpointApiUrl = `https://${aiProxyHost}/api/ai-voice/voices`;

export class VoiceTrainer {
  // constructor() {}
  /* async getVoices({
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
    const res = await fetch(`${voicesEndpointProxyUrl}/${voiceId}`, {
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
  } */
  async addVoice(name, files, {
    jwt,
  }) {
    const fd = new FormData();
    fd.append('name', name);
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
      return j;
    } else {
      const text = await res.text();
      throw new Error(`failed to get voice response: ${res.status}: ${text}`);
    }
  }
  async removeVoice(id, {
    jwt,
  }) {
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
      return j;
    } else {
      if (res.status === 404) {
        console.log(`voice not found: ${id}`);
      } else {
        const text = await res.text();
        throw new Error(`failed to get voice response: ${u}: ${res.status}: ${text}`);
      }
    }
  }
}
const voiceTrainer = new VoiceTrainer();
export default voiceTrainer;
