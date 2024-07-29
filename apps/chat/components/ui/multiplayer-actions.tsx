'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import dedent from 'dedent'
import { NetworkRealms } from '@upstreet/multiplayer/public/network-realms.mjs';
import { multiplayerEndpointUrl } from '@/utils/const/endpoints';
import { getAgentEndpointUrl } from '@/lib/utils'
import { r2EndpointUrl } from '@/utils/const/endpoints';
import { getJWT } from '@/lib/jwt';
import { AudioDecodeStream } from '@upstreet/multiplayer/public/audio/audio-decode.mjs';
import { AudioContextOutputStream } from '@/lib/audio/audio-context-output';

//

const getAgentName = (guid: string) => `user-agent-${guid}`;
const getAgentHost = (guid: string) => `https://${getAgentName(guid)}.isekaichat.workers.dev`;
const connectAgentWs = (guid: string) =>
  new Promise((accept, reject) => {
    const agentHost = getAgentHost(guid);
    // console.log('got agent host', guidOrDevPathIndex, agentHost);
    const u = `${agentHost.replace(/^http/, 'ws')}/ws`;
    // console.log('handle websocket', u);
    // await pause();
    const ws = new WebSocket(u);
    ws.addEventListener('open', () => {
      accept(ws);
    });
    ws.addEventListener('message', (e) => {
      // const message = e.data;
      // console.log('got ws message', guid, message);
    });
    ws.addEventListener('error', (err) => {
      console.warn('unhandled ws rejection', err);
      reject(err);
    });
    // ws.addEventListener('message', (e) => {
    //   console.log('got ws message', e);
    // });
  });
const join = async ({
  room,
  guid,
}: {
  room: string;
  guid: string;
}) => {
  // cause the agent to join the room
  const agentHost = getAgentHost(guid);
  // console.log('get agent host', {
  //   guidOrDevPathIndex,
  //   agentHost,
  // });
  const u = `${agentHost}/join`;
  // console.log('join 1', u);
  const headers = {};
  // if (!dev) {
  // const jwt = await getLoginJwt();
  const jwt = localStorage.getItem('jwt');
  (headers as any).Authorization = `Bearer ${jwt}`;
  // }
  const joinReq = await fetch(u, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      room,
    }),
  });
  if (joinReq.ok) {
    const joinJson = await joinReq.json();
    // console.log('join 2', joinJson);

    const ws = await connectAgentWs(guid);
    return ws;
  } else {
    const text = await joinReq.text();
    console.warn(
      'failed to join, status code: ' + joinReq.status + ': ' + text,
    );
  }
};

const uploadFile = async (file: File) => {
  const jwt = await getJWT();
  const id = crypto.randomUUID();
  const keyPath = ['uploads', id, file.name].join('/');
  const u = `${r2EndpointUrl}/${keyPath}`;
  const res = await fetch(u, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: file,
  });
  if (res.ok) {
    const url = await res.json();
    return url;
  } else {
    const text = await res.text();
    throw new Error(`could not upload file: ${file.name}: ${text}`);
  }
}

//

interface MultiplayerActionsContextType {
  connected: boolean
  room: string
  getCrdtDoc: () => any
  localPlayerSpec: PlayerSpec
  playersMap: Map<string, Player>
  playersCache: Map<string, Player>
  messages: object[]
  setMultiplayerConnectionParameters: (params: object | null) => void
  sendRawMessage: (method: string, args: object) => void
  sendChatMessage: (text: string) => void
  sendMediaMessage: (file: File) => Promise<void>
  agentJoin: (guid: string) => Promise<void>
  agentLeave: (guid: string, room: string) => Promise<void>
  epoch: number
}

const MultiplayerActionsContext = React.createContext<MultiplayerActionsContextType | undefined>(
  undefined
)

export function useMultiplayerActions() {
  const context = React.useContext(MultiplayerActionsContext)
  if (!context) {
    throw new Error('useMultiplayerActions must be used within a MultiplayerActionsProvider')
  }
  return context
}

interface MultiplayerActionsProviderProps {
  children: React.ReactNode
}

export type PlayerSpec = {
  id: string;
  name: string;
  previewUrl: string;
  capabilities: string[];
};

export class Player {
  playerId: string;
  playerSpec: PlayerSpec;
  constructor(playerId = '', playerSpec: PlayerSpec) {
    this.playerId = playerId;
    this.playerSpec = playerSpec;
  }
  getPlayerSpec() {
    return this.playerSpec;
  }
  setPlayerSpec(playerSpec: PlayerSpec) {
    this.playerSpec = playerSpec;
  }
}

