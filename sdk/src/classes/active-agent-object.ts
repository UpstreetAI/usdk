import { useContext } from 'react';
import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
import dedent from 'dedent';
import {
  EpochContext,
} from '../context';
import {
  AgentObject,
} from './agent-object';
import type {
  AppContextValue,
  ActionProps,
  FormatterProps,
  PromptProps,
  ParserProps,
  PerceptionProps,
  TaskProps,
  NameProps,
  PersonalityProps,
  ServerProps,
  TaskObject,
  PendingActionMessage,
  MemoryOpts,
  SubtleAiCompleteOpts,
  SubtleAiImageOpts,
  ChatMessages,
  ActionHistoryQuery,
  Memory,
} from '../types';
import {
  ConversationContext,
} from './conversation-context';
import {
  QueueManager,
} from '../util/queue-manager.mjs';
import {
  makePromise,
  parseCodeBlock,
} from '../util/util.mjs';
import { Player } from './player';
import { NetworkRealms } from '../lib/multiplayer/public/network-realms.mjs';
import {
  generateAgentActionFromInstructions,
  generateAgentAction,
  handleAgentAction,
  generateJsonMatchingSchema,
  generateString,
} from '../runtime';
// import {
//   loadMessagesFromDatabase,
// } from '../util/loadMessagesFromDatabase.js';
import {
  saveMessageToDatabase,
} from '../util/saveMessageToDatabase.js';
import {
  ExtendableMessageEvent,
} from '../util/extendable-message-event';

//

const makeEpochUse = (getterFn: () => any) => () => {
  useContext(EpochContext); // re-render when epoch changes
  return getterFn();
};

//

function getConverstationKey({
  room,
  endpointUrl,
}) {
  return `${endpointUrl}/${room}`;
}

export class ActiveAgentObject extends AgentObject {
  // arguments
  appContextValue: AppContextValue;
  wallets: any;
  // registry
  actionRegistry: Map<symbol, ActionProps> = new Map();
  formatterRegistry: Map<symbol, FormatterProps> = new Map();
  promptRegistry: Map<symbol, PromptProps> = new Map();
  parserRegistry: Map<symbol, ParserProps> = new Map();
  perceptionRegistry: Map<symbol, PerceptionProps> = new Map();
  taskRegistry: Map<symbol, TaskProps> = new Map();
  nameRegistry: Map<symbol, NameProps> = new Map();
  personalityRegistry: Map<symbol, PersonalityProps> = new Map();
  serverRegistry: Map<symbol, ServerProps> = new Map();
  // state
  conversations = new Map<string, ConversationContext>();
  rooms = new Map<string, NetworkRealms>();
  thinkQueueManager = new QueueManager();
  tasks: Map<symbol, TaskObject> = new Map();

  incomingMessageQueueManager: QueueManager;

  //
  
  constructor(
    agentJson: AgentObject,
    {
      appContextValue,
      wallets,
    }: {
      appContextValue: AppContextValue;
      wallets: any;
    }
  ) {
    super(agentJson);

    this.appContextValue = appContextValue;
    this.wallets = wallets;

    this.incomingMessageQueueManager = new QueueManager();
  }

  async embed(text: string) {
    return await this.appContextValue.embed(text);
  }
  async complete(
    messages: ChatMessages,
  ) {
    return await this.appContextValue.complete(messages, {
      model: this.model,
    });
  }

  // registry

  registerAction(key: symbol, props: ActionProps) {
    this.actionRegistry.set(key, props);
  }
  unregisterAction(key: symbol) {
    this.actionRegistry.delete(key);
  }
  registerPrompt(key: symbol, props: PromptProps) {
    this.promptRegistry.set(key, props);
  }
  unregisterPrompt(key: symbol) {
    this.promptRegistry.set(key, null);
  }
  registerFormatter(key: symbol, props: FormatterProps) {
    this.formatterRegistry.set(key, props);
  }
  unregisterFormatter(key: symbol) {
    this.formatterRegistry.delete(key);
  }
  registerParser(key: symbol, props: ParserProps) {
    this.parserRegistry.set(key, props);
  }
  unregisterParser(key: symbol) {
    this.parserRegistry.delete(key);
  }
  registerPerception(key: symbol, props: PerceptionProps) {
    this.perceptionRegistry.set(key, props);
  }
  unregisterPerception(key: symbol) {
    this.perceptionRegistry.delete(key);
  }
  registerTask(key: symbol, props: TaskProps) {
    this.taskRegistry.set(key, props);
  }
  unregisterTask(key: symbol) {
    this.taskRegistry.delete(key);
  }

  //

  registerName(key: symbol, props: NameProps) {
    this.nameRegistry.set(key, props);
  }
  unregisterName(key: symbol) {
    this.nameRegistry.delete(key);
  }
  registerPersonality(key: symbol, props: PersonalityProps) {
    this.personalityRegistry.set(key, props);
  }
  unregisterPersonality(key: symbol) {
    this.personalityRegistry.delete(key);
  }

  //

  registerServer(key: symbol, props: ServerProps) {
    this.serverRegistry.set(key, props);
  }
  unregisterServer(key: symbol) {
    this.serverRegistry.delete(key);
  }

