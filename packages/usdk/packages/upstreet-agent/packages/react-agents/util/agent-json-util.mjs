import packageJson from '../../../../../package.json' with { type: 'json' };
import {
  defaultModels,
  defaultSmallModels,
  defaultLargeModels,
} from '../constants.mjs';
import {
  getCloudAgentHost,
} from '../agent-defaults.mjs';
import {
  getWalletFromMnemonic,
} from './ethereum-utils.mjs';

export const ensureAgentJsonDefaults = (spec) => {
  spec = {
    ...spec,
  };

  if (typeof spec.name !== 'string' || !spec.name) {
    const suffix = Math.floor(10000 + Math.random() * 90000);
    spec.name = `AI Agent #${suffix}`;
  }
  if (typeof spec.description !== 'string' || !spec.description) {
    spec.description = 'Created by the AI Agent SDK';
  }
  if (typeof spec.bio !== 'string' || !spec.bio) {
    spec.bio = 'A cool AI';
  }
  if (typeof spec.ownerId !== 'string' || !spec.ownerId) {
    spec.ownerId = '';
  }
  if (typeof spec.model !== 'string' || !spec.model) {
    spec.model = defaultModels[0];
  }
  if (typeof spec.smallModel !== 'string' || !spec.smallModel) {
    spec.smallModel = defaultSmallModels[0];
  }
  if (typeof spec.largeModel !== 'string' || !spec.largeModel) {
    spec.largeModel = defaultLargeModels[0];
  }
  if (typeof spec.startUrl !== 'string' || !spec.startUrl) {
    spec.startUrl = getCloudAgentHost(spec.id);
  }
  if (typeof spec.previewUrl !== 'string' || !spec.previewUrl) {
    spec.previewUrl = '';
  }
  if (typeof spec.homespaceUrl !== 'string' || !spec.homespaceUrl) {
    spec.homespaceUrl = '';
  }
  if (typeof spec.avatarUrl !== 'string' || !spec.avatarUrl) {
    spec.avatarUrl = '';
  }
  if (typeof spec.voiceEndpoint !== 'string' || !spec.voiceEndpoint) {
    spec.voiceEndpoint = 'elevenlabs:scillia:kNBPK9DILaezWWUSHpF9';
  }
  if (typeof spec.voicePack !== 'string' || !spec.voicePack) {
    spec.voicePack = 'ShiShi voice pack';
  }
  if (typeof spec.stripeConnectAccountId !== 'string' || !spec.stripeConnectAccountId) {
    spec.stripeConnectAccountId = '';
  }
  if (typeof spec.address !== 'string' || !spec.address) {
    spec.address = '';
  }
  if (!Array.isArray(spec.capabilities)) {
    spec.capabilities = [];
  }
  if (typeof spec.version !== 'string' || !spec.version) {
    spec.version = packageJson.version;
  }

  return spec;
};

export const updateAgentJsonAuth = (agentJsonInit, agentAuthSpec) => {
  const {
    guid,
    // agentToken,
    userPrivate,
    mnemonic,
  } = agentAuthSpec;

  const wallet = getWalletFromMnemonic(mnemonic);

  return {
    ...agentJsonInit,
    id: guid,
    ownerId: userPrivate.id,
    address: wallet.address.toLowerCase(),
    stripeConnectAccountId: userPrivate.stripe_connect_account_id,
  };
};

// export const updateAgentJsonVersionHash = (spec, versionHash) => {
//   spec.versionHash = versionHash;
//   return spec;
// };