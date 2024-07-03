import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionMessage,
  // ActionMessages,
  MessageFilter,
} from '../types'
import { Player } from './player';

export class ConversationContext extends EventTarget {
  #scene: SceneObject | null;
  #agentsMap: Map<string, Player>;
  #currentAgent: object | null;
  #messages: ActionMessage[];
  constructor({
    scene = null,
    agentsMap = new Map(),
    currentAgent = null,
    messages = [],
  }: {
    scene?: SceneObject | null,
    agentsMap?: Map<string, Player>,
    currentAgent?: object | null,
    messages?: ActionMessage[],
  } = {}) {
    super();

    if (!scene) {
      throw new Error('ConversationContext: scene is required');
    }
    if (!currentAgent) {
      throw new Error('ConversationContext: currentAgent is required');
    }

    this.#scene = scene;
    this.#agentsMap = agentsMap;
    this.#currentAgent = currentAgent;
    this.#messages = messages;
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

  getMessages(filter?: MessageFilter) {
    const agent = filter?.agent;
    const idMatches = agent?.idMatches;
    const capabilityMatches = agent?.capabilityMatches;
    const query = filter?.query; // XXX implement this
    const before = filter?.before;
    const after = filter?.after;
    const limit = filter?.limit;
    const filterFns: ((m: ActionMessage) => boolean)[] = [];
    if (Array.isArray(idMatches)) {
      filterFns.push((m: ActionMessage) => {
        return idMatches.includes(m.userId);
      });
    }
    if (Array.isArray(capabilityMatches)) {
      // XXX implement this to detect e.g. voice capability
    }
    if (before instanceof Date) {
      filterFns.push((m: ActionMessage) => {
        return m.timestamp < before;
      });
    }
    if (after instanceof Date) {
      filterFns.push((m: ActionMessage) => {
        return m.timestamp > after;
      });
    }
    // XXX support query via embedding
    let messages = this.#messages.filter(m => filterFns.every(fn => fn(m)));
    if (typeof limit === 'number') {
      messages = messages.slice(-limit);
    }
    return messages;
  }

  setMessages( messages: ActionMessage[] ) {
    // Preserve the original reference to agent messages.
    this.#messages.length = 0;
    this.#messages.push( ...messages );
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
  async addLocalMessage(message) {
    this.#messages.push(message);

    let promises = [];
    const waitUntil = p => {
      promises.push(p);
    };
    this.dispatchEvent(
      new MessageEvent('localmessage', {
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