  // static hooks

  useAuthToken() {
    return this.appContextValue.useAuthToken();
  }
  useSupabase() {
    return this.appContextValue.useSupabase();
  }

  useActions() {
    return makeEpochUse(() => Array.from(this.actionRegistry.values()))();
  }
  useFormatters() {
    return makeEpochUse(() => Array.from(this.formatterRegistry.values()))();
  }

  useName() {
    return makeEpochUse(() => {
      const names = Array.from(this.nameRegistry.values());
      return names.length > 0 ? names[0].children : this.name;
    })();
  }
  usePersonality() {
    return makeEpochUse(() => {
      const personalities = Array.from(this.personalityRegistry.values());
      return personalities.length > 0 ? personalities[0].children : this.bio;
    })();
  }

  // dynamic hooks

  useScene() {
    return null; // XXX find a way to inject this state into prompts
  }
  useAgents() {
    return []; // XXX
  }
  useActionHistory(query?: ActionHistoryQuery) {
    return []; // XXX filter the local messages
    /* const agentJson = this.#agentJson;
    const filter = query?.filter;
    // console.log('use action history 1');
    const messages = makeEpochUse(() => conversationContext.getMessages(filter))();
    // console.log('use action history 2', messages);
    return messages; */
  }

  // methods

  getJson() {
    const {
      name,
      id,
      description,
      bio,
      model,
      address,
    } = this;
    return {
      name,
      id,
      description,
      bio,
      model,
      address,
    };
  }
  async join({
    room,
    endpointUrl,
  }) {
    const guid = this.id;

    const key = getConverstationKey({
      room,
      endpointUrl,
    });
    const conversationContext = new ConversationContext({
      id: key,
      agent: this,
    });
    this.conversations.set(key, conversationContext);
    const converstaionContextPromise = conversationContext.waitForLoad();

    const realmsPromise = (async () => {
      const realms = new NetworkRealms({
        endpointUrl,
        playerId: guid,
        audioManager: null,
      });

      const virtualWorld = realms.getVirtualWorld();
      const virtualPlayers = realms.getVirtualPlayers();

      // Initiate network realms connection.
      const connectPromise = makePromise();
      const onConnect = async (e) => {
        e.waitUntil(
          (async () => {
            const realmKey = e.data.rootRealmKey;

            // Initialize network realms player.
            const agentJson = this.getJson();
            const localPlayer = new Player(guid, agentJson);
            const _pushInitialPlayer = () => {
              realms.localPlayer.initializePlayer(
                {
                  realmKey,
                },
                {},
              );
              realms.localPlayer.setKeyValue(
                'playerSpec',
                localPlayer.getPlayerSpec(),
              );
            };
            _pushInitialPlayer();

            connectPromise.resolve();
          })(),
        );
      };
      realms.addEventListener('connect', onConnect);

      // console.log('track remote players');
      const _trackRemotePlayers = () => {
        virtualPlayers.addEventListener('join', (e) => {
          const { playerId, player } = e.data;
          console.log('remote player joined:', playerId);

          const remotePlayer = new Player(playerId);
          conversationContext.addAgent(playerId, remotePlayer);

          // apply initial remote player state
          {
            const playerSpec = player.getKeyValue('playerSpec');
            if (playerSpec) {
              remotePlayer.setPlayerSpec(playerSpec);
            }
          }
          // Handle remote player state updates
          player.addEventListener('update', (e) => {
            const { key, val } = e.data;
            if (key === 'playerSpec') {
              remotePlayer.setPlayerSpec(val);
            }
          });
        });
        virtualPlayers.addEventListener('leave', async (e) => {
          const { playerId } = e.data;
          console.log('remote player left:', playerId);
          const remotePlayer = conversationContext.getAgent(playerId);
          if (remotePlayer) {
            conversationContext.removeAgent(playerId);
          } else {
            console.warn('remote player not found', playerId);
            debugger;
          }
        });
      };
      _trackRemotePlayers();

      const _bindMultiplayerChat = () => {
        // console.log('bind multiplayer chat');

        const handleRemoteUserMessage = async (message) => {
          if (!message.hidden) {
            conversationContext.addLocalMessage(message);
          }
        };
        realms.addEventListener('chat', async (e) => {
          try {
            const { playerId, message } = e.data;
            if (playerId !== guid) {
              await handleRemoteUserMessage(message);
            }
          } catch (err) {
            console.warn(err.stack);
          }
        });
      };
      _bindMultiplayerChat();

      const _bindDisconnect = () => {
        realms.addEventListener('disconnect', (e) => {
          console.log('realms emitted disconnect');
        });
      };
      _bindDisconnect();

      const _bindConversationContext = () => {
        // handle conversation remote message re-render
        const onConversationContextLocalMessage = (e) => {
          const { message, waitUntil } = e.data;
          waitUntil((async () => {
            await this.incomingMessageQueueManager.waitForTurn(async () => {
              try {
                await this.agentRenderer.rerenderAsync();
                const {
                  perceptionRegistry,
                } = this;
      
                const allPerceptions = Array.from(perceptionRegistry.values());
                const perceptionPromises = [];
                for (const perception of allPerceptions) {
                  if (perception.type === message.method) {
                    const e = new ExtendableMessageEvent('perception', {
                      data: {
                        agent: this,
                        message,
                      },
                    });
                    const p = perception.handler(e);
                    perceptionPromises.push(p);
                  }
                }
                await Promise.all(perceptionPromises);
      
                (async () => {
                  const supabase = this.useSupabase();
                  const jwt = this.useAuthToken();
                  await saveMessageToDatabase({
                    supabase,
                    jwt,
                    agentId: guid,
                    conversationId: key,
                    message,
                  });
                })();
              } catch (err) {
                console.warn(err.stack);
              }
            });
          })());
        };
        conversationContext.addEventListener(
          'localmessage',
          onConversationContextLocalMessage,
        );
  
        conversationContext.addEventListener('remotemessage', async (e) => {
          const { message } = e.data;
          if (realms.isConnected()) {
            realms.sendChatMessage(message);
          }
  
          (async () => {
            const supabase = this.useSupabase();
            const jwt = this.useAuthToken();
            await saveMessageToDatabase({
              supabase,
              jwt,
              agentId: guid,
              conversationId: key,
              message,
            });
          })();
        });
      };
      _bindConversationContext();

      this.rooms.set(key, realms);

      await realms.updateRealmsKeys({
        realmsKeys: [room],
        rootRealmKey: room,
      });

      await connectPromise;
    })();
    const cleanup = () => {
      this.conversations.delete(key);
      this.rooms.delete(key);
    };
    try {
      await realmsPromise;
    } catch (err) {
      console.warn(err);
      cleanup();
    }
  }
  leave({
    room,
    endpointUrl,
  }) {
    const key = getConverstationKey({
      room,
      endpointUrl,
    });
    const realms = this.rooms.get(key);
    if (realms) {
      this.conversations.delete(key);
      this.rooms.delete(key);

      realms.disconnect();
    }
  }

