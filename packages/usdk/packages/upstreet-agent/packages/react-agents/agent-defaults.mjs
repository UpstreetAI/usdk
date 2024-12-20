import { workersHost } from './util/endpoints.mjs';

export const getAgentName = (guid) => `${guid}`;
export const getAgentPublicUrl = (guid) => `https://upstreet.ai/agents/${guid}`;
export const getCloudAgentHost = (guid) => `https://${getAgentName(guid)}.${workersHost}`;