'use client'

import * as React from 'react'
import { toast } from "sonner"
import dedent from 'dedent'
import { NetworkRealms } from '@upstreet/multiplayer/public/network-realms.mjs';
import {getAudioContext} from '@upstreet/chat/utils/audio/audio-context.js';
import { multiplayerEndpointUrl } from '@/utils/const/endpoints';

import { audioOutputStreamFactory, createOpusAudioOutputStream } from '@upstreet/chat/utils/audio/audio-client.mjs';
import { createAudioManager } from '@upstreet/chat/utils/audio/audio-manager';

import { QueuedAudioManager } from '@upstreet/chat/utils/audio/queued-audio-manager';


// import {AudioManager} from "@upstreet/chat/utils/audio/audio-manager";


interface MultiplayerActionsContextType {
  getRoom: () => string
  localPlayerSpec: PlayerSpec
  playersMap: Map<string, Player>
  playersCache: Map<string, Player>
  messages: object[]
  setMultiplayerConnectionParameters: (params: { room: string, localPlayerSpec: PlayerSpec }) => void
  sendRawMessage: (method: string, args: object) => void
  sendChatMessage: (text: string) => void
  epoch: number
  skipAudioMessage: (streamId: string) => void
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

  const audioContext = getAudioContext();
  const audioManager = createAudioManager({
    audioContext,
  });

  
  var outputAudioStreams = new Map();

  const ensureAudioStream = (playerId: any, streamId: any, audioContext: any, mimeType: any) => {
    if (typeof window === "undefined") return;
  
    const key = `${playerId}:${streamId}`;

    console.log("ensureAudioStream key: ",key)
    let audioStream = outputAudioStreams.get(key);
  
    if (!audioStream) {
      const createAudioOutputStream = audioOutputStreamFactory(mimeType);
      const stream = createAudioOutputStream({ audioContext });
      console.log('stream: ', stream);
      outputAudioStreams.set(key, stream);
      console.log("outputAudioStreams set: ", outputAudioStreams.keys());
      audioStream = stream;
      const audioManagerInput = audioManager.getInput();
      stream.outputNode.connect(audioManagerInput);
    }
  
    return {
      ...audioStream,
      streamId,
      playerId,
    };
  };


  const createAgentAudioSonner = (event: any) => {
    toast("Agent Voice Audio is Playing", {
      description: "",
      action: {
        label: "Skip Audio",
        onClick: () => {
          const queuedAudioManager = event.data;
          queuedAudioManager.skipAudioStream();
        },
      },
      dismissible: false,
      duration: Infinity,
    })
  };

  const clearAgentAudioSonner = (event: any) => {
    console.log("dismissing toast");
    toast.dismiss();
  };

  const queuedAudioManager = new QueuedAudioManager(audioContext, ensureAudioStream, createAgentAudioSonner,clearAgentAudioSonner);

  // let stream;

  // audioManager.waitForLoad().then( 
  //   (_ : any) => {

  //     console.log("load completed");
  //     stream = createMp3AudioOutputStream({
  //       audioContext,
  //   });
  //   }
  // );


  console.log("audioContext: ",audioContext);
  console.log("audioManager: ",audioManager);

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
  realms.addEventListener('audioskip', (e: any) => {

    const {
      playerId,
      streamId,
    } = e.data;

    skipAudioStream();
  })

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

   

