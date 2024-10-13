import { DurableObjectImpl } from './durable-object-impl.tsx';

Error.stackTraceLimit = 300;

//

// CloudFlare Worker Durable Object class
export class DurableObject {
  durableObjectImpl: DurableObjectImpl;

  constructor(state: any, env: any) {
    this.durableObjectImpl = new DurableObjectImpl(state, env);
  }
  async fetch(request: Request) {
    return await this.durableObjectImpl.fetch(request);
  }
  async alarm() {
    return await this.durableObjectImpl.alarm();
  }
}
