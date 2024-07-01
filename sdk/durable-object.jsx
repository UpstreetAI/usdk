import { headers } from './src/constants.js';
import { QueueManager } from './src/util/queue-manager.mjs';
import { makeAnonymousClient } from './src/util/supabase-client.mjs';
import { NetworkRealms } from './src/lib/multiplayer/public/network-realms.mjs';
import { multiplayerEndpointUrl } from './src/util/endpoints.mjs';
import { ConversationContext } from './src/classes/conversation-context';
import { Player } from './src/classes/player';
// import { AgentConsole } from './src/classes/agent-console.mjs';
import { AgentRenderer } from './src/runtime.ts';
// import nudgeHandler from './src/routes/nudge.ts';
import serverHandler from './src/routes/server.ts';
// import renderUserAlarm from './src/renderers/alarm.ts';
import renderUserTasks from './src/renderers/task.ts';
import { ExtendableMessageEvent } from './src/components.ts';
import { getConnectedWalletsFromMnemonic } from './src/util/ethereum-utils.mjs';

import userRender from '../agent';
import { makePromise } from './src/lib/multiplayer/public/util.mjs';
import { loadMessagesFromDatabase } from './src/util/loadMessagesFromDatabase.js'
import { saveMessageToDatabase } from './src/util/saveMessageToDatabase.js'

Error.stackTraceLimit = 300;

const LOADED_MESSAGES_LIMIT = 50

const textEncoder = new TextEncoder();
// const alarmRate = 10 * 1000;

//

// CloudFlare Worker Durable Object class
export class DurableObject extends EventTarget {
  constructor(state, env) {
    super();

    this.state = state;
    this.env = env;
    this.supabase = makeAnonymousClient(env, env.AGENT_TOKEN);
    this.realms = null;
    const agentJson = this.getAgentJson();
    this.conversationContext = new ConversationContext({
      scene: {
        description: 'A virtual world of embodied virtual characters.',
      },
      currentAgent: agentJson,
    });

    const _bindConversationContext = () => {
      // handle conversation remote message re-render
      const onConversationContextLocalPreMessage = async (e) => {
        const { message } = e.data;
        await this.incomingMessageQueueManager.waitForTurn(async () => {
          try {
            await this.agentRenderer.rerenderAsync();
          } catch (err) {
            console.warn(err.stack);
          }
          await this.conversationContext.postLocalMessage(message);
        });
      };
      this.conversationContext.addEventListener(
        'localmessagepre',
        onConversationContextLocalPreMessage,
      );
      // bind the perception handlers based on the message type
      const onConversationContextLocalPostMessage = async (e) => {
        const { message, waitUntil } = e.data;
        waitUntil((async () => {
          const {
            perceptionRegistry,
          } = await this.agentRenderer.ensureOutput();

          const allPerceptions = Array.from(perceptionRegistry.values());
          const currentAgent = this.agentRenderer.getCurrentAgent();

          for (const perception of allPerceptions) {
            if (perception.type === message.method) {
              const e = new ExtendableMessageEvent('perception', {
                data: {
                  agent: currentAgent,
                  message,
                },
              });
              await perception.handler(e);
            }
          }

          await saveMessageToDatabase(this.supabase, this.getGuid(), message);
        })());
      };
      this.conversationContext.addEventListener(
        'localmessagepost',
        onConversationContextLocalPostMessage,
      );

      this.conversationContext.addEventListener('remotemessage', async (e) => {
        if (this.realms?.isConnected()) {
          const { message } = e.data;
          this.realms.sendChatMessage(message);

          await saveMessageToDatabase(this.supabase, this.getGuid(), message);
        }
      });
      this.conversationContext.addEventListener('typingstart', (e) => {
        if (this.realms?.isConnected()) {
          const { agent } = e.data;
          this.realms.sendChatMessage({
            method: 'typing',
            userId: agent.id,
            name: agent.name,
            args: {
              typing: true,
            },
            hidden: true,
          });
        }
      });
      this.conversationContext.addEventListener('typingstop', (e) => {
        if (this.realms?.isConnected()) {
          const { agent, error } = e.data;
          this.realms.sendChatMessage({
            method: 'typing',
            userId: agent.id,
            name: agent.name,
            args: {
              typing: false,
              error,
            },
            hidden: true,
          });
        }
      });
    };
    _bindConversationContext();

    this.incomingMessageQueueManager = new QueueManager();
    // this.nudgeQueueManager = new QueueManager();

    const mnemonic = env.WALLET_MNEMONIC;
    const wallets = getConnectedWalletsFromMnemonic(mnemonic);
    this.agentRenderer = new AgentRenderer({
      env: this.env,
      userRender,
      conversationContext: this.conversationContext,
      wallets,
      enabled: false,
    });

    this.loadPromise = (async () => {
      // Load messages into conversation context.
      const messages = await loadMessagesFromDatabase(this.supabase, LOADED_MESSAGES_LIMIT);
      this.conversationContext.setMessages(messages);

      // Enable the renderer.
      // const enabled = (await this.state.storage.get('enabled')) ?? false;
      // this.agentRenderer.setEnabled(enabled);

      await this.updateTasks();
    })().catch(err => {
      console.warn(err);
    });
    this.loadPromise = null;

    // const _initialSchedule = async () => {
    //   try {
    //     await this.schedule();
    //   } catch (err) {
    //     console.warn(err.stack);
    //   }
    // };
    // _initialSchedule();
  }

