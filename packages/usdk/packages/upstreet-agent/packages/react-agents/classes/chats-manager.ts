// import { useContext, useEffect } from 'react';
// import type { Context } from 'react';
// import { z } from 'zod';
import * as Y from 'yjs';
// import type { ZodTypeAny } from 'zod';
// import dedent from 'dedent';
// import {
//   EpochContext,
// } from '../context';
// import {
//   AgentObject,
// } from './agent-object';
import type {
  PerceptionEventData,
  ConversationAddEventData,
  ConversationRemoveEventData,
  ActionMessageEvent,
  MessagesUpdateEventData,
  PlayableAudioStream,
  ActiveAgentObject,
  ChatsSpecification,
  RoomSpecification,
  PerceptionModifierProps,
  ActionMessageEventData,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
import {
  QueueManager,
  MultiQueueManager,
} from '../util/queue-manager.mjs';
import {
  Debouncer,
} from '../util/debouncer.mjs';
import {
  PerceptionEvent,
} from './perception-event';
import {
  AbortablePerceptionEvent,
} from './abortable-perception-event';
import {
  collectPriorityModifiers,
} from '../runtime';
import {
  makePromise,
} from '../util/util.mjs';
import { Player } from './player';
import { NetworkRealms } from '../lib/multiplayer/public/network-realms.mjs';
import {
  saveMessageToDatabase,
} from '../util/saveMessageToDatabase.js';
import {
  ExtendableMessageEvent,
} from '../util/extendable-message-event';
import {
  SceneObject,
} from './scene-object';
import {
  roomsSpecificationEquals,
} from './chats-specification';

//

const chatAlarmRate = 10000;
export const getChatKey = ({
  room,
  endpointUrl,
}: {
  room: string;
  endpointUrl: string;
}) => {
  return `${endpointUrl}/${room}`;
};

//

// tracks an agent's connected chat rooms based on the changing chatsSpecification
export class ChatsManager extends EventTarget {
  // members
  agent: ActiveAgentObject;
  chatsSpecification: ChatsSpecification;
  // state
  rooms = new Map<string, NetworkRealms>();
  incomingMessageDebouncer = new Debouncer();
  roomsQueueManager = new MultiQueueManager();
  abortController: AbortController | null = null;

  constructor({
    agent,
    chatsSpecification,
  }: {
    agent: ActiveAgentObject,
    chatsSpecification: ChatsSpecification,
  }) {
    super();

    this.agent = agent;
    this.chatsSpecification = chatsSpecification;
  }

  async #join(roomSpecification: RoomSpecification) {
    const {
      room,
      endpointUrl,
    } = roomSpecification;
    const key = getChatKey(roomSpecification);
    // console.log('chats manager join room', {
    //   room,
    //   endpointUrl,
    //   key,
    // }, new Error().stack);
    await this.roomsQueueManager.waitForTurn(key, async () => {
      const {
        agent,
      } = this;
      const guid = agent.id;

      const conversation = new ConversationObject({
        agent,
        room,
        endpointUrl,
      });
      this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
        data: {
          conversation,
        },
      }));

      const cleanup = () => {
        this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
          data: {
            conversation,
          },
        }));
  
        this.rooms.delete(key);
      };

      const realmsPromise = (async () => {
        const realms = new NetworkRealms({
          endpointUrl,
          playerId: guid,
          audioManager: null,
          metadata: {
            conversation,
          },
        });
        this.rooms.set(key, realms);

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
                  previewUrl,
                  model,
                  address,
                } = this.agent;
                return {
                  name,
                  id,
                  description,
                  bio,
                  previewUrl,
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

              const _bindRoomState = () => {
                const _bindScene = () => {
                  const headRealm = realms.getClosestRealm(realms.lastRootRealmKey);
                  const { networkedCrdtClient } = headRealm;
        
                  const doc = networkedCrdtClient.getDoc() as Y.Doc;
                  const name = doc.getText('name');
                  const description = doc.getText('description');
                  const getScene = () => new SceneObject({
                    name: name.toString(),
                    description: description.toString(),
                  });
                  const _updateScene = () => {
                    const scene = getScene();
                    conversation.setScene(scene);
                  };
                  _updateScene();
                  name.observe(_updateScene);
                  description.observe(_updateScene);
                };
                _bindScene();
              };
              _bindRoomState();

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
            // const remotePlayer = conversation.getAgent(playerId);
            // if (remotePlayer) {
              conversation.removeAgent(playerId);
            // } else {
            //   console.warn('remote player not found', playerId);
            //   debugger;
            // }
          });
        };
        _trackRemotePlayers();

        const _bindMultiplayerChat = () => {
          // console.log('bind multiplayer chat');

          const handleRemoteMessage = async (message) => {
            if (!message.hidden) {
              await conversation.addLocalMessage(message);
            } else {
              await conversation.addHiddenMessage(message);
            }
          };
          realms.addEventListener('chat', async (e) => {
            try {
              const { playerId, message } = e.data;
              if (playerId !== guid) {
                await handleRemoteMessage(message);
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

            cleanup();

            // try to reconnect, if applicable
            if (this.chatsSpecification.roomSpecifications.some((spec) => roomsSpecificationEquals(spec, roomSpecification))) {
              this.#join(roomSpecification);
            }
          });
        };
        _bindDisconnect();

        const _bindConversation = () => {
          // run all perception modifiers and perceptions for a given event
          // the modifiers have a chance to abort the perception
          const handleChatPerception = async (data: ActionMessageEventData) => {
            const {
              agent: sourceAgent,
              message,
            } = data;

            const {
              perceptions,
              perceptionModifiers,
            } = this.agent.registry;

            // collect perception modifiers
            const perceptionModifiersPerPriority = collectPriorityModifiers(perceptionModifiers);
            // for each priority, run the perception modifiers, checking for abort at each step
            let aborted = false;
            for (const perceptionModifiers of perceptionModifiersPerPriority) {
              const abortableEventPromises = perceptionModifiers.filter(perceptionModifier => {
                return perceptionModifier.type === message.method;
              }).map(async (perceptionModifier) => {
                const targetAgent = this.agent.generative({
                  conversation,
                });
                const e = new AbortablePerceptionEvent({
                  targetAgent,
                  sourceAgent,
                  message,
                });
                await perceptionModifier.handler(e);
                return e;
              });
              const messageEvents = await Promise.all(abortableEventPromises);
              aborted = aborted || messageEvents.some((messageEvent) => messageEvent.abortController.signal.aborted);
              if (aborted) {
                break;
              }
            }

            // if no aborts, run the perceptions
            if (!aborted) {
              const perceptionPromises = [];
              for (const perception of perceptions) {
                if (perception.type === message.method) {
                  const targetAgent = this.agent.generative({
                    conversation,
                  });
                  const e = new PerceptionEvent({
                    targetAgent,
                    sourceAgent,
                    message,
                  });
                  const p = perception.handler(e);
                  perceptionPromises.push(p);
                }
              }
              await Promise.all(perceptionPromises);
            }
            return {
              aborted,
            };
          };
          conversation.addEventListener('localmessage', (e: ActionMessageEvent) => {
            const { agent: sourceAgent, message } = e.data;
            e.waitUntil((async () => {
              await this.incomingMessageDebouncer.waitForTurn(async () => {
                try {
                  // wait for re-render, since we just changed the message cache
                  // XXX can this be handled in the message cache?
                  {
                    const e = new ExtendableMessageEvent<MessagesUpdateEventData>('messagesupdate');
                    this.agent.dispatchEvent(e);
                    await e.waitForFinish();
                  }

                  // handle the perception
                  const {
                    aborted,
                  } = await handleChatPerception(e.data);
                  if (!aborted) {
                    // save the perception to the databaase
                    (async () => {
                      const supabase = this.agent.useSupabase();
                      const jwt = this.agent.useAuthToken();
                      await saveMessageToDatabase({
                        supabase,
                        jwt,
                        userId: guid,
                        conversationId: key,
                        message,
                      });
                    })();
                  }
                } catch (err) {
                  console.warn('caught new message error', err);
                }
              });
            })());
          });
          conversation.addEventListener('hiddenmessage', (e: ActionMessageEvent) => {
            // console.log('got hidden message 0', e.data);
            e.waitUntil((async () => {
              await this.incomingMessageDebouncer.waitForTurn(async () => {
                // console.log('handle hidden message 1', e.data);
                const {
                  aborted,
                } = await handleChatPerception(e.data);
                // console.log('handle hidden message 2', e.data, {
                //   aborted,
                // });
              });
            })());
          });
    
          conversation.addEventListener('remotemessage', async (e: ExtendableMessageEvent<ActionMessageEventData>) => {
            e.waitUntil((async () => {
              // send on the network
              const { message } = e.data;
              if (realms.isConnected()) {
                realms.sendChatMessage(message);
              }
      
              // save to database
              (async () => {
                const supabase = this.agent.useSupabase();
                const jwt = this.agent.useAuthToken();
                await saveMessageToDatabase({
                  supabase,
                  jwt,
                  userId: guid,
                  conversationId: key,
                  message,
                });
              })();

              // wait for re-render. this must be happening since we just triggered the message cache to update.
              // wait for the render registry to emit 'update'
              const renderRegistry = this.agent.appContextValue.useRegistry();
              await new Promise((resolve) => {
                // console.log('wait for registry render 1', renderRegistry);
                renderRegistry.addEventListener('update', () => {
                  // console.log('wait for registry render 2', renderRegistry);
                  resolve(null);
                }, {
                  once: true,
                });
              });
              // console.log('wait for registry render 3', renderRegistry);
            })());
          });

          //

          conversation.addEventListener('audiostream', async (e: MessageEvent) => {
            const audioStream = e.data.audioStream as PlayableAudioStream;
            (async () => {
              const {
                waitForFinish,
              } = realms.addAudioSource(audioStream);
              await waitForFinish();
              realms.removeAudioSource(audioStream);
            })();
          });

          //

          const sendTyping = (typing: boolean) => {
            if (realms.isConnected()) {
              try {
                realms.sendChatMessage({
                  method: 'typing',
                  userId: this.agent.id,
                  name: this.agent.name,
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

        await realms.updateRealmsKeys({
          realmsKeys: [room],
          rootRealmKey: room,
        });

        await connectPromise;
      })();
      try {
        await realmsPromise;
      } catch (err) {
        console.warn(err);

        cleanup();
      }
    });
  }
  async #leave(roomSpecification: RoomSpecification) {
    const {
      room,
      endpointUrl,
    } = roomSpecification;
    const key = getChatKey(roomSpecification);
    console.log('chats manager leave room', {
      room,
      endpointUrl,
      key,
    });
    await this.roomsQueueManager.waitForTurn(key, async () => {
      const realms = this.rooms.get(key);
      if (realms) {
        const conversation = realms.metadata.conversation;
        this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
          data: {
            conversation,
          },
        }));

        this.rooms.delete(key);

        realms.disconnect();
      }
    });
  }

  // return the next alarm time
  async tick() {
    // if we are in a room, kick the timeout to keep ourselves from being evicted
    if (this.rooms.size > 0) {
      return Date.now() + chatAlarmRate;
    } else {
      return Infinity;
    }
  }

  live() {
    // console.log('chats manager live!', new Error().stack);

    this.abortController = new AbortController();
    const {
      signal,
    } = this.abortController;

    (async () => {
      if (signal.aborted) return;

      // listen for rooms changes
      const onjoin = (e: ExtendableMessageEvent<RoomSpecification>) => {
        e.waitUntil((async () => {
          await this.#join(e.data);
        })());
      };
      this.chatsSpecification.addEventListener('join', onjoin);
      const onleave = (e: ExtendableMessageEvent<RoomSpecification>) => {
        e.waitUntil((async () => {
          await this.#leave(e.data);
        })());
      };
      this.chatsSpecification.addEventListener('leave', onleave);

      // clean up listeners
      signal.addEventListener('abort', () => {
        this.chatsSpecification.removeEventListener('join', onjoin);
        this.chatsSpecification.removeEventListener('leave', onleave);
      });

      // connect to initial rooms
      await this.chatsSpecification.waitForLoad();
    })();

    // disconnect on destroy
    signal.addEventListener('abort', () => {
      for (const realms of Array.from(this.rooms.values())) {
        realms.disconnect();
      }
      this.rooms.clear();
    });
  }
  destroy() {
    // console.log('chats manager destroy!!', new Error().stack);

    if (this.abortController !== null) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}