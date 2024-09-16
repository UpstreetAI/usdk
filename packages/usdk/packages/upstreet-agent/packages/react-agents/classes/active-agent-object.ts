import { useEffect } from 'react';
// import { z } from 'zod';
// import dedent from 'dedent';
import {
  AgentObject,
} from './agent-object';
import type {
  AppContextValue,
  MemoryOpts,
  Memory,
  // ChatsSpecification,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
// import {
//   QueueManager,
// } from '../util/queue-manager.mjs';
// import {
//   makePromise,
//   parseCodeBlock,
// } from '../util/util.mjs';
// import { Player } from './player';
// import { NetworkRealms } from '../lib/multiplayer/public/network-realms.mjs';
// import {
//   loadMessagesFromDatabase,
// } from '../util/loadMessagesFromDatabase.js';
// import {
//   ExtendableMessageEvent,
// } from '../util/extendable-message-event';
// import {
//   retry,
// } from '../util/util.mjs';
import {
  GenerativeAgentObject,
} from './generative-agent-object';
// import {
//   SceneObject,
// } from './scene-object';
import {
  ChatsManager,
} from './chats-manager';
import {
  TaskManager,
} from './task-manager';
import { PingManager } from './ping-manager';
import { AgentRegistry } from './render-registry';

//

export class ActiveAgentObject extends AgentObject {
  // arguments
  agentJson: AgentObject;
  appContextValue: AppContextValue;
  registry: AgentRegistry;
  // state
  chatsManager: ChatsManager;
  taskManager: TaskManager;
  pingManager: PingManager;
  generativeAgentsMap = new WeakMap<ConversationObject, GenerativeAgentObject>();

  //
  
  constructor(
    agentJson: AgentObject,
    {
      appContextValue,
      registry,
    }: {
      appContextValue: AppContextValue;
      registry: AgentRegistry;
    }
  ) {
    super(agentJson);

    //

    this.agentJson = agentJson;
    this.appContextValue = appContextValue;
    this.registry = registry;

    //

    this.chatsManager = new ChatsManager({
      agent: this,
      chatsSpecification: this.appContextValue.useChatsSpecification(),
    });
    this.taskManager = new TaskManager({
      agent: this,
    });
    this.pingManager = new PingManager({
      userId: this.id,
      supabase: this.useSupabase(),
    });
  }

  // static hooks

  useAuthToken() {
    return this.appContextValue.useAuthToken();
  }
  useSupabase() {
    return this.appContextValue.useSupabase();
  }
  useWallets() {
    return this.appContextValue.useWallets();
  }

  useEpoch(deps: any[]) {
    const tick = () => {
      this.dispatchEvent(new MessageEvent('epochchange', {
        data: null,
      }));
    };
    useEffect(() => {
      tick();
      return tick;
    }, deps);
  }

  // convert this ActiveAgentObject to a cached GenerativeAgentObject for inference
  generative({
    conversation,
  }: {
    conversation: ConversationObject;
  }) {
    let generativeAgent = this.generativeAgentsMap.get(conversation);
    if (!generativeAgent) {
      generativeAgent = new GenerativeAgentObject(this, conversation);
      this.generativeAgentsMap.set(conversation, generativeAgent);
    }
    return generativeAgent;
  }

  async getMemory(
    query: string,
    opts?: MemoryOpts,
  ) {
    // console.log('app context value recall 1', {
    //   agent: this,
    //   query,
    // });
    const embedding = await this.appContextValue.embed(query);
    const { matchThreshold = 0.5, matchCount = 1 } = opts || {};

    // const jwt = this.useAuthToken();
    // const supabase = makeAnonymousClient(env, jwt);
    const supabase = this.useSupabase();
    const { data, error } = await supabase.rpc('match_memory_user_id', {
      user_id: this.id,
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });
    if (!error) {
      // console.log('app context value recall 2', {
      //   data,
      // });
      return data as Array<Memory>;
    } else {
      throw new Error(error);
    }
  }
  async addMemory(
    text: string,
    content?: any,
    // opts?: MemoryOpts,
  ) {
    // const { matchThreshold = 0.5, matchCount = 1 } = opts || {};

    const id = crypto.randomUUID();
    const embedding = await this.appContextValue.embed(text);

    // const jwt = this.useAuthToken();
    // const supabase = makeAnonymousClient(env, jwt);
    const supabase = this.useSupabase();
    const writeResult = await supabase
      .from('ai_memory')
      .insert({
        id,
        user_id: this.id,
        text,
        embedding,
        content,
      });
    const { error: error2, data: data2 } = writeResult;
    if (!error2) {
      console.log('app context value recall 3', {
        data2,
      });
      return data2 as Memory;
    } else {
      throw new Error(error2);
    }
  }
  live() {
    this.chatsManager.live();
    this.pingManager.live();
  }
  destroy() {
    this.chatsManager.destroy();
    this.pingManager.destroy();
  }
}