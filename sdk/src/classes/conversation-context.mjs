export class ConversationContext extends EventTarget {
  scene;
  agentsMap;
  currentAgent;
  messages;
  constructor({
    scene = null,
    agentsMap = new Map(),
    currentAgent = null,
    messages = [],
  } = {}) {
    super();

    this.scene = scene;
    this.agentsMap = agentsMap;
    this.currentAgent = currentAgent;
    this.messages = messages;

    if (!currentAgent) {
      throw new Error('ConversationContext: currentAgent is required');
    }
  }

  getScene() {
    return this.scene;
  }
  setScene(scene) {
    this.scene = scene;
  }

  getCurrentAgent() {
    return this.currentAgent;
  }
  setCurrentAgent(currentAgent) {
    this.currentAgent = currentAgent;
  }

  getAgents() {
    return Array.from(this.agentsMap.values());
  }
  getAgent(agentId) {
    return this.agentsMap.get(agentId);
  }
  addAgent(agentId, agent) {
    this.agentsMap.set(agentId, agent);
  }
  removeAgent(agentId) {
    this.agentsMap.delete(agentId);
  }
  clearAgents() {
    this.agentsMap.clear();
  }

  getMessages() {
    return this.messages;
  }

  async typing(handlerAsyncFn) {
    const agent = this.currentAgent;

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

  addLocalMessage(message) {
    this.messages.push(message);

    this.dispatchEvent(
      new MessageEvent('localmessage', {
        data: {
          message,
        },
      }),
    );
  }
  addLocalAndRemoteMessage(message) {
    this.messages.push(message);

    this.dispatchEvent(
      new MessageEvent('remotemessage', {
        data: {
          message,
        },
      }),
    );
  }
  clearMessages() {
    this.messages.length = 0;
  }
}
