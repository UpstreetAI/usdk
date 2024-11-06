import { devServerPort } from './ports.mjs';

export const getLocalAgentHost = (portIndex = 0) => `http://localhost:${devServerPort + portIndex}`;
