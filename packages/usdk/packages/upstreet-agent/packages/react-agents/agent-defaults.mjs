import { workersHost } from './util/endpoints.mjs';

export const getAgentName = (guid) => `user-agent-${guid}`;
export const getAgentPublicUrl = (guid) => `https://chat.upstreet.ai/agents/${guid}`;
export const getCloudAgentHost = (guid) => `https://${getAgentName(guid)}.${workersHost}`;