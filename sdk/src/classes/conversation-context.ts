import {
  AgentObject,
  ActiveAgentObject,
  ActionMessage,
  // ActionMessages,
  MessageFilter,
} from '../types'
import { SceneObject } from '../classes/scene-object';
import { Player } from './player';
import {
  loadMessagesFromDatabase,
} from '../util/loadMessagesFromDatabase';

//

const LOADED_MESSAGES_LIMIT = 50

//

export class ConversationContext extends EventTarget {
  // #currentAgent: object | null;
  #agent: ActiveAgentObject;
  #scene: SceneObject | null;
  #agentsMap: Map<string, Player>;
  // #room: string;
  // #endpointUrl: string;
  #messages: ActionMessage[];
  #loadPromise: Promise<void>;
  constructor({
    agent,
    // room,
    // endpointUrl,
  }: {
    agent: ActiveAgentObject;
    // room: string;
    // endpointUrl: string;
  }) {
    if (!agent) {
      throw new Error('ConversationContext: agent is required');
    }
    // if (!room) {
    //   throw new Error('ConversationContext: room is required');
    // }
    // if (!endpointUrl) {
    //   throw new Error('ConversationContext: endpointUrl is required');
    // }

    super();

    this.#agent = agent;
    // this.#room = room;
    // this.#endpointUrl = endpointUrl;
    this.#messages = [];
    this.#loadPromise = (async () => {
      const supabase = this.#agent.useSupabase();
      const messages = await loadMessagesFromDatabase({
        supabase,
        agentId: agent.id,
        limit: LOADED_MESSAGES_LIMIT,
      });
      // prepend new messages
      this.#messages = messages.concat(this.#messages);
    })();
  }

  waitForLoad() {
    return this.#loadPromise;
  }

  getScene() {
    return this.#scene;
  }
  setScene(scene: SceneObject | null) {
    this.#scene = scene;
  }

  getAgents() {
    return Array
      .from(this.#agentsMap.values())
      .map(player => player.getPlayerSpec());
  }
  getAgent(agentId: string) {
    return this.#agentsMap.get(agentId);
  }
  addAgent(agentId: string, player: Player) {
    this.#agentsMap.set(agentId, player);
  }
  removeAgent(agentId: string) {
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

  /* setMessages( messages: ActionMessage[] ) {
    // Preserve the original reference to agent messages.
    this.#messages.length = 0;
    this.#messages.push( ...messages );
  } */

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
  /* clearMessages() {
    this.#messages.length = 0;
  } */
}