  async addAction(
    pendingActionMessage: PendingActionMessage,
  ) {
    const { id: userId, name } = this;
    const { method, args } = pendingActionMessage;
    const timestamp = new Date();
    const actionMessage = {
      userId,
      name,
      method,
      args,
      timestamp,
    };

    // XXX get this from the pending action
    conversationContext.addLocalAndRemoteMessage(actionMessage);
    // XXX emit update method and handle externally
    await self.rerenderAsync();
  }

  async typing(fn: () => Promise<void>) {
    const sendTyping = (realms: NetworkRealms, typing: boolean) => {
      if (realms.isConnected()) {
        realms.sendChatMessage({
          method: 'typing',
          userId: this.id,
          name: this.name,
          args: {
            typing,
          },
          hidden: true,
        });
      }
    };
    const start = () => {
      for (const realms of Array.from(this.rooms.values())) {
        sendTyping(realms, true);
      }
    };
    const end = () => {
      for (const realms of Array.from(this.rooms.values())) {
        sendTyping(realms, false);
      }
    };
    start();
    try {
      return await fn();
    } finally {
      end();
    }
  }

  async think(hint?: string) {
    await this.thinkQueueManager.waitForTurn(async () => {
      // console.log('agent renderer think 1');
      await this.typing(async () => {
        // console.log('agent renderer think 2');
        try {
          const pendingMessage = await (hint
            ? generateAgentActionFromInstructions(this, hint)
            : generateAgentAction(this)
          );
          // console.log('agent renderer think 3');
          await handleAgentAction(this, pendingMessage);
          // console.log('agent renderer think 4');
        } catch (err) {
          console.warn('think error', err);
        }
      });
      // console.log('agent renderer think 5');
    });
  }

  async generate(hint: string, schema?: ZodTypeAny) {
    // console.log('agent renderer think 1');
    await this.typing(async () => {
      // console.log('agent renderer think 2');
      try {
        const pendingMessage = await (schema
          ? generateJsonMatchingSchema(hint, schema)
          : generateString(hint)
        );
        // console.log('agent renderer think 3');
        return pendingMessage;
      } catch (err) {
        console.warn('generate error', err);
      }
    });
    // console.log('agent renderer think 5');
  }

  async say(text: string) {
    await this.typing(async () => {
      console.log('say text', {
        text,
      });
      const timestamp = Date.now();
      const pendingMessage = {
        method: 'say',
        args: {
          text,
        },
        timestamp,
      };
      await handleAgentAction(this, pendingMessage);
    });
  }
  async monologue(text: string) {
    await this.typing(async () => {
      console.log('monologue text', {
        text,
      });
      const pendingMessage = await generateAgentActionFromInstructions(
        this,
        'The next action should be the character commenting on the following:' +
          '\n' +
          text,
      );
      await handleAgentAction(this, pendingMessage);
    });
  }
  async getMemory(
    query: string,
    opts?: MemoryOpts,
  ) {
    console.log('app context value recall 1', {
      agent: this,
      query,
    });
    const embedding = await this.embed(query);
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
    const embedding = await this.embed(text);

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
            const message = await this.complete(promptMessages);
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
}