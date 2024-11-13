import { aiProxyHost } from '../../endpoints.js';
import { getCleanJwt } from '../../utils/jwt-util.js';

const voiceEndpointBaseUrl = `https://${aiProxyHost}/api/ai/voices`;

export class VoiceTrainer {
  // constructor() {}
  async getVoice(voiceId) {
    const res = await fetch(`${voiceEndpointBaseUrl}/${voiceId}`);
    const j = await res.json();
    // console.log('got get response', j);
    return j;
  }
  async addVoice(name, files) {
    const fd = new FormData();
    fd.append('name', name);
    for (const file of files) {
      fd.append('files', file);
    }
    const jwt = getCleanJwt();
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
  async removeVoice(voiceId) {
    // const fd = new FormData();
    // fd.append('voice_id', voiceId);
    const res = await fetch(`${voiceEndpointBaseUrl}/${voiceId}`, {
      method: 'DELETE',
      // body: fd,
    });
    const j = await res.json();
    // console.log('got remove response', j);
    return j;
  }
}
const voiceTrainer = new VoiceTrainer();
export default voiceTrainer;
