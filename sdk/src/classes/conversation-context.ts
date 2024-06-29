import {
  SceneObject,
  AgentObject,
  ActiveAgentObject,
  ActionMessage,
  MessageFilter,
} from '../types'
import { Player } from './player';

export class ConversationContext extends EventTarget {
  #scene: SceneObject | null;
  #agentsMap: Map<string, Player>;
  #currentAgent: object | null;
  #messages: Array<ActionMessage>;
  constructor({
    scene = null,
    agentsMap = new Map(),
    currentAgent = null,
    messages = [],
  }: {
    scene?: SceneObject | null,
    agentsMap?: Map<string, Player>,
    currentAgent?: object | null,
    messages?: Array<ActionMessage>,
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
    const agentIds = filter?.agentIds;
    const human = filter?.human;
    const before = filter?.before;
    const after = filter?.after;
    const limit = filter?.limit;
    const filterFns: ((m: ActionMessage) => boolean)[] = [];
    if (Array.isArray(agentIds)) {
      filterFns.push((m: ActionMessage) => {
        return agentIds.includes(m.userId);
      });
    }
    if (typeof human === 'boolean') {
      filterFns.push((m: ActionMessage) => {
        return m.human === human;
      });
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
    let messages = this.#messages.filter(m => filterFns.every(fn => fn(m)));
    if (typeof limit === 'number') {
      messages = messages.slice(-limit);
    }
    return messages;
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
