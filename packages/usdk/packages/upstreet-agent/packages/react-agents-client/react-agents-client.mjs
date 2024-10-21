import Jimp from 'jimp';
import dedent from 'dedent';
import {
  devServerPort,
} from './packages/upstreet-agent/packages/react-agents-local/util/ports.mjs';
import {
  multiplayerEndpointUrl,
} from './packages/upstreet-agent/packages/react-agents/util/endpoints.mjs';
import { NetworkRealms } from './packages/upstreet-agent/packages/react-agents-client/packages/multiplayer/public/network-realms.mjs'; // XXX should be a deduplicated import, in a separate npm module
import { webbrowserActionsToText } from './packages/upstreet-agent/packages/react-agents/util/browser-action-utils.mjs';
import {
  ImageRenderer,
} from './packages/upstreet-agent/packages/react-agents/devices/video-input.mjs';
import {
  consoleImageWidth,
} from './packages/upstreet-agent/packages/react-agents/constants.mjs';
import {
  Player,
} from './util/player.mjs';
import {
  PlayersMap,
  TypingMap,
  SpeakerMap,
} from './util/maps.mjs';

export class ReactAgentsClient {
  url;
  constructor(url) {
    this.url = url;
  }
  async join(room, {
    only = false,
  } = {}) {
    const u = `${this.url}/join`;
    const joinReq = await fetch(u, {
      method: 'POST',
      body: JSON.stringify({
        room,
        only,
      }),
    });
    if (joinReq.ok) {
      const joinJson = await joinReq.json();
      // console.log('join json', joinJson);
    } else {
      const text = await joinReq.text();
      console.warn(
        'failed to join, status code: ' + joinReq.status + ': ' + text,
      );
      process.exit(1);
    }
  }
  connect({
    room,
    profile,
    debug = false,
  } = {}) {
    return new ReactAgentsMultiplayerConnection({
      room,
      profile,
      debug,
    });
  }
}

