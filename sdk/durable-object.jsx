import { headers } from './src/constants.js';
// import { QueueManager } from './src/util/queue-manager.mjs';
import { makeAnonymousClient } from './src/util/supabase-client.mjs';
// import { NetworkRealms } from './src/lib/multiplayer/public/network-realms.mjs';
import { multiplayerEndpointUrl } from './src/util/endpoints.mjs';
// import { ConversationContext } from './src/classes/conversation-context';
// import { Player } from './src/classes/player';
import { AgentRenderer } from './src/classes/agent-renderer';
import serverHandler from './src/routes/server.ts';
import renderUserTasks from './src/renderers/task.ts';
// import { ExtendableMessageEvent } from './src/util/extendable-message-event.ts';
// import { getConnectedWalletsFromMnemonic } from './src/util/ethereum-utils.mjs';

import userRender from '../agent';
// import { makePromise } from './src/lib/multiplayer/public/util.mjs';
// import { loadMessagesFromDatabase } from './src/util/loadMessagesFromDatabase.js'
// import { saveMessageToDatabase } from './src/util/saveMessageToDatabase.js'

Error.stackTraceLimit = 300;

const textEncoder = new TextEncoder();

//

// CloudFlare Worker Durable Object class
export class DurableObject extends EventTarget {
  constructor(state, env) {
    super();
    
    this.state = state;
    this.env = env;
    this.supabase = makeAnonymousClient(env, env.AGENT_TOKEN);

    this.agentRenderer = new AgentRenderer({
      env,
      userRender,
    });

    this.loadPromise = (async () => {
      await this.agentRenderer.rerenderAsync();
    })().catch(err => {
      console.warn(err);
    });

    (async () => {
      await this.updateTasks();
    })().catch(err => {
      console.warn(err);
    });
  }

  waitForLoad() {
    return this.loadPromise;
  }

  //

  async join({
    agentId = null,
    room,
    endpointUrl = multiplayerEndpointUrl,
  }) {
    const promises = [];
    const agents = Array.from(this.agentRenderer.agentRegistry.values());
    if (agentId !== null) {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        const p = agent.join({
          room,
          endpointUrl,
        });
        promises.push(p);
      } else {
        throw new Error('agent not found');
      }
    } else {
      for (const agent of agents) {
        const p = agent.join({
          room,
          endpointUrl,
        });
        promises.push(p);
      }
    }
    await Promise.all(promises);
  }
  async leave({
    agentId = null,
    room,
    endpointUrl = multiplayerEndpointUrl,
  }) {
    const agents = Array.from(this.agentRenderer.agentRegistry.values());
    if (agentId !== null) {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        await agent.leave({
          room,
          endpointUrl,
        });
      } else {
        throw new Error('agent not found');
      }
    } else {
      for (const agent of agents) {
        await agent.leave({
          room,
          endpointUrl,
        });
      }
    }
  }

  //

  getGuid() {
    return this.env.GUID;
  }
  getAgentJson() {
    const agentJsonString = this.env.AGENT_JSON;
    const agentJson = JSON.parse(agentJsonString);
    return agentJson;
  }

  //

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

            // input from the websocket
            server.addEventListener('message', async (event) => {
              const j = JSON.parse(event.data);
              const { method, args } = j;
              switch (method) {
                case 'join': {
                  await this.join({
                    room: args.room,
                    endpointUrl: args.endpointUrl,
                  });
                  break;
                }
                case 'leave': {
                  await this.leave({
                    room: args.room,
                    endpointUrl: args.endpointUrl,
                  });
                  break;
                }
              }
            });

            // // output to the websocket
            // const onmessage = (e) => {
            //   // skip recursive chat messages coming from the socket
            //   server.send(JSON.stringify(e.data));
            // };
            // this.conversationContext.addEventListener('message', onmessage);
            server.addEventListener('close', (e) => {
              console.log('got websocket close', {
                guid,
              });

              // this.conversationContext.removeEventListener(
              //   'message',
              //   onmessage,
              // );

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
            this.conversationContext.removeEventListener('message', message);
            this.removeEventListener('error', message);
          };

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
            const room = this.realms
              ? Array.from(this.realms.connectedRealms)?.[0].key ?? null
              : null;
            return new Response(JSON.stringify({
              room,
            }), {
              headers,
            });
          } else {
            return new Response(JSON.stringify({
              error: 'method not allowed',
            }), {
              status: 405,
              headers,
            });
          }
        };
        const handleJoin = async () => {
          // read the body json
          const body = await request.json();
          const { room, endpointUrl } = body ?? {};
          if (typeof room === 'string') {
            await this.join({
              room,
              endpointUrl,
            });

            return new Response(JSON.stringify({ ok: true }), {
              headers,
            });
          } else {
            return new Response(JSON.stringify({
              error: 'invalid request',
            }), {
              status: 400,
              headers,
            });
          }
        };
        const handleLeave = async () => {
          const { room, endpointUrl } = body ?? {};
          if (typeof room === 'string') {
            await this.leave({
              room,
              endpointUrl,
            });

            return new Response(JSON.stringify({ ok: true }), {
              headers,
            });
          } else {
            return new Response(JSON.stringify({
              error: 'invalid request',
            }), {
              status: 400,
              headers,
            });
          }
        };
        const handleDefaultRequest = async () => {
          const serverResponse = await serverHandler(request, this.agentRenderer);
          const arrayBuffer = await serverResponse.arrayBuffer();
          return new Response(arrayBuffer, {
            status: serverResponse.status,
            headers: {
              ...headers,
              'Content-Type': serverResponse.headers.get('Content-Type'),
            },
          });
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
  }
}
