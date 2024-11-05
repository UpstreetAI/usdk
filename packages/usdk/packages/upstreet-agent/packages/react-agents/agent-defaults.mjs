import packageJson from '../../../../package.json' with { type: 'json' };
import { defaultModels } from './constants.mjs';
import { workersHost } from './util/endpoints.mjs';

export const getAgentName = (guid) => `user-agent-${guid}`;
export const getAgentPublicUrl = (guid) => `https://chat.upstreet.ai/agents/${guid}`;
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
  if (typeof spec.ownerId !== 'string') {
    spec.ownerId = '';
  }
  if (typeof spec.model !== 'string') {
    spec.model = defaultModels[0];
  }
  if (typeof spec.startUrl !== 'string') {
    spec.startUrl = getCloudAgentHost(spec.id);
  }
  if (typeof spec.previewUrl !== 'string') {
    spec.previewUrl = '';
  }
  if (typeof spec.homespaceUrl !== 'string') {
    spec.homespaceUrl = '';
  }
  if (typeof spec.avatarUrl !== 'string') {
    spec.avatarUrl = '';
  }
  if (typeof spec.voiceEndpoint !== 'string') {
    spec.voiceEndpoint = 'elevenlabs:scillia:kNBPK9DILaezWWUSHpF9';
  }
  if (typeof spec.voicePack !== 'string') {
    spec.voicePack = 'ShiShi voice pack';
  }
  if (typeof spec.stripeConnectAccountId !== 'string') {
    spec.stripeConnectAccountId = '';
  }
  if (typeof spec.address !== 'string') {
    spec.address = '';
  }
  if (!Array.isArray(spec.capabilities)) {
    spec.capabilities = [];
  }
  if (typeof spec.version !== 'string') {
    spec.version = packageJson.version;
  }
};