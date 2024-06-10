import { inspect } from 'node:util';

export class AgentConsole {
  currentAgent;
  realms;
  queue = [];
  constructor({ currentAgent = null, realms = null } = {}) {
    this.currentAgent = currentAgent;
    this.realms = realms;
  }
  #makeLog(type) {
    return (...args) => {
      const formattedArgs = inspect(args);
      console[type](formattedArgs);

      if (this.realms?.isConnected()) {
        this.#sendLog(type, formattedArgs);
      } else {
        this.queue.push({
          type,
          formattedArgs,
        });
      }
    };
  }
  #sendLog(type, formattedArgs) {
    const { currentAgent } = this;
    this.realms.sendChatMessage({
      method: 'log',
      type,
      userId: currentAgent.id,
      name: currentAgent.name,
      args: formattedArgs,
    });
  }
  log(...args) {
    return this.#makeLog('log')(...args);
  }
  warn(...args) {
    return this.#makeLog('warn')(...args);
  }
  set(o) {
    const oldValid = !!this.realms;
    const newValid = !!this.realms;

    if (o.currentAgent) {
      this.currentAgent = o.currentAgent;
    }
    if (o.realms) {
      this.realms = o.realms;
    }

    if (!oldValid && newValid) {
      for (const { type, formattedArgs } of this.queue) {
        this.#sendLog(type, formattedArgs);
      }
      this.queue.length = 0;
    }
  }
}
