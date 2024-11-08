import { AgentMain } from 'react-agents/entry.ts';

import userRender from '../../agent.tsx'; // note: this will be overwritten by the build process
import * as codecs from 'codecs/ws-codec-runtime-edge.mjs';

Error.stackTraceLimit = 300;

//

// CloudFlare Worker Durable Object class
export class DurableObject {
  agentMain: AgentMain;

  constructor(state: any, env: any) {
    this.agentMain = new AgentMain({
      ...state,
      userRender,
      codecs,
    }, env);
  }
  async fetch(request: Request) {
    return await this.agentMain.fetch(request);
  }
  async alarm() {
    return await this.agentMain.alarm();
  }
}
