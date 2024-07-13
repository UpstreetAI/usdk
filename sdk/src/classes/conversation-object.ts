import {
  // AgentObject,
  ActiveAgentObject,
  ActionMessage,
  // ActionMessages,
  MessageFilter,
  PendingActionMessage,
  ActionMessageEventData,
} from '../types'
import { SceneObject } from '../classes/scene-object';
import { Player } from './player';
import { ExtendableMessageEvent } from '../util/extendable-message-event';

//

export const CACHED_MESSAGES_LIMIT = 50;

//

class MessageCache {
  messages: ActionMessage[] = [];
  loaded: boolean = false;
  loadPromise: Promise<void> | null = null;

  pushMessage(message: ActionMessage) {
    this.messages.push(message);
    this.#trim();
  }
  prependMessages(messages: ActionMessage[]) {
    this.messages.unshift(...messages);
    this.#trim();
  }
  #trim() {
    if (this.messages.length > CACHED_MESSAGES_LIMIT) {
      this.messages.splice(0, this.messages.length - CACHED_MESSAGES_LIMIT);
    }
  }
}

//

export class ConversationObject extends EventTarget {
  id: string;
  #scene: SceneObject | null;
  #agent: ActiveAgentObject;
  #agentsMap: Map<string, Player>;
  messageCache = new MessageCache();
  #numTyping: number = 0;

  constructor({
    id,
  }: {
    id: string;
  }) {
    if (!id) {
      throw new Error('ConversationContext: id is required');
    }

    super();

    this.id = id;
  }

  //

  async typing(fn: () => Promise<void>) {
    const start = () => {
      if (++this.#numTyping === 1) {
        this.dispatchEvent(new MessageEvent('typingstart'));
      }
    };
    const end = () => {
      if (--this.#numTyping === 0) {
        this.dispatchEvent(new MessageEvent('typingend'));
      }
    };
    start();
    try {
      return await fn();
    } finally {
      end();
    }
  }

  //

  getScene() {
    return this.#scene;
  }
  setScene(scene: SceneObject | null) {
    this.#scene = scene;
  }

  getAgent() {
    return this.#agent;
  }
  setAgent(agent: ActiveAgentObject) {
    this.#agent = agent;
  }

  getAgents() {
    return Array
      .from(this.#agentsMap.values())
      // .map(player => player.getPlayerSpec());
  }
  addAgent(agentId: string, player: Player) {
    this.#agentsMap.set(agentId, player);
  }
  removeAgent(agentId: string) {
    this.#agentsMap.delete(agentId);
  }

  getCachedMessages(filter?: MessageFilter) {
    const agent = filter?.agent;
    const idMatches = agent?.idMatches;
    const capabilityMatches = agent?.capabilityMatches;
    const query = filter?.query;
    const before = filter?.before;
    const after = filter?.after;
    const limit = filter?.limit;

    if (query) {
      throw new Error('query is not supported in cached messages');
    }

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
    let messages = this.messageCache.messages.filter(m => filterFns.every(fn => fn(m)));
    if (typeof limit === 'number') {
      messages = messages.slice(-limit);
    }
    return messages;
  }
  async fetchMessages(filter: MessageFilter, {
    supabase,
    signal,
  }: {
    supabase: any;
    signal: AbortSignal;
  }) {
    const agent = filter?.agent;
    const idMatches = agent?.idMatches;
    const capabilityMatches = agent?.capabilityMatches;
    const query = filter?.query;
    const before = filter?.before;
    const after = filter?.after;
    const limit = filter?.limit;

    // XXX implement this to go to the database. support query via embedding
    throw new Error('not implemented');

    return [] as ActionMessage[];
  }

  // pull a message from the network
  async addLocalMessage(message: ActionMessage) {
    this.messageCache.pushMessage(message);

    const e = new ExtendableMessageEvent<ActionMessageEventData>('localmessage', {
      data: {
        message,
      },
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
  }
  // push a message to the network
  addLocalAndRemoteMessage(message: ActionMessage) {
    this.messageCache.pushMessage(message);

    this.dispatchEvent(
      new MessageEvent('remotemessage', {
        data: {
          message,
        },
      }),
    );
  }
}
