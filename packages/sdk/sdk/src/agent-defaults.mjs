import packageJson from '../../package.json' with { type: 'json' };
import { generationModel } from '../../const.js';
import { workersHost } from './util/endpoints.mjs';

export const callbackPort = 10617;
export const devServerPort = 10618;

export const getAgentName = (guid) => `user-agent-${guid}`;
export const getAgentPublicUrl = (guid) => `https://chat.upstreet.ai/agents/${guid}`;
export const getLocalAgentHost = (portIndex = 0) => `http://localhost:${devServerPort + portIndex}`;
export const getCloudAgentHost = (guid) => `https://${getAgentName(guid)}.${workersHost}`;

export const ensureAgentJsonDefaults = (spec) => {
  if (typeof spec.name !== 'string') {
    spec.name = 'AI Agent';
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
  if (typeof spec.startUrl !== 'string') {
    spec.startUrl = getCloudAgentHost(spec.id);
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

export const defaultVoices = [
  {
    voiceEndpoint: 'elevenlabs:kadio:YkP683vAWY3rTjcuq2hX',
    name: 'Kaido',
    description: 'Anime boy',
  },
  {
    voiceEndpoint: 'elevenlabs:drake:1thOSihlbbWeiCGuN5Nw',
    name: 'Drake',
    description: 'Anime boy',
  },
  {
    voiceEndpoint: 'elevenlabs:terrorblade:lblRnHLq4YZ8wRRUe8ld',
    name: 'Terrorblade',
    description: 'Anime boy',
  },
  {
    voiceEndpoint: 'elevenlabs:scillia:kNBPK9DILaezWWUSHpF9',
    name: 'Scillia',
    description: 'Anime girl',
  },
  {
    voiceEndpoint: 'elevenlabs:uni:PSAakCTPE63lB4tP9iNQ',
    name: 'Uni',
    description: 'Anime girl',
  },
  {
    voiceEndpoint: 'elevenlabs:lilo:Z1bfwpHqpXffzokqU4WK',
    name: 'Lilo',
    description: 'Anime girl',
  },
];