class TypingMap extends EventTarget {
  #internalMap = new Map(); // playerId: string -> { userId: string, name: string, typing: boolean }
  getMap() {
    return this.#internalMap;
  }
  set(playerId: string, spec : object) {
    this.#internalMap.set(playerId, spec);
    this.dispatchEvent(new MessageEvent('typingchange', {
      data: spec,
    }));
  }
  clear() {
    for (const [playerId, spec] of this.#internalMap) {
      this.dispatchEvent(new MessageEvent('typingchange', {
        data: spec,
      }));
    }
    this.#internalMap.clear();
  }
}

const connectMultiplayer = (room: string, playerSpec: PlayerSpec) => {
  const userId = playerSpec.id;
  const name = playerSpec.name;

  const realms = new NetworkRealms({
    endpointUrl: multiplayerEndpointUrl,
    playerId: userId,
    // audioManager: null,
  });

  const playersMap = new Map<string, Player>();
  const typingMap = new TypingMap();

  const virtualWorld = realms.getVirtualWorld();
  const virtualPlayers = realms.getVirtualPlayers();
  // console.log('got initial players', virtualPlayers.getKeys());

  // console.log('waiting for initial connection...');

  let connected = false;
  const onConnect = async (e: any) => {
    // console.log('on connect...');
    e.waitUntil(
      (async () => {
        const realmKey = e.data.rootRealmKey;

        const existingAgentIds = Array.from(playersMap.keys());
        if (existingAgentIds.includes(userId)) {
          console.log('your character is already in the room! disconnecting.');
          process.exit(1);
        }

        {
          // Initialize network realms player.
          const localPlayer = new Player(userId, playerSpec);

          playersMap.set(userId, localPlayer);
          realms.dispatchEvent(new MessageEvent('playerschange', {
            data: playersMap,
          }));
          const _pushInitialPlayer = () => {
            realms.localPlayer?.initializePlayer(
              {
                realmKey,
              },
              {},
            );
            realms.localPlayer?.setKeyValue(
              'playerSpec',
              localPlayer.playerSpec,
            );
          };
          _pushInitialPlayer();
        }

        connected = true;

        // log the initial room state
        // agentIds.push(userId);
        /* const agentJsons = await Promise.all(
          agentIds.map(async (agentId) => {
            // current player
            if (agentId === userId) {
              return {
                id: userId,
                name,
              };
            // development agent
            } else if (agentId === devAgentId) {
              return {
                id: devAgentId,
                name,
              };
            } else {
              const assetJson = await getAssetJson(supabase, agentId);
              return {
                id: agentId,
                name: assetJson.name,
              };
            }
          }),
        ); */

        const agentJsons = Array.from(playersMap.values()).map(
          (player) => player.playerSpec,
        );
        console.log(dedent`
          ${`You are ${JSON.stringify(name)} [${userId}]), chatting in ${room}.`}
          In the room (${room}):
          ${agentJsons
            .map((agent: any) => {
              return `* ${agent.name} [${agent.id}] ${agent.id === userId ? '(you)' : ''}`;
            })
            .join('\n')
          }
        `,
        );
      })(),
    );
  };
  realms.addEventListener('connect', onConnect);

  const _trackRemotePlayers = () => {
    virtualPlayers.addEventListener('join', (e: any) => {
      const { playerId, player } = e.data;
      if (connected) {
        console.log('remote player joined:', playerId);
      }

      // construct the remote player
      const remotePlayer = new Player(playerId, {
        id: '',
        name: '',
        previewUrl: '',
        capabilities: [],
      });

      // helpers
      const emitJoin = () => {
        playersMap.set(playerId, remotePlayer);
        realms.dispatchEvent(new MessageEvent('playerschange', {
          data: playersMap,
        }));

        const agentJson = remotePlayer.getPlayerSpec() as any;
        realms.dispatchEvent(new MessageEvent('chat', {
          data: {
            message: {
              userId: playerId,
              method: 'join',
              name: agentJson.name,
              args: {
                playerId,
              },
            },
          },
        }));
      };
      const ensureJoin = (() => {
        let emitted = false;
        return () => {
          if (!emitted) {
            const playerSpec = remotePlayer.getPlayerSpec();
            if (playerSpec) {
              emitted = true;
              emitJoin();
            }
          }
        }
      })();


      // apply initial remote player state
      {
        const playerSpec = player.getKeyValue('playerSpec');
        if (playerSpec) {
          remotePlayer.setPlayerSpec(playerSpec);
          ensureJoin();
        }
      }

      // Handle remote player state updates
      player.addEventListener('update', (e: any) => {
        const { key, val } = e.data;

        if (key === 'playerSpec') {
          remotePlayer.setPlayerSpec(val);
        }

        ensureJoin();
      });
    });
    virtualPlayers.addEventListener('leave', (e: any) => {
      const { playerId } = e.data;
      if (connected) {
        console.log('remote player left:', playerId);
      }

      // remove remote player
      const remotePlayer = playersMap.get(playerId);
      if (remotePlayer) {
        const agentJson = remotePlayer.getPlayerSpec() as any;
        realms.dispatchEvent(new MessageEvent('chat', {
          data: {
            message: {
              userId: playerId,
              method: 'leave',
              name: agentJson.name,
              args: {
                playerId,
              },
            },
          },
        }));

        playersMap.delete(playerId);
        realms.dispatchEvent(new MessageEvent('playerschange', {
          data: playersMap,
        }));
      } else {
        console.log('remote player not found', playerId);
        debugger;
      }

      // remove dangling audio streams
      for (const [streamId, stream] of Array.from(audioStreams.entries())) {
        if (stream.metadata.playerId === playerId) {
          stream.close();
          audioStreams.delete(streamId);
        }
      }
    });
  };
  _trackRemotePlayers();

  const audioStreams = new Map();
  const _trackAudio = () => {
    virtualPlayers.addEventListener('audiostart', e => {
      const {
        playerId,
        streamId,
        type,
      } = e.data;

      const outputStream = new AudioContextOutputStream();
      const { sampleRate } = outputStream;

      // decode stream
      const decodeStream = new AudioDecodeStream({
        type,
        sampleRate,
        format: 'f32',
      });
      decodeStream.readable.pipeTo(outputStream);

      const writer = decodeStream.writable.getWriter();
      writer.metadata = {
        playerId,
      };
      audioStreams.set(streamId, writer);
    });
    virtualPlayers.addEventListener('audio', e => {
      const {
        playerId,
        streamId,
        data,
      } = e.data;

      const stream = audioStreams.get(streamId);
      if (stream) {
        stream.write(data);
      } else {
        // throw away unmapped data
        console.warn('dropping audio data', e.data);
      }
    });
    virtualPlayers.addEventListener('audioend', e => {
      const {
        playerId,
        streamId,
        data,
      } = e.data;

      const stream = audioStreams.get(streamId);
      if (stream) {
        stream.close();
        audioStreams.delete(streamId);
      } else {
        // throw away unmapped data
        console.warn('dropping audioend data', e.data);
      }
    });
  };
  _trackAudio();

  const _bindMultiplayerChat = () => {
    const onchat = (e: any) => {
      const { message } = e.data;
      // console.log('got message', { message });
      const { userId: messageUserId, name, method, args } = message;

      switch (method) {
        case 'say': {
          const { text } = args;
          if (messageUserId !== userId) {
            console.log(`${name}: ${text}`);
          }
          break;
        }
        case 'log': {
          // if (debug) {
            // console.log('got log message', JSON.stringify(args, null, 2));
            // const { userId, name, text } = args;
            // console.log(`\r${name}: ${text}`);
            // replServer.displayPrompt(true);
            const { text } = args;
            console.log(text);
            // console.log(eraseLine + JSON.stringify(args2, null, 2));
          // }
          break;
        }
        case 'typing': {
          const { typing } = args;
          typingMap.set(messageUserId, { userId: messageUserId, name, typing });
          break;
        }
        case 'nudge':
        case 'join':
        case 'leave': {
          // nothing
          break;
        }
        default: {
          // if (debug) {
            // console.log('got log message', JSON.stringify(args, null, 2));
            // const { userId, name, text } = args;
            // console.log(`\r${name}: ${text}`);
            // replServer.displayPrompt(true);
            console.log('unhandled method', JSON.stringify(message));
            // console.log(eraseLine + JSON.stringify(args2, null, 2));
          // }
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

  (async () => {
    // console.log('update realms keys 1');
    await realms.updateRealmsKeys({
      realmsKeys: [room],
      rootRealmKey: room,
    });
    // console.log('update realms keys 2');
  })().catch(err => {
    console.warn(err);
  });

  return realms;
};

const makeFakePlayerSpec = () => (
  {
    id: '',
    name: '',
    previewUrl: '',
    capabilities: [],
  }
);
export function MultiplayerActionsProvider({ children }: MultiplayerActionsProviderProps) {
  const router = useRouter()
  const [epoch, setEpoch] = React.useState(0);
  const [multiplayerState, setMultiplayerState] = React.useState(() => {
    let connected = false;
    let room = '';
    let realms: NetworkRealms | null = null;
    let localPlayerSpec: PlayerSpec = makeFakePlayerSpec();
    let playersMap: Map<string, Player> = new Map();
    let playersCache: Map<string, Player> = new Map();
    let messages: object[] = [];

    const refresh = () => {
      setEpoch((prev) => prev + 1);
    };

    const sendRawMessage = (method: string, args: object) => {
      if (realms) {
        const { id: userId, name } = localPlayerSpec;

        const message = {
          method,
          userId,
          name,
          args,
          timestamp: Date.now(),
        };
        // console.log('send chat message', message);
        realms.sendChatMessage(message);
      } else {
        console.warn('realms not connected');
      }
    };

    const multiplayerState = {
      getConnected: () => connected,
      getRoom: () => room,
      getCrdtDoc: () => {
        // console.log('got realms 1', realms);
        if (realms) {
          const headRealm = realms.getClosestRealm(realms.lastRootRealmKey);
          // console.log('got realms 2', headRealm, headRealm);
          if (headRealm) {
            return headRealm.networkedCrdtClient.getDoc();
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
      getLocalPlayerSpec: () => localPlayerSpec,
      getPlayersMap: () => playersMap,
      getPlayersCache: () => playersCache,
      getMessages: () => messages,
      setMultiplayerConnectionParameters: (opts: object | null) => {
        let newRoom: string = (opts as any)?.room || '';
        let newLocalPlayerSpec: PlayerSpec = (opts as any)?.localPlayerSpec || makeFakePlayerSpec();

        if (room !== newRoom) {
          // latch new state
          room = newRoom;
          localPlayerSpec = newLocalPlayerSpec;
          messages = [];

          // disconnect old room
          if (realms) {
            realms.disconnect();
            realms = null;
          }

          // connect new room
          if (room) {
            if (!newLocalPlayerSpec?.id || !newLocalPlayerSpec?.name || !newLocalPlayerSpec?.previewUrl) {
              throw new Error('Invalid local player spec: ' + JSON.stringify(newLocalPlayerSpec, null, 2));
            }

            realms = connectMultiplayer(room, newLocalPlayerSpec);
            realms.addEventListener('connect', e => {
              console.log('connect event');

              connected = true;
              refresh();
            });
            realms.addEventListener('disconnect', e => {
              console.log('disconnect event');

              connected = false;
              refresh();
            });
            realms.addEventListener('chat', (e) => {
              const { message } = (e as any).data;
              messages = [...messages, message];
              refresh();
            });
            realms.addEventListener('playerschange', (e) => {
              playersMap = (e as any).data;

              // ensure all players are in the players cache
              for (const [playerId, player] of playersMap) {
                playersCache.set(playerId, player);
              }

              refresh();
            });
          }

          refresh();
        }
      },
      sendRawMessage,
      sendChatMessage: (text: string) =>
        sendRawMessage('say', {
          text,
        }),
      sendMediaMessage: async (file: File) => {
        const url = await uploadFile(file);
        return sendRawMessage('say', {
          media: {
            type: file.type,
            url,
          },
        });
      },
      agentJoin: async (guid: string) => {
        const oldRoom = multiplayerState.getRoom();
        const room = oldRoom || crypto.randomUUID();
        console.log('agent join', {
          guid,
          room,
        });
        await join({
          room,
          guid,
        });
        // redirect to the room, as necessary
        if (!/\/rooms\//.test(location.pathname)) {
          router.push(`/rooms/${room}`);
        }
      },
      agentLeave: async (guid: string, room: string) => {
        console.log('agent leave', {
          guid,
          room,
        });
        const agentEndpointUrl = getAgentEndpointUrl(guid);
        const leaveUrl = `${agentEndpointUrl}leave`;
        console.log('click x', leaveUrl);
        const res = await fetch(leaveUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room,
          }),
        });
        if (res.ok) {
          const blob = await res.blob();
        }
      },
    };
    return multiplayerState;
  });
  const connected = multiplayerState.getConnected();
  const room = multiplayerState.getRoom();
  const getCrdtDoc = multiplayerState.getCrdtDoc;
  const localPlayerSpec = multiplayerState.getLocalPlayerSpec();
  const playersMap = multiplayerState.getPlayersMap();
  const playersCache = multiplayerState.getPlayersCache();
  const messages = multiplayerState.getMessages();
  const setMultiplayerConnectionParameters = multiplayerState.setMultiplayerConnectionParameters;
  const sendRawMessage = multiplayerState.sendRawMessage;
  const sendChatMessage = multiplayerState.sendChatMessage;
  const sendMediaMessage = multiplayerState.sendMediaMessage;
  const agentJoin = multiplayerState.agentJoin;
  const agentLeave = multiplayerState.agentLeave;

  return (
    <MultiplayerActionsContext.Provider
      value={{
        connected,
        room,
        getCrdtDoc,
        localPlayerSpec,
        playersMap,
        playersCache,
        messages,
        setMultiplayerConnectionParameters,
        sendRawMessage,
        sendChatMessage,
        sendMediaMessage,
        agentJoin,
        agentLeave,
        epoch,
      }}
    >
      {children}
    </MultiplayerActionsContext.Provider>
  )
}
