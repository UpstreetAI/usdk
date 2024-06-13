export class ConversationContext extends EventTarget {
  #scene;
  #agentsMap;
  #currentAgent;
  #messages;
  constructor({
    scene = null,
    agentsMap = new Map(),
    currentAgent = null,
    messages = [],
  } = {}) {
    super();

    this.#scene = scene;
    this.#agentsMap = agentsMap; // Player
    this.#currentAgent = currentAgent; // json object
    this.#messages = messages;

    if (!currentAgent) {
      throw new Error('ConversationContext: currentAgent is required');
    }
  }

  getScene() {
    return this.#scene;
  }

  setScene(scene) {
    this.#scene = scene;
  }

  getCurrentAgent() {
    return this.#currentAgent;
  }

  setCurrentAgent(currentAgent) {
    this.#currentAgent = currentAgent;
  }

  getAgents() {
    return Array
      .from(this.#agentsMap.values())
      .map(player => player.getPlayerSpec());
  }

  getAgent(agentId) {
    return this.#agentsMap.get(agentId);
  }

  addAgent(agentId, agent) {
    this.#agentsMap.set(agentId, agent);
  }

  removeAgent(agentId) {
    this.#agentsMap.delete(agentId);
  }

  clearAgents() {
    this.#agentsMap.clear();
  }

  getMessages() {
    return this.#messages;
  }

  setMessages( messages ) {
    // Preserve the original reference to agent messages.
    this.#messages.length = 0;
    this.#messages.push( ...messages )
  }

  async typing(handlerAsyncFn) {
    const agent = this.#currentAgent;

    this.dispatchEvent(new MessageEvent('typingstart', {
      data: {
        agent,
      },
    }));

    let error = null;
    try {
      await handlerAsyncFn();
    } catch (err) {
      error = err;
    } finally {
      this.dispatchEvent(new MessageEvent('typingstop', {
        data: {
          agent,
          error,
        },
      }));
    }
  }

  // pull a message from the network
  addLocalMessage(message) {
    this.#messages.push(message);
    // console.log('add local message', message, this.#messages);

    this.dispatchEvent(
      new MessageEvent('localmessagepre', {
        data: {
          message,
        },
      }),
    );
  }

  // signal that a message has been loaded and re-rendered
  async postLocalMessage(message) {
    let promises = [];
    const waitUntil = p => {
      promises.push(p);
    };
    this.dispatchEvent(
      new MessageEvent('localmessagepost', {
        data: {
          message,
          waitUntil,
        },
      }),
    );
    await Promise.all(promises);
  }
  // push a message to the network
  addLocalAndRemoteMessage(message) {
    this.#messages.push(message);

    this.dispatchEvent(
      new MessageEvent('remotemessage', {
        data: {
          message,
        },
      }),
    );
  }
  clearMessages() {
    this.#messages.length = 0;
  }
}