  waitForLoad() {
    return this.loadPromise;
  }

  // get the currently configured guid, with check
  getGuid() {
    return this.env.GUID;
  }

  setRealms(realms) {
    this.realms = realms;
  }

  // join a multiplayer room
  async join(room) {
    console.log('connect to url', multiplayerEndpointUrl);

    const guid = this.getGuid();

    const realms = new NetworkRealms({
      endpointUrl: multiplayerEndpointUrl,
      playerId: guid,
      audioManager: null,
    });

    const virtualWorld = realms.getVirtualWorld();
    const virtualPlayers = realms.getVirtualPlayers();

    // const pingRate = 10 * 1000;
    // let pingInterval = null;

    const cleanupFns = [];
    const cleanup = () => {
      for (const fn of cleanupFns) {
        fn();
      }
    };
    cleanupFns.push(() => {
      this.setRealms(null);
      this.conversationContext.clearAgents();
    });

    // Initiate network realms connection.
    const connectPromise = makePromise();
    const onConnect = async (e) => {
      e.waitUntil(
        (async () => {
          const realmKey = e.data.rootRealmKey;

          // Initialize network realms player.
          const agentJson = this.getAgentJson();
          const localPlayer = new Player(guid, agentJson);
          const _pushInitialPlayer = () => {
            realms.localPlayer.initializePlayer(
              {
                realmKey,
              },
              {},
            );
            // const transformAndTimestamp = localTransformAndTimestamp;
            // localPlayer.position.toArray(transformAndTimestamp, 0);
            // localPlayer.quaternion.toArray(transformAndTimestamp, 3);
            // localPlayer.scale.toArray(transformAndTimestamp, 7);
            // const now = performance.now();
            // transformAndTimestamp[10] = now;
            // this.realms.localPlayer.setKeyValue('transform', transformAndTimestamp);
            // this.realms.localPlayer.setKeyValue('velocity', [0, 0, 0, 0]);
            // const avatarPoseBuffer = localPlayer.avatarPose ?
            //   localPlayer.avatarPose.serialize(localAvatarPoseBuffer)
            // :
            //   null;
            // this.realms.localPlayer.setKeyValue('avatarPose', avatarPoseBuffer);
            // this.realms.localPlayer.setKeyValue('voiceSpec', localPlayer.playerMap.get('voiceSpec'));
            realms.localPlayer.setKeyValue(
              'playerSpec',
              localPlayer.getPlayerSpec(),
            );
          };
          _pushInitialPlayer();

          // const _bindPing = () => {
          //   pingInterval = setInterval(() => {
          //     realms.sendChatMessage({
          //       method: 'ping',
          //       args: {},
          //     });
          //   }, pingRate);
          // };
          // _bindPing();

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
        this.conversationContext.addAgent(playerId, remotePlayer);

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
        const remotePlayer = this.conversationContext.getAgent(playerId);
        if (remotePlayer) {
          this.conversationContext.removeAgent(playerId);
        } else {
          console.warn('remote player not found', playerId);
          debugger;
        }

        /* const agentJson = this.getAgentJson();
        const leaveMessage = {
          userId: guid,
          method: 'leave',
          name: agentJson.name,
          args: {
            playerId,
          },
        };
        await this.conversationContext.addLocalAndRemoteMessage(leaveMessage); */
      });
    };
    _trackRemotePlayers();

    const _bindMultiplayerChat = () => {
      console.log('bind multiplayer chat');

      const handleRemoteUserMessage = async (message) => {
        if (!message.hidden) {
          this.conversationContext.addLocalMessage(message);
        }

        /* const { method, args } = message;
        switch (method) {
          // case 'say': {
          //   // console.log('got say 1', args);
          //   await this.nudge();
          //   // console.log('got say 2', args);
          //   break;
          // }
          case 'nudge': {
            const { targetPlayerId } = args;
            if (targetPlayerId === guid) {
              await this.nudge();
            }
            break;
          }
          default: {
            break;
          }
        } */
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
        cleanup();
        // clearInterval(pingInterval);
      });
    };
    _bindDisconnect();

    if (this.realms) {
      this.realms.disconnect();
    }
    this.setRealms(realms);

    await this.realms.updateRealmsKeys({
      realmsKeys: [room],
      rootRealmKey: room,
    });

    await connectPromise;
  }
  // leave the multiplayer room
  async leave() {
    if (this.realms) {
      this.realms.disconnect();
    }
  }

