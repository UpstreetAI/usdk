import { useContext, useEffect } from 'react';
// import type { Context } from 'react';
import { z } from 'zod';
// import * as Y from 'yjs';
// import type { ZodTypeAny } from 'zod';
import dedent from 'dedent';
// import {
//   EpochContext,
// } from '../context';
import {
  AgentObject,
} from './agent-object';
import type {
  AppContextValue,
  MemoryOpts,
  Memory,
  ChatsSpecification,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
import {
  QueueManager,
} from '../util/queue-manager.mjs';
import {
  makePromise,
  parseCodeBlock,
} from '../util/util.mjs';
// import { Player } from './player';
// import { NetworkRealms } from '../lib/multiplayer/public/network-realms.mjs';
// import {
//   loadMessagesFromDatabase,
// } from '../util/loadMessagesFromDatabase.js';
// import {
//   ExtendableMessageEvent,
// } from '../util/extendable-message-event';
import {
  retry,
} from '../util/util.mjs';
import {
  GenerativeAgentObject,
} from './generative-agent-object';
import {
  SceneObject,
} from './scene-object';
import {
  ChatsManager,
} from './chats-manager';
import {
  TaskManager,
} from './task-manager';
import { PingManager } from './ping-manager';
import { AgentRegistry, emptyAgentRegistry } from './render-registry';

//

export class ActiveAgentObject extends AgentObject {
  // arguments
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
    console.log('app context value recall 1', {
      agent: this,
      query,
    });
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
      console.log('app context value recall 2', {
        data,
      });
      return data as Array<Memory>;
    } else {
      throw new Error(error + '');
    }
  }
  async addMemory(
    text: string,
    content?: any,
    opts?: MemoryOpts,
  ) {
    const { matchThreshold = 0.5, matchCount = 1 } = opts || {};

    const id = crypto.randomUUID();
    const embedding = await this.appContextValue.embed(text);

    // const jwt = this.useAuthToken();
    // const supabase = makeAnonymousClient(env, jwt);
    const supabase = this.useSupabase();
    const readResult = await supabase.rpc('match_memory_user_id', {
      user_id: this.id,
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
    });
    const { error, data } = readResult;
    if (!error) {
      const replaceIndexes = await (async () => {
        if (data) {
          const numRetries = 5;
          return await retry(async () => {
            const promptMessages = [
              {
                role: 'assistant',
                content: dedent`
                  You are a memory relevance evaluator for an AI agent.
                  The user will provide an list of old memories and a new memory, as text strings.
                  Evaluate which memories the new memory should replace and reply with a list of the memory indexes that the new memory should replace from the list of old memories (splice). The indexes you should return are the 0-indexed position of the memory to replace. The replacement list you return may be the empty array.
                  For example, if the previous memories state that ["A is B", "C is D"], and the new memory states that "A is E", the replacement list would be [0].
                  When in doubt, keep the old memory and do not include it in the replacement list.
                  Wrap your response in code blocks e.g.
                  \`\`\`json
                  [0, 1, 2]
                  \`\`\`
                `,
              },
              {
                role: 'user',
                content:
                  dedent`
                  # Old memories
                  \`\`\`` +
                  '\n' +
                  JSON.stringify(
                    data.map((memory) => memory.text),
                    null,
                    2,
                  ) +
                  '\n' +
                  dedent`
                  \`\`\`
                  # New memory
                  \`\`\`` +
                  '\n' +
                  JSON.stringify([text], null, 2) +
                  '\n' +
                  dedent`
                  \`\`\`
                  `,
              },
            ];
            const message = await this.appContextValue.complete(promptMessages, {
              model: this.model,
            });
            // extract the code block
            const s = parseCodeBlock(message.content);
            // parse the json in the code block
            const rawJson = JSON.parse(s);
            // validate that the json matches the expected schema
            const schema = z.array(z.number());
            const parsedJson = schema.parse(rawJson);
            return parsedJson;
          }, numRetries);
        } else {
          return [];
        }
      })();

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
    } else {
      throw new Error(JSON.stringify(error));
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