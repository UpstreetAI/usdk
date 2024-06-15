'use client'

import * as React from 'react'
import dedent from 'dedent'
import { NetworkRealms } from '@upstreet/multiplayer/public/network-realms.mjs';
import { multiplayerEndpointUrl } from '@/utils/const/endpoints';

interface ActionsContext {
  isSearchOpen: boolean
  toggleSearch: () => void
  playersMap: Map<string, Player>
  messages: object[]
  getRoom: () => string
  setMultiplayerConnectionParameters: (params: { room: string, localPlayerSpec: PlayerSpec }) => void
  sendChatMessage: (text: string) => void
}

const ActionsContext = React.createContext<ActionsContext | undefined>(
  undefined
)

export function useActions() {
  const context = React.useContext(ActionsContext)
  if (!context) {
    throw new Error('useActions must be used within a ActionsProvider')
  }
  return context
}

interface ActionsProviderProps {
  children: React.ReactNode
}

export type PlayerSpec = {
  id: string
  name: string
  previewUrl: string
};

class Player {
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
    audioManager: null,
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
    });
  };
  _trackRemotePlayers();

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
  })();

  return realms;
};

export function ActionsProvider({ children }: ActionsProviderProps) {
  const [isSearchOpen, setSearchOpen] = React.useState<boolean>(false)
  const [messages, setMessages] = React.useState<object[]>([] as object[])
  const [playersMap, setPlayersMap] = React.useState<Map<string, Player>>(new Map());
  
  const realmsSpec = React.useMemo(() => {
    let userId = '';
    let name = '';
    let room = '';

    let localPlayerSpec: PlayerSpec = {
      id: '',
      name: '',
      previewUrl: '',
    };

    let realms: NetworkRealms | null = null;
    return {
      getRoom: () => room,
      setMultiplayerConnectionParameters: ({
        room: newRoom,
        localPlayerSpec: newLocalPlayerSpec,
      }: {
        room: string,
        localPlayerSpec: PlayerSpec,
      }) => {
        if (!newLocalPlayerSpec?.id || !newLocalPlayerSpec?.name || !newLocalPlayerSpec?.previewUrl) {
          throw new Error('Invalid local player spec: ' + JSON.stringify(newLocalPlayerSpec, null, 2));
        }

        if (room !== newRoom) {
          room = newRoom;
          localPlayerSpec = newLocalPlayerSpec;
          if (realms) {
            realms.disconnect();
            realms = null;
          }

          setMessages([]);

          userId = crypto.randomUUID();
          name = 'Anonymous';
          realms = connectMultiplayer(room, localPlayerSpec);

          realms.addEventListener('chat', (e) => {
            const { message } = (e as any).data;
            // console.log('got chat message', message);
            setMessages((prev: object[]) => {
              const newMessages = [...prev, message];
              // console.log('got new messages', newMessages);
              return newMessages;
            });
          });
          realms.addEventListener('playerschange', (e) => {
            setPlayersMap((e as any).data);
          });
        }
      },
      sendChatMessage: (text: string) => {
        if (realms) {
          const { id: userId, name } = localPlayerSpec;

          const message = {
            method: 'say',
            userId,
            name,
            args: {
              text,
            },
            timestamp: Date.now(),
          };
          realms.sendChatMessage(message);
        } else {
          console.warn('realms not connected');
        }
      },
    };
  }, []);

  const { getRoom, setMultiplayerConnectionParameters, sendChatMessage } = realmsSpec;

  const toggleSearch = () => {
    setSearchOpen(value => !value)
  }

  return (
    <ActionsContext.Provider
      value={{ isSearchOpen, toggleSearch, playersMap, messages, getRoom, setMultiplayerConnectionParameters, sendChatMessage }}
    >
      {children}
    </ActionsContext.Provider>
  )
}