  getAgentJson() {
    const agentJsonString = this.env.AGENT_JSON;
    const agentJson = JSON.parse(agentJsonString);
    return agentJson;
  }

  /* // nudge the agent to think
  async nudge() {
    return await this.nudgeQueueManager.waitForTurn(async () => {
      try {
        await this.typing(async () => {
          // console.log('nudge 1');
          await nudgeHandler(this.agentRenderer);
          // console.log('nudge 2');

          return new Response(JSON.stringify({
            ok: true,
          }), {
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
          });
        });
      } catch (err) {
        console.warn(err.stack);

        const j = {
          error: err.stack,
        };
        const errorMessage = new MessageEvent('error', {
          data: j,
        });
        this.dispatchEvent(errorMessage);

        const s = JSON.stringify(j);
        return new Response(s, {
          status: 500,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        });
      }
    });
  } */
  async handleUserAgentServerRequest(request) {
    const serverResponse = await serverHandler(request, this.agentRenderer);
    const arrayBuffer = await serverResponse.arrayBuffer();
    return new Response(arrayBuffer, {
      status: serverResponse.status,
      headers: {
        ...headers,
        // ...headersToObject(serverRes.headers),
        'Content-Type': serverResponse.headers.get('Content-Type'),
      },
    });
  }

  // Handle HTTP requests from clients.
  async fetch(request) {
    try {
      const u = new URL(request.url);
      console.log('worker request', request.method, u.href);

      await this.waitForLoad();

      // parse the url
      let match;
      if ((match = u.pathname.match(/^\/([^/]*)/))) {
        const subpath = match[1];
        const guid = this.getGuid();

        // store the guid for later calls to reference
        // await this.setGuid(guid);

        const handleAgentJson = async () => {
          const agentJson = this.getAgentJson();
          const s = JSON.stringify(agentJson);
          return new Response(s, {
            headers,
            'Content-Type': 'application/json',
          });
        };
        const handleWs = async () => {
          // Expect to receive a WebSocket Upgrade request.
          // If there is one, accept the request and return a WebSocket Response.
          const upgradeHeader = request.headers.get('Upgrade');
          if (upgradeHeader === 'websocket') {
            console.log('got websocket open', {
              guid,
            });

            // Creates two ends of a WebSocket connection.
            const webSocketPair = new WebSocketPair();
            const [client, server] = Object.values(webSocketPair);

            // Calling `accept()` informs the runtime that this WebSocket is to begin terminating
            // request within the Durable Object. It has the effect of "accepting" the connection,
            // and allowing the WebSocket to send and receive messages.
            server.accept();

            /* // ongoing tick messages
            let interval = null;
            {
              let i = 0;
              interval = setInterval(() => {
                const j = {
                  method: 'tick',
                  args: {
                    guid,
                    tick: i++,
                    source: 'ws',
                  },
                };
                // console.log('websocket tick', j);
                const s = JSON.stringify(j);
                server.send(s);
              }, pingRate);
            } */

            // input from the websocket
            server.addEventListener('message', async (event) => {
              const j = JSON.parse(event.data);
              const { method, args } = j;
              switch (method) {
                case 'join': {
                  await this.join(args.room);
                  break;
                }
                case 'leave': {
                  await this.leave();
                  break;
                }
                // case 'nudge': {
                //   await this.nudge();
                //   break;
                // }
              }
            });

            // output to the websocket
            const onmessage = (e) => {
              // skip recursive chat messages coming from the socket
              server.send(JSON.stringify(e.data));
            };
            this.conversationContext.addEventListener('message', onmessage);
            server.addEventListener('close', (e) => {
              console.log('websocket close', e);
              this.conversationContext.removeEventListener(
                'message',
                onmessage,
              );
            });

            // If the client closes the connection, the runtime will also close the connection.
            server.addEventListener('close', (e) => {
              console.log('got websocket close', {
                guid,
                stack: new Error().stack,
              });

              // clearInterval(interval);
              server.close(1001, 'Durable Object is closing WebSocket');
            });

            return new Response(null, {
              status: 101,
              headers,
              webSocket: client,
            });
          } else {
            // expected upgrade header. respond with upgrade required status code.
            return new Response('durable object: upgrade required', {
              status: 426,
              headers,
            });
          }
        };
        const handleEvents = async () => {
          // output to the event stream
          const message = (e) => {
            const s = JSON.stringify(e.data);
            const b = textEncoder.encode(`data: ${s}\n\n`);
            controller.enqueue(b);
          };
          this.conversationContext.addEventListener('message', message);
          this.addEventListener('error', message);
          const cleanup = () => {
            // console.log('event listener removed', {
            //   guid,
            // });
            this.conversationContext.removeEventListener('message', message);
            this.removeEventListener('error', message);

            // clearInterval(interval);
          };

          /* // ongoing tick messages
          let interval = null;
          {
            let i = 0;
            interval = setInterval(() => {
              const j = {
                guid,
                tick: i++,
                source: 'events',
              };
              // console.log('emit tick');
              self.dispatchEvent(
                new MessageEvent('message', {
                  data: j,
                }),
              );
            }, pingRate);
          } */

          // response stream
          let controller = null;
          const readable = new ReadableStream({
            start(_controller) {
              controller = _controller;

              const j = {
                ok: true,
              };
              const s = JSON.stringify(j);
              const b = textEncoder.encode(`data: ${s}\n\n`);
              controller.enqueue(b);
            },
            cancel() {
              cleanup();
            },
          });

          const res = new Response(readable, {
            headers: {
              ...headers,
              'Content-Type': 'text/event-stream',
            },
          });
          return res;
        };
        const handleStatus = async () => {
          if (request.method === 'GET') {
            // return the enabled status as well as the room state
            // const enabled = (await this.state.storage.get('enabled')) ?? false;
            const room = this.realms
              ? Array.from(this.realms.connectedRealms)?.[0].key ?? null
              : null;
            return new Response(JSON.stringify({
              // enabled,
              room,
            }), {
              headers,
            });
          /* } else if (request.method === 'POST') {
            const j = await request.json();

            const _updateEnabled = async () => {
              const { enabled } = j ?? {};
              if (typeof enabled === 'boolean') {
                if (enabled) {
                  await this.state.storage.put('enabled', true);
                  this.agentRenderer.setEnabled(true);

                  // refresh the scheduler
                  await this.schedule();
                } else {
                  await this.state.storage.delete('enabled');
                  this.agentRenderer.setEnabled(false);

                  console.log(`disable alarm ${guid}`);
                  this.state.storage.deleteAlarm();
                }
              }
            };
            await _updateEnabled();
            return new Response(JSON.stringify({ ok: true }), {
              headers,
            }); */
          } else {
            return new Response(JSON.stringify({
              error: 'method not allowed',
            }), {
              status: 405,
              headers,
            });
          }
        };
        // const handleNudge = async () => {
        //   await this.nudge();
        // };
        const handleJoin = async () => {
          // read the body json
          const body = await request.json();
          const { room } = body ?? {};
          if (typeof room !== 'string') {
            return new Response(JSON.stringify({
              error: 'invalid request',
            }), {
              status: 400,
              headers,
            });
          }
          await this.join(room);

          /* const agentJson = this.getAgentJson();
          const joinMessage = {
            userId: guid,
            method: 'join',
            name: agentJson.name,
            args: {
              playerId: guid,
            },
          };
          await this.conversationContext.addLocalAndRemoteMessage(joinMessage); */

          return new Response(JSON.stringify({ ok: true }), {
            headers,
          });
        };
        const handleLeave = async () => {
          await this.leave();

          return new Response(JSON.stringify({ ok: true }), {
            headers,
          });
        };
        const handleDefaultRequest = async () => {
          return await this.handleUserAgentServerRequest(request);
        };

        switch (subpath) {
          case 'agent.json':
            return await handleAgentJson();
          case 'ws':
            return await handleWs();
          case 'events':
            return await handleEvents();
          case 'status':
            return await handleStatus();
          // case 'nudge':
          //   return await handleNudge();
          case 'join':
            return await handleJoin();
          case 'leave':
            return await handleLeave();
          default:
            return await handleDefaultRequest();
        }
      } else {
        return new Response('durable object: not found', {
          url: u.href,
          headers,
          status: 404,
        });
      }
    } catch (err) {
      console.warn(err);

      return new Response(JSON.stringify({ error: err.stack }), {
        headers,
        status: 500,
      });
    }
  }
  /* async schedule() {
    // wait for the agent to be loaded
    // console.log('schedule 1');
    await this.waitForLoad();
    // console.log('schedule 2');

    // render the agent's timeout spec
    const alarmSpec = await renderUserAlarm(this.agentRenderer);
    const {
      perceptionRegistry,
      timeout,
    } = alarmSpec;

    // set the next alarm
    if (isFinite(timeout)) {
      this.state.storage.setAlarm(timeout);
    // } else {
    //   console.warn(
    //     'invalid alarm timeout -- must be a number',
    //     alarmSpec,
    //   );
    }
  } */
  async updateTasks() {
    // console.log('update tasks');
    const taskUpdater = await renderUserTasks(this.agentRenderer);
    const timeout = await taskUpdater.update();
    if (isFinite(timeout)) {
      // const now = Date.now();
      // console.log('set new task timeout in ' + (timeout - now) + 'ms');
      this.state.storage.setAlarm(timeout);
    }
  }
  async alarm() {
    await this.updateTasks();

    /* // handle the alarm
    const [guid, enabled] = await Promise.all([
      this.getGuid(),
      this.state.storage.get('enabled'),
    ]);
    if (enabled) {
      console.log('alarm for guid', {
        guid,
      });

      // trigger the next message
      const messageResponse = await this.nudge();
      if (messageResponse.ok) {
        const message = await messageResponse.json();
        console.log('got alarm message', JSON.stringify(message, null, 2));
      } else {
        throw new Error(`got alarm message error ${messageResponse.status}`);
      }

      // schedule the next alarm
      await this.schedule();
    } else {
      console.warn(`skipping spurious alarm for guid ${guid} enabled ${enabled}`);
    } */
  }
}