export class ReactAgentsMultiplayerConnection extends EventTarget {
  static logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };
  static defaultLogLevel = ReactAgentsMultiplayerConnection.logLevels.info;
  room;
  profile;
  debug;
  connectPromise;
  constructor({
    room,
    profile,
    debug,
  }) {
    super();

    this.room = room;
    this.profile = profile;
    this.debug = debug;

    this.connectPromise = this.connect();
    // this.connectPromise.catch(err => {
    //   this.dispatchEvent(new MessageEvent('error', {
    //     data: {
    //       error: err,
    //     },
    //   }));
    // });
  }
  log(...args) {
    this.dispatchEvent(new MessageEvent('log', {
      data: {
        args,
        logLevel: ReactAgentsMultiplayerConnection.logLevels.info,
      },
    }));
  }
  async connect() {
    const { profile, debug } = this;
    const userId = profile?.id;
    const name = profile?.name;
  
    // join the room
    const realms = new NetworkRealms({
      endpointUrl: multiplayerEndpointUrl,
      playerId: userId,
    });
    const playersMap = new PlayersMap();
    const typingMap = new TypingMap();
    const speakerMap = new SpeakerMap();
  
    // const virtualWorld = realms.getVirtualWorld();
    const virtualPlayers = realms.getVirtualPlayers();
  
    // this.log('waiting for initial connection...');
  
    let connected = false;
    const onConnect = async (e) => {
      // this.log('on connect...');
      e.waitUntil(
        (async () => {
          const realmKey = e.data.rootRealmKey;
  
          const existingAgentIds = Array.from(playersMap.getMap().keys());
          if (existingAgentIds.includes(userId)) {
            this.log('your character is already in the room! disconnecting.');
            process.exit(1);
          }
  
          // Initialize network realms player.
          const localPlayer = new Player(userId, {
            id: userId,
            name,
            capabilities: [
              'human',
            ],
          });
          const _pushInitialPlayer = () => {
            realms.localPlayer.initializePlayer(
              {
                realmKey,
              },
              {},
            );
            realms.localPlayer.setKeyValue(
              'playerSpec',
              localPlayer.playerSpec,
            );
          };
          _pushInitialPlayer();
  
          connected = true;
  
          const agentJsons = Array.from(playersMap.getMap().values()).map(
            (player) => player.playerSpec,
          );
          this.log(dedent`\
            ${profile ? `You are ${JSON.stringify(name)} [${userId}]), chatting in ${room}.` : ''}
            In the room (${room}):
            ${agentJsons.length > 0 ?
              agentJsons
                .map((agent) => {
                  return `* ${agent.name} [${agent.id}] ${agent.id === userId ? '(you)' : ''}`;
                })
                .join('\n')
              :
                `* no one else is here`
            }
            http://local.upstreet.ai:${devServerPort}
          `,
          );
        })(),
      );
    };
    realms.addEventListener('connect', onConnect);
  
    const _trackRemotePlayers = () => {
      virtualPlayers.addEventListener('join', (e) => {
        const { playerId, player } = e.data;
        if (connected) {
          this.log('remote player joined:', playerId);
        }
  
        const remotePlayer = new Player(playerId);
        playersMap.add(playerId, remotePlayer);
  
        // apply initial remote player state
        {
          const playerSpec = player.getKeyValue('playerSpec');
          if (playerSpec) {
            remotePlayer.setPlayerSpec(playerSpec);
          }
        }
  
        // Handle remote player state updates
        player.addEventListener('update', e => {
          const { key, val } = e.data;
  
          if (key === 'playerSpec') {
            remotePlayer.setPlayerSpec(val);
          }
        });
      });
      virtualPlayers.addEventListener('leave', e => {
        const { playerId } = e.data;
        if (connected) {
          this.log('remote player left:', playerId);
        }
  
        // remove remote player
        const remotePlayer = playersMap.get(playerId);
        if (remotePlayer) {
          playersMap.remove(playerId);
        } else {
          this.log('remote player not found', playerId);
          throw new Error('remote player not found');
        }
  
        // // remove dangling audio streams
        // for (const [streamId, stream] of Array.from(audioStreams.entries())) {
        //   if (stream.metadata.playerId === playerId) {
        //     stream.close();
        //     audioStreams.delete(streamId);
        //   }
        // }
      });
    };
    _trackRemotePlayers();
  
    const _bindMultiplayerChat = () => {
      const onchat = (e) => {
        const { message } = e.data;
        const { userId: messageUserId, name, method, args } = message;
        // console.log('got message', message);
        const attachments = (message.attachments ?? []).filter(a => !!a.url);
  
        switch (method) {
          case 'say': {
            const { text } = args;
            if (messageUserId !== userId) {
              let s = `${name}: ${text}`;
              if (attachments.length > 0) {
                s += '\n[Attachments:';
                for (const attachment of attachments) {
                  const { type, url } = attachment;
                  s += `\n  [${type}]: ${url}`;
                }
                s += '\n]';
              }
              this.log(s);
  
              // read attachments and print them to the console if we can
              if (attachments) {
                for (const attachment of attachments) {
                  if (attachment.type.startsWith('image/')) {
                    (async () => {
                      const { url } = attachment;
  
                      const res = await fetch(url);
                      const ab = await res.arrayBuffer();
  
                      const b = Buffer.from(ab);
                      const jimp = await Jimp.read(b);
  
                      const imageRenderer = new ImageRenderer();
                      const {
                        text: imageText,
                      } = imageRenderer.render(jimp.bitmap, consoleImageWidth, undefined);
                      console.log(`${url}:`);
                      console.log(imageText);
                    })();
                  }
                }
              }
             }
            break;
          }
          case 'log': {
            if (debug) {
              const { text } = args;
              this.log(text);
            }
            break;
          }
          case 'typing': {
            const { typing } = args;
            typingMap.set(messageUserId, { userId: messageUserId, name, typing });
            break;
          }
          case 'mediaPerception': {
            this.log(`[${name} checked an attachment`);
            break;
          }
          case 'addMemory': {
            this.log(`[${name} will remember that]`);
            break;
          }
          case 'queryMemories': {
            this.log(`[${name} is trying to remember]`);
            break;
          }
          case 'browserAction': {
            const {
              method: method2,
              args: args2,
              result,
              error,
            } = args;
            const webbrowserAction = webbrowserActionsToText.find((action) => action.method === method2);
            if (webbrowserAction) {
              // get the agent from the player spec
              const player = playersMap.get(messageUserId);
              // console.log('got player', player);
              let agent = player?.playerSpec;
              // console.log('got agent', agent);
              if (!agent) {
                console.warn('no agent for browserAction message user id', messageUserId);
                // debugger;
                agent = {};
              }
              const o = {
                // get the agent from the local player spec
                agent,
                method: method2,
                args: args2,
                result,
                error,
              };
              this.log(`[${webbrowserAction.toText(o)}]`);
            }
            // this.log(`[${name} checked an attachment`);
            break;
          }
          case 'paymentRequest': {
            const {
              type,
              props,
            } = args;
            const {
              amount,
              currency,
              interval,
              intervalCount,
            } = props;
            const price = (() => {
              const v = amount / 100;
              if (currency === 'usd') {
                return `$${v}`;
              } else {
                return `${v} ${currency.toUpperCase()}`;
              }
            })();
            const subscriptionText = type === 'subscription' ? ` per ${interval}${intervalCount !== 1 ? 's' : ''}` : '';
            this.log(`[${name} requests ${price}${subscriptionText} for ${type} ${props.name}${props.description ? `: ${props.description}` : ''}]`);
            // const { amount, currency, url, productName, productDescription, productQuantity } = args;
            // this.log(`[${name} requests ${amount / 100} ${currency} for ${productQuantity} x ${productName}]: ${url}`);
            break;
          }
          case 'nudge':
          case 'join':
          case 'leave': {
            // nothing
            break;
          }
          default: {
            this.log(`${name}: ${JSON.stringify(message)}`);
            break;
          }
        }
      };
      realms.addEventListener('chat', onchat);
      const cleanup = () => {
        realms.removeEventListener('chat', onchat);
        typingMap.clear();
      };
      realms.addEventListener('disconnect', () => {
        cleanup();
      });
    };
    _bindMultiplayerChat();
  
    await realms.updateRealmsKeys({
      realmsKeys: [room],
      rootRealmKey: room,
    });
  
    // return {
    //   userAsset: profile,
    //   realms,
    //   typingMap,
    //   speakerMap,
    // };
  }
  async waitForConnect() {
    return await this.connectPromise;
  }
}
