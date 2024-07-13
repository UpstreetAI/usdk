import { useContext } from 'react';
// import type { Context } from 'react';
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
  ActionOpts,
  PerceptionEventData,
  ConversationChangeEventData,
  ConversationAddEventData,
  ConversationRemoveEventData,
  ActionMessageEventData,
  ActionMessageEvent,
  MessagesUpdateEventData,
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
import {
  retry,
} from '../util/util.mjs';
import { GenerativeAgentObject } from './generative-agent-object';

//

const useContextEpoch = <T>(ContextType: any, getterFn: () => T) => {
  useContext(ContextType); // re-render when epoch changes
  return getterFn();
};

//

const getConversationKey = ({
  room,
  endpointUrl,
}) => `${endpointUrl}/${room}`;

//

export class ActiveAgentObject extends AgentObject {
  // arguments
  appContextValue: AppContextValue;
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
  rooms = new Map<string, NetworkRealms>();
  tasks: Map<symbol, TaskObject> = new Map();
  generativeQueueManager = new QueueManager();
  incomingMessageQueueManager: QueueManager;

  //
  
  constructor(
    agentJson: AgentObject,
    {
      appContextValue,
    }: {
      appContextValue: AppContextValue;
    }
  ) {
    super(agentJson);

    this.appContextValue = appContextValue;

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
  useWallets() {
    return this.appContextValue.useWallets();
  }

  useActions() {
    return useContextEpoch(EpochContext, () => Array.from(this.actionRegistry.values()));
  }
  useFormatters() {
    return useContextEpoch(EpochContext, () => Array.from(this.formatterRegistry.values()));
  }

  useName() {
    return useContextEpoch(EpochContext, () => {
      const names = Array.from(this.nameRegistry.values());
      return names.length > 0 ? names[0].children : this.name;
    });
  }
  usePersonality() {
    return useContextEpoch(EpochContext, () => {
      const personalities = Array.from(this.personalityRegistry.values());
      return personalities.length > 0 ? personalities[0].children : this.bio;
    });
  }

  // setters

  /* async setConversation(conversation: ConversationObject | null) {
    const e = new ExtendableMessageEvent<ConversationChangeEventData>('conversationchange', {
      data: {
        conversation,
      },
    });
    this.dispatchEvent(e);
    await e.waitForFinish();
  } */

  // methods

  async join({
    room,
    endpointUrl,
  }) {
    const guid = this.id;

    const key = getConversationKey({
      room,
      endpointUrl,
    });
    const conversation = new ConversationObject({
      id: key,
      // agent: this, // XXX get rid of this argument
    });
    this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
      data: {
        conversation,
      },
    }));
    const conversationPromise = conversation.waitForLoad();

    const realmsPromise = (async () => {
      const realms = new NetworkRealms({
        endpointUrl,
        playerId: guid,
        audioManager: null,
      });
      realms.conversation = conversation;

      const virtualWorld = realms.getVirtualWorld();
      const virtualPlayers = realms.getVirtualPlayers();

      // Initiate network realms connection.
      const connectPromise = makePromise();
      const onConnect = async (e) => {
        e.waitUntil(
          (async () => {
            const realmKey = e.data.rootRealmKey;

            // Initialize network realms player.
            const getJson = () => {
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
            };
            const agentJson = getJson();
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
          conversation.addAgent(playerId, remotePlayer);

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
          const remotePlayer = conversation.getAgent(playerId);
          if (remotePlayer) {
            conversation.removeAgent(playerId);
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
            conversation.addLocalMessage(message);
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

      const _bindConversation = () => {
        conversation.setAgent(this);
        conversation.setScene(null); // XXX set + track the scene from the multiplayer room as well

        const onConversationLocalMessage = (e: ActionMessageEvent) => {
          const { message } = e.data;
          e.waitUntil((async () => {
            await this.incomingMessageQueueManager.waitForTurn(async () => {
              try {
                // wait for re-render
                {
                  const e = new ExtendableMessageEvent<MessagesUpdateEventData>('messagesupdate');
                  this.dispatchEvent(e);
                  await e.waitForFinish();
                }
                
                const {
                  perceptionRegistry,
                } = this;
      
                const allPerceptions = Array.from(perceptionRegistry.values());
                const perceptionPromises = [];
                for (const perception of allPerceptions) {
                  if (perception.type === message.method) {
                    const e = new MessageEvent<PerceptionEventData>('perception', {
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
        conversation.addEventListener(
          'localmessage',
          onConversationLocalMessage,
        );
  
        conversation.addEventListener('remotemessage', async (e: MessageEvent) => {
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

        const sendTyping = (typing: boolean) => {
          if (realms.isConnected()) {
            try {
              realms.sendChatMessage({
                method: 'typing',
                userId: this.id,
                name: this.name,
                args: {
                  typing,
                },
                hidden: true,
              });
            } catch (err) {
              console.warn(err);
            }
          }
        };
        conversation.addEventListener('typingstart', (e: MessageEvent) => {
          sendTyping(true);
        });
        conversation.addEventListener('typingend', (e: MessageEvent) => {
          sendTyping(false);
        });
      };
      _bindConversation();

      this.rooms.set(key, realms);

      await realms.updateRealmsKeys({
        realmsKeys: [room],
        rootRealmKey: room,
      });

      await connectPromise;
    })();
    const cleanup = () => {
      this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
        data: {
          conversation,
        },
      }));

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
    const key = getConversationKey({
      room,
      endpointUrl,
    });
    const realms = this.rooms.get(key);
    if (realms) {
      const conversation = realms.conversation;
      this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
        data: {
          conversation,
        },
      }));

      this.rooms.delete(key);

      realms.disconnect();
    }
  }

  generative({
    conversation,
  }: {
    conversation: ConversationObject;
  }) {
    return new GenerativeAgentObject(this, conversation);
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