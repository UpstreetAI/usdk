import packageJson from '../../package.json' with { type: 'json' };
import { generationModel } from '../../const.js';

export const ensureAgentJsonDefaults = (spec) => {
  if (typeof spec.name !== 'string') {
    spec.name = makeName();
  }
  if (typeof spec.description !== 'string') {
    spec.description = 'Created by the AI Agent SDK';
  }
  if (typeof spec.bio !== 'string') {
    spec.bio = 'A cool person';
  }
  if (typeof spec.model !== 'string') {
    spec.model = generationModel;
  }
  if (typeof spec.previewUrl !== 'string') {
    spec.previewUrl = '/images/characters/upstreet/small/scillia.png';
  }
  if (typeof spec.avatarUrl !== 'string') {
    spec.avatarUrl = '/avatars/default_1934.vrm';
  }
  if (typeof spec.voiceEndpoint !== 'string') {
    spec.voiceEndpoint = 'elevenlabs:scillia:kNBPK9DILaezWWUSHpF9';
  }
  if (typeof spec.voicePack !== 'string') {
    spec.voicePack = 'ShiShi voice pack';
  }
  if (!Array.isArray(spec.capabilities)) {
    spec.capabilities = [];
  }
  if (typeof spec.version !== 'string') {
    spec.version = packageJson.version;
  }
};