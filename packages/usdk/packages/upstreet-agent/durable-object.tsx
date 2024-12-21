import dotenv from 'dotenv';
import { AgentMain } from 'react-agents/entry.ts';
import * as codecs from 'codecs/ws-codec-runtime-edge.mjs';
import userRender from './agent.tsx';
import agentJsonSource from './agent.json';
import envTxt from './.env.txt';

Error.stackTraceLimit = 300;

const parseAgentJson = (agentJsonSource) => {
  try {
    if (typeof agentJsonSource === 'string') {
      return JSON.parse(agentJsonSource);
    } else if (typeof agentJsonSource === 'object') {
      return agentJsonSource;
    } else {
      throw new Error(`Invalid agent.json: ${agentJsonSource}`);
    }
  } catch (e) {
    console.warn(`Warning: failed to parse ${agentJsonSource}:`, e);
    return {};
  }
};
const agentJson = parseAgentJson(agentJsonSource);

// CloudFlare Worker Durable Object class
export class DurableObject {
  agentMain: AgentMain;
  loadPromise: Promise<AgentMain> = null;

  constructor(state: any, env: any) {
    const state2 = {
      ...state,
      config: agentJson,
      userRender,
      codecs,
    };
    const auth2 = dotenv.parse(envTxt);
    this.loadPromise = (async() => {
      const agentMain = new AgentMain(state2, env, auth2);
      // await agentMain.waitForLoad();
      return agentMain;
    })();
  }
  async fetch(request: Request) {
    const agentMain = await this.loadPromise;
    return await agentMain.fetch(request);
  }
  async alarm() {
    const agentMain = await this.loadPromise;
    return await agentMain.alarm();
  }
}
