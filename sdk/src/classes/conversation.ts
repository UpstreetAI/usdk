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
import {
  loadMessagesFromDatabase,
} from '../util/loadMessagesFromDatabase';
import { ExtendableMessageEvent } from '../util/extendable-message-event';

//

const LOADED_MESSAGES_LIMIT = 50

//

export class Conversation extends EventTarget {
  #id: string;
  #agent: ActiveAgentObject;
  #scene: SceneObject | null;
  #agentsMap: Map<string, Player>;
  #messages: ActionMessage[];
  #loadPromise: Promise<void>;
  numTyping: number = 0;
  constructor({
    id,
    agent,
  }: {
    id: string;
    agent: ActiveAgentObject;
  }) {
    if (!id) {
      throw new Error('ConversationContext: id is required');
    }
    if (!agent) {
      throw new Error('ConversationContext: agent is required');
    }

    super();

    this.#id = id;
    this.#agent = agent;
    this.#messages = [];
    // XXX move this externally
    this.#loadPromise = (async () => {
      const supabase = this.#agent.useSupabase();
      const messages = await loadMessagesFromDatabase({
        supabase,
        conversationId: this.#id,
        agentId: agent.id,
        limit: LOADED_MESSAGES_LIMIT,
      });
      // prepend new messages
      this.#messages = messages.concat(this.#messages);
    })();
  }

  //

  waitForLoad() {
    return this.#loadPromise;
  }

  //

  async typing(fn: () => Promise<void>) {
    const start = () => {
      if (++this.numTyping === 1) {
        this.dispatchEvent(new MessageEvent('typingstart'));
      }
    };
    const end = () => {
      if (--this.numTyping === 0) {
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
  /* clearAgents() {
    this.#agentsMap.clear();
  } */

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
  async addLocalMessage(message: ActionMessage) {
    this.#messages.push(message);

    const e = new ExtendableMessageEvent<ActionMessageEventData>('localmessage', {
      data: {
        message,
      },
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
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