  const closeAudioStream = (playerId: any, streamId: any) => {
    const key = `${playerId}:${streamId}`;
    const audioStream = outputAudioStreams.get(key);
    if (audioStream) {
      audioStream.end();
      audioStream.outputNode.addEventListener('finish', () => {
        outputAudioStreams.delete(key);
        // console.log("closeAudioStream | disconnecting ");
        audioStream.outputNode.disconnect();
        // console.log('audioStream outputNode: ', audioStream.outputNode);
        audioStream.outputNode.port.onmessage = null;
  
        audioStream.outputNode = null;

        // console.log('audioStream outputNode x2: ', audioStream.outputNode);


        // // disable avatar audio processing when there is no audio to process
        // const playerAudioStreams = getAudioStreamsForPlayer(playerId).length;
        // if (playerAudioStreams.length === 0) {
        //   remotePlayer.avatar.setAudioEnabled({
        //     audioContext: null,
        //   });
        // }

      }, {
        once: true,
      });
    }
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
        case 'join': {
        }
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

    virtualPlayers.addEventListener('audio', (e: any) => {
      const {
        playerId,
        streamId,
        data,
        mimeType,
      } = e.data;

      const audioEvent = { playerId, streamId, data, mimeType };
      queuedAudioManager.enqueue(audioEvent);
    })

    virtualPlayers.addEventListener('audio', (e: any) => {
      // console.log("audio event received from agent, render chat message");
      const {
        streamId
      } = e.data;


      realms.dispatchEvent(new MessageEvent('startmessagerender', {
        data: streamId,
      }));
    });

    virtualPlayers.addEventListener('audioend', (e: any) => {
      // console.log("audio event received from agent, render chat message");
      realms.dispatchEvent(new MessageEvent('endmessagerender'));
    });

    virtualPlayers.addEventListener('audioend', (e: any) => {
      const {
        playerId,
        streamId,
      } = e.data;
      
      
      // closeAudioStream(playerId,streamId);
      const key = `${playerId}:${streamId}`;
      queuedAudioManager.handleAudioEnd(streamId);
      outputAudioStreams.delete(key);
    })

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

export function MultiplayerActionsProvider({ children }: MultiplayerActionsProviderProps) {
  const [epoch, setEpoch] = React.useState(0);
  const [multiplayerState, setMultiplayerState] = React.useState(() => {
    let room = '';
    let realms: NetworkRealms | null = null;
    let localPlayerSpec: PlayerSpec = {
      id: '',
      name: '',
      previewUrl: '',
      capabilities: [],
    };
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
        console.log('send chat message', message);
        realms.sendChatMessage(message);
      } else {
        console.warn('realms not connected');
      }
    };

    const sendAudioSkipMessage = (streamId: any) => {
      console.log("audio skip message initiated");
      if (realms){
        realms.sendSkipAudioMessage(streamId);
      }
    }

    const multiplayerState = {
      getRoom: () => room,
      getLocalPlayerSpec: () => localPlayerSpec,
      getPlayersMap: () => playersMap,
      getPlayersCache: () => playersCache,
      getMessages: () => messages,
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

        var renderAgentMessage = false;

        if (room !== newRoom) {
          room = newRoom;
          if (realms) {
            realms.disconnect();
            realms = null;
          }

          // latch new state
          localPlayerSpec = newLocalPlayerSpec;
          messages = [];

          realms = connectMultiplayer(room, newLocalPlayerSpec);
          realms.addEventListener('chat', (e) => {
            const {playerId, message } = (e as any).data;
            messages = [...messages, message];

            if (playerId === localPlayerSpec.id){
              refresh();
            }
          });
          realms.addEventListener('startmessagerender', (_) => {
            if (renderAgentMessage === false){
              renderAgentMessage = true;
              refresh();
            }
          });
          realms.addEventListener('endmessagerender', (_) => {
            renderAgentMessage = false;
          })

          realms.addEventListener('playerschange', (e) => {
            playersMap = (e as any).data;

            // ensure all players are in the players cache
            for (const [playerId, player] of playersMap) {
              playersCache.set(playerId, player);
            }

            refresh();
          });

          refresh();
        }
      },
      sendRawMessage,
      sendChatMessage: (text: string) =>
        sendRawMessage('say', {
          text,
        }),
      sendAudioSkipMessage: (streamId: any) => sendAudioSkipMessage(streamId),
    };
    return multiplayerState;
  });
  const getRoom = multiplayerState.getRoom;
  const localPlayerSpec = multiplayerState.getLocalPlayerSpec();
  const playersMap = multiplayerState.getPlayersMap();
  const playersCache = multiplayerState.getPlayersCache();
  const messages = multiplayerState.getMessages();
  const setMultiplayerConnectionParameters = multiplayerState.setMultiplayerConnectionParameters;
  const sendRawMessage = multiplayerState.sendRawMessage;
  const sendChatMessage = multiplayerState.sendChatMessage;
  const skipAudioMessage = multiplayerState.sendAudioSkipMessage;

  return (
    <MultiplayerActionsContext.Provider
      value={{ getRoom, localPlayerSpec, playersMap, playersCache, messages, setMultiplayerConnectionParameters, sendRawMessage, sendChatMessage, epoch, skipAudioMessage }}
    >
      {children}
    </MultiplayerActionsContext.Provider>
  )
}
