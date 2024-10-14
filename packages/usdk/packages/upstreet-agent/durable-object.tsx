import { DurableObjectImpl } from './durable-object-impl.tsx';

import userRender from '../../agent.tsx'; // note: this will be overwritten by the build process
import * as codecs from 'react-agents/lib/multiplayer/public/audio/ws-codec-runtime-edge.mjs';


Error.stackTraceLimit = 300;

//

// CloudFlare Worker Durable Object class
export class DurableObject {
  durableObjectImpl: DurableObjectImpl;

  constructor(state: any, env: any) {
    this.durableObjectImpl = new DurableObjectImpl({
      ...state,
      userRender,
      codecs,
    }, env);
  }
  async fetch(request: Request) {
    return await this.durableObjectImpl.fetch(request);
  }
  async alarm() {
    return await this.durableObjectImpl.alarm();
  }
}
