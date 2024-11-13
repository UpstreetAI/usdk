/*
this file contains the universe/meta-world/scenes/multiplayer code.
responsibilities include loading the world on url change.
*/

import * as THREE from 'three';
// import metaversefile from 'metaversefile';
import {NetworkRealms} from '../../multiplayer/public/network-realms.mjs';
import {createOpusMicrophoneSource, createOpusReadableStreamSource, createOpusAudioOutputStream, createMp3DecodeTransformStream} from '../../multiplayer/public/audio/audio-client.mjs';
import {AvatarPose} from '../../mediapipe/avatar-pose.js';
// import WSRTC from 'wsrtc/wsrtc.js';
// import * as Z from 'zjs';

// import {
//   initialPosY,
//   realmSize,
// } from '../constants.js';
// import {
//   playersMapName,
//   appsMapName,
//   actionsMapName,
//   // partyMapName,
// } from '../network-schema/constants.js';
// import {loadOverworld} from './overworld.js';
// import physxWorkerManager from './physics/physx-worker-manager.js';
// import {playersManager} from './players-manager.js';
// import {
//   PlayersManager,
// } from './players-manager.js';
// import {makeId, parseQuery} from '../util.js';
// import {
//   getSceneJson,
// } from './realm-utils.js';
// import voiceInput from './voice-input/voice-input.js';
// import {world} from './world.js';
// import {scenesBaseUrl, defaultSceneName} from '../endpoints.js';
// import {
//   SpawnManager,
// } from './spawn-manager.js';
// import {
//   SceneContextManager,
// } from '../scene-manager.js';
import {
  App,
} from '../../app-runtime/app.js';
import {
  AppManager,
} from '../app-manager.js';
// import {rootScene} from './renderer.js';
// import physx from './physics/physx.js';

// const localVector = new THREE.Vector3();
// const zeroVector = new THREE.Vector3(0, 0, 0);
const localTransformAndTimestamp = new Float32Array(11);
const localAvatarPoseBuffer = new Uint8Array(AvatarPose.serializedSize);

//

// const actionsPrefix = 'actions.';
// const appsPrefix = 'apps.';
// const worldAppsKey = 'worldApps';

//

const getAppJson = app => {
  const transformAndTimestamp = new Float32Array(11);
  app.position.toArray(transformAndTimestamp, 0);
  app.quaternion.toArray(transformAndTimestamp, 3);
  app.scale.toArray(transformAndTimestamp, 7);
  transformAndTimestamp[10] = 0; // timestamp needs to be set by the caller

  return {
    instanceId: app.instanceId,
    start_url: app.start_url,
    transform: transformAndTimestamp,
    components: structuredClone(app.components),
  };
}

//

class ActionCache {
  constructor() {
    this.actions = [];
  }
  push(action) {
    this.actions.push(action);
  }
  flush() {
    const actions = this.actions;
    this.actions = [];
    return actions;
  }
}

//

class AppEntityBinder {
  #appToEntity = new Map();
  #entityToApp = new Map();
  #entityIdToApp = new Map();

  getApp(entity) {
    return this.#entityToApp.get(entity);
  }
  getAppByEntityId(entityId) {
    return this.#entityIdToApp.get(entityId);
  }
  getEntity(app) {
    return this.#appToEntity.get(app);
  }

  bindAppEntity(app, entity) {
    // console.log('bind', {
    //   app,
    //   entity,
    // });
    this.#appToEntity.set(app, entity);
    this.#entityToApp.set(entity, app);
    this.#entityIdToApp.set(entity.arrayIndexId, app);
  }
  unbindAppEntity(app) {
    const entity = this.#appToEntity.get(app);
    // console.log('unbind', {
    //   app,
    //   entity,
    // });
    if (entity) {
      this.#appToEntity.delete(app);
      this.#entityToApp.delete(entity);
      this.#entityIdToApp.delete(entity.arrayIndexId);
    } else {
      throw new Error('no entity for app');
    }
  }
}

//

class Tracker {
  constructor({
    getKeySpec,
    realms,
  }) {
    this.getKeySpec = getKeySpec;
    this.realms = realms;

    this.running = false;
    this.lastRootRealmKey = '';
    this.frame = null;

    this.start();
  }

  start() {
    const recurse = async () => {
      this.frame = requestAnimationFrame(recurse);

      this.running = true;

      try {
        const keySpec = this.getKeySpec();
        const {
          realmsKeys,
          rootRealmKey,
        } = keySpec;

        if (rootRealmKey !== this.lastRootRealmKey) {
          this.lastRootRealmKey = rootRealmKey;

          await this.realms.updateRealmsKeys({
            realmsKeys,
            rootRealmKey,
          });
        }
      } finally {
        this.running = false;
      }
    };
    this.frame = requestAnimationFrame(recurse);
  }
  stop() {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
      this.frame = null;
    }
  }
}

//

export class Multiplayer extends THREE.Object3D {
  constructor({
    playersManager,
    spawnManager,
    engine,
    characterSelectManager,
    audioManager,
    embodimentManager,
    physicsTracker,
    importManager,
    appContextFactory,
    roomId,
  }) {
    super();

    // members
    if (!playersManager || !spawnManager || !engine || !characterSelectManager || !audioManager || !embodimentManager || !physicsTracker || !importManager || !appContextFactory) {
      console.warn('invalid args', {
        playersManager,
        spawnManager,
        engine,
        characterSelectManager,
        audioManager,
        embodimentManager,
        physicsTracker,
        importManager,
        appContextFactory,
      });
      debugger;
    }
    this.playersManager = playersManager;
    this.spawnManager = spawnManager;
    this.engine = engine;
    this.characterSelectManager = characterSelectManager;
    this.audioManager = audioManager;
    this.embodimentManager = embodimentManager;
    this.physicsTracker = physicsTracker;
    this.importManager = importManager;
    this.appContextFactory = appContextFactory;
    this.roomId = roomId;

    // locals
    this.appManager = new AppManager({
      importManager,
      appContextFactory,
    });
    this.appManager.name = 'multiplayer';
    this.add(this.appManager);
    this.appManager.updateMatrixWorld();

    this.multiplayerEnabled = false;
    this.multiplayerConnected = false;
    this.realms = null;
    this.playersMap = new Map();
    this.cleanupFns = [];
  }

  /* async setRealmSpec(realmSpec) {
    if (this.multiplayerEnabled) {
      console.warn('multiplayer already connected');
      debugger;
      this.disconnectMultiplayer();
    }
    const {room} = realmSpec;

    this.multiplayerEnabled = room !== undefined;
    if (this.multiplayerEnabled) {
      await this.connectMultiplayer(realmSpec);
    }
  } */

  // Called by enterWorld() when a player enables multi-player.
  async connectMultiplayer(realmSpec) {
    const {
      endpoint_url,
      room,

      // start_url,
      // type,
      // content,
    } = realmSpec;
    
    // Set up the network realms.
    const localPlayer = this.playersManager.getLocalPlayer();
    this.realms = new NetworkRealms({
      endpointUrl: endpoint_url,
      playerId: localPlayer.playerId,
      audioManager: this.audioManager,
    });
    // await this.realms.initAudioContext();
    this.multiplayerConnected = true;
    this.realms.addEventListener('chat', e => {
      this.dispatchEvent({
        type: 'chat',
        ...e.data,
      });
    });
    this.realms.addEventListener('disconnect', e => {
      // console.log('realms emitted disconnect');

      this.multiplayerConnected = false;
      for (const cleanupFn of this.cleanupFns) {
        cleanupFn();
      }
      this.cleanupFns = [];

      this.dispatchEvent({
        type: 'disconnect',
      });
    });

    const virtualWorld = this.realms.getVirtualWorld();
    const virtualPlayers = this.realms.getVirtualPlayers();

    // Initiate network realms connection.
    const onConnect = async (e) => {
      e.waitUntil((async () => {
        const realmKey = e.data.rootRealmKey;

        const {voiceInput} = this.embodimentManager;
        const {audioManager} = voiceInput;
        const {audioContext} = audioManager;
        
        // microphone connection
        let microphoneSource = null;

        // Initialize network realms player.
        const _pushInitialPlayer = () => {
          this.realms.localPlayer.initializePlayer({
            realmKey,
          }, {});
          const transformAndTimestamp = localTransformAndTimestamp;
          localPlayer.position.toArray(transformAndTimestamp, 0);
          localPlayer.quaternion.toArray(transformAndTimestamp, 3);
          localPlayer.scale.toArray(transformAndTimestamp, 7);
          const now = performance.now();
          transformAndTimestamp[10] = now;
          this.realms.localPlayer.setKeyValue('transform', transformAndTimestamp);
          this.realms.localPlayer.setKeyValue('velocity', [0, 0, 0, 0]);
          const avatarPoseBuffer = localPlayer.avatarPose ?
            localPlayer.avatarPose.serialize(localAvatarPoseBuffer)
          :
            null;
          this.realms.localPlayer.setKeyValue('avatarPose', avatarPoseBuffer);
          // this.realms.localPlayer.setKeyValue('voiceSpec', localPlayer.playerMap.get('voiceSpec'));
        };
        _pushInitialPlayer();

        const _connectLocalPlayerAppManager = () => {
          const onAppTransplant = e => {
            console.log('player app transplant', e);
            const {
              app,
              oldAppManager,
              newAppManager,
            } = e.data;
            if (newAppManager === this.appManager) {
              const appJson = getAppJson(app);

              const headRealm = this.realms.getClosestRealm(realmKey);
              console.log('transplant B 1', appJson.instanceId, appJson.components, appJson);
              virtualWorld.worldApps.addEntityAt(
                appJson.instanceId,
                appJson,
                headRealm
              );
              console.log('transplant B 2');
              this.realms.localPlayer.playerApps.removeEntityAt(appJson.instanceId);
              console.log('transplant B 3');
            } else {
              console.warn('transplanting from local player app manager to non-multiplayer world app manager', {
                app,
                oldAppManager,
                newAppManager,
              });
              // debugger;
            }
          };
          localPlayer.appManager.addEventListener('apptransplant', onAppTransplant);
          this.cleanupFns.push(() => {
            localPlayer.appManager.removeEventListener('apptransplant', onAppTransplant);
          });
        };
        _connectLocalPlayerAppManager();

        // // Avatar model.
        // const apps = localPlayer.playerMap.get(appsMapName);
        // const appsArray = Array.from(apps);
        // const avatarInstanceId = localPlayer.getAvatarInstanceId();
        // const avatarApp = appsArray.find(app => app.get('instanceId') === avatarInstanceId);
        // const components = {
        //   contentId: avatarApp.get('contentId'),
        //   instanceId: avatarInstanceId,
        // };
        // this.realms.localPlayer.setKeyValue(this.appsPrefix + avatarInstanceId, components);
        // this.realms.localPlayer.setKeyValue('avatar', avatarInstanceId);

        // Mic state.
        const _connectLocalPlayerMic = () => {
          const _connectMicMediaStream = () => {
            if (!microphoneSource) {
              const {mediaStream} = voiceInput;
              microphoneSource = createOpusMicrophoneSource({
                mediaStream,
                audioContext,
              });
              this.realms.addAudioSource(microphoneSource);
            }
          };
          const _disconnectMicMediaStream = () => {
            if (microphoneSource) {
              this.realms.removeAudioSource(microphoneSource);
              microphoneSource.close();
              microphoneSource = null;
            }
          };

          const micEnabled = voiceInput.micEnabled();
          if (micEnabled) {
            _connectMicMediaStream();
          }
          const onMicChange = e => {
            const micEnabled = voiceInput.micEnabled();
            if (micEnabled) {
              _connectMicMediaStream();
            } else if (!micEnabled) {
              _disconnectMicMediaStream();
            }
          };
          voiceInput.addEventListener('micchange', onMicChange);
          this.cleanupFns.push(() => {
            voiceInput.removeEventListener('micchange', onMicChange);
          });
        };
        _connectLocalPlayerMic();

        const _connectChatStream = () => {
          const handleChatStream = async (e) => {
            const {
              stream: readableStream,
            } = e.data;

            const audioSource = createOpusReadableStreamSource({
              readableStream,
              // audioContext,
            });
            this.realms.addAudioSource(audioSource);

            audioSource.output.addEventListener('end', e => {
              this.realms.removeAudioSource(audioSource);
            });
          };
          this.embodimentManager.addEventListener('chatstream', handleChatStream);
          this.cleanupFns.push(() => {
            this.embodimentManager.removeEventListener('chatstream', handleChatStream);
          });
        };
        _connectChatStream();

        const _connectSpeechStream = () => {
          const handleSpeechStream = async (e) => {
            const {
              stream: readableStream,
            } = e.data;

            const audioSource = createOpusReadableStreamSource({
              readableStream,
              // audioContext,
            });
            this.realms.addAudioSource(audioSource);

            audioSource.output.addEventListener('end', e => {
              this.realms.removeAudioSource(audioSource);
            });
          };
          this.embodimentManager.addEventListener('speechstream', handleSpeechStream);
          this.cleanupFns.push(() => {
            this.embodimentManager.removeEventListener('speechstream', handleSpeechStream);
          });
        };
        _connectSpeechStream();

        const _connectRvcStream = () => {
          const handleRvcStream = async (e) => {
            const {
              stream: readableStream,
            } = e.data;

            const audioSource = createOpusReadableStreamSource({
              readableStream,
              // audioContext,
            });
            this.realms.addAudioSource(audioSource);

            audioSource.output.addEventListener('end', e => {
              this.realms.removeAudioSource(audioSource);
            });
          };
          this.embodimentManager.addEventListener('rvcstream', handleRvcStream);
          this.cleanupFns.push(() => {
            this.embodimentManager.removeEventListener('rvcstream', handleRvcStream);
          });
        };
        _connectRvcStream();

        /* // Load the scene.
        // First player loads scene from src.
        // Second and subsequent players load scene from network realms.
        // TODO: Won't need to load the scene once the multiplayer-do state is used instead of the current Z state.
        if (virtualWorld.worldApps.getSize() === 0) {
          await metaversefile.createAppAsync({
            start_url: src,
          });
        } */

        const _trackLocalPlayer = () => {
          const actionCache = new ActionCache();

          const _trackFrameLoop = () => {
            const _recurse = () => {
              frame = requestAnimationFrame(_recurse);
      
              const _pushLocalPlayerUpdate = () => {
                // timestamp
                const now = performance.now();
                this.realms.localPlayer.setKeyValue('timestamp', now);

                // transform
                const {position, quaternion, scale} = localPlayer;
                const transformAndTimestamp = localTransformAndTimestamp;
                position.toArray(transformAndTimestamp, 0);
                quaternion.toArray(transformAndTimestamp, 3);
                scale.toArray(transformAndTimestamp, 7);
                transformAndTimestamp[10] = now;
                this.realms.localPlayer.setKeyValue('transform', transformAndTimestamp);
                
                // velocity
                const velocity = new Float32Array(4);
                localPlayer.velocity.toArray(velocity);
                velocity[3] = now;
                this.realms.localPlayer.setKeyValue('velocity', velocity);

                // actions
                const actionCacheSpecs = actionCache.flush();
                for (let i = 0; i < actionCacheSpecs.length; i++) {
                  const actionCacheSpec = actionCacheSpecs[i];
                  const {
                    actionId,
                    action,
                    timestamp,
                  } = actionCacheSpec;
                  if (action) {
                    const headRealm = this.realms.localPlayer.headTracker.getHeadRealm();
                    this.realms.localPlayer.playerActions.addEntityAt(
                      actionId,
                      {
                        action,
                        timestamp,
                      },
                      headRealm
                    );
                  } else {
                    this.realms.localPlayer.playerActions.removeEntityAt(
                      actionId,
                    );
                  }
                }

                // avatar pose
                const avatarPoseBuffer = localPlayer.avatarPose ?
                  localPlayer.avatarPose.serialize(localAvatarPoseBuffer)
                :
                  null;
                this.realms.localPlayer.setKeyValue('avatarPose', avatarPoseBuffer);
              };
              _pushLocalPlayerUpdate();
            };
            let frame = requestAnimationFrame(_recurse);
            this.cleanupFns.push(() => {
              cancelAnimationFrame(frame);
            });
          };
          _trackFrameLoop();

          const _trackActionManager = () => {
            const actionadded = e => {
              const {action} = e.data;
              const timestamp = performance.now();
              actionCache.push({
                actionId: action.actionId,
                action,
                timestamp,
              });
            };
            localPlayer.actionManager.addEventListener('actionadded', actionadded);
            this.cleanupFns.push(() => {
              localPlayer.actionManager.removeEventListener('actionadded', actionadded);
            });
            const actionremoved = e => {
              const {action} = e.data;
              const timestamp = performance.now();
              actionCache.push({
                actionId: action.actionId,
                action: null,
                timestamp,
              });
            };
            localPlayer.actionManager.addEventListener('actionremoved', actionremoved);
            this.cleanupFns.push(() => {
              localPlayer.actionManager.removeEventListener('actionremoved', actionremoved);
            });
          };
          _trackActionManager();

          const _pushInitialActions = () => {
            const actionsArray = localPlayer.actionManager.getActionsArray();
            const timestamp = performance.now();
            for (const action of actionsArray) {
              actionCache.push({
                actionId: action.actionId,
                action,
                timestamp,
              });
            }
          };
          _pushInitialActions();

          const _initializeAvatar = async () => {
            this.realms.localPlayer.setKeyValue('playerSpec', localPlayer.playerSpec);
          };
          _initializeAvatar();

          const _bindAvatarUpdate = async () => {
            const playerspecupdate = e => {
              const {
                playerSpec,
              } = e;
              this.realms.localPlayer.setKeyValue('playerSpec', playerSpec);
            };
            localPlayer.addEventListener('playerspecupdate', playerspecupdate);
          
            this.cleanupFns.push(() => {
              localPlayer.removeEventListener('playerspecupdate', playerspecupdate);
            });
          };
          _bindAvatarUpdate();
        };
        _trackLocalPlayer();

        const appEntityBinder = new AppEntityBinder();
        const _trackWorld = async () => {
          const _listenWorldEvents = () => {
            // Handle scene updates from network realms.
            const onWorldAppEntityAdd = e => {
              console.log('remote world entity add', e.data);

              const {entityId} = e.data;

              this.appManager.tx(() => {
                const needledEntity = virtualWorld.worldApps.getVirtualMap(entityId);
                const object = needledEntity.toObject();
                const {
                  start_url,
                  instanceId,
                  transform,
                  components,
                } = object;

                const app = new App();
                appEntityBinder.bindAppEntity(app, needledEntity);

                const position = new THREE.Vector3().fromArray(transform, 0);
                const quaternion = new THREE.Quaternion().fromArray(transform, 3);
                const scale = new THREE.Vector3().fromArray(transform, 7);

                this.appManager.addAppAsync({
                  start_url,
                  instanceId,
                  app,
                  position,
                  quaternion,
                  scale,
                  components,
                });
              });
            };
            this.realms.addEventListener('entityadd', onWorldAppEntityAdd);
            const onWorldAppEntityRemove = e => {
              console.log('remote world entity remove', e.data);

              const {entityId} = e.data;
              const app = appEntityBinder.getAppByEntityId(entityId);
              appEntityBinder.unbindAppEntity(app);
              const appManager = app.parent;
              appManager.tx(() => {
                appManager.removeApp(app);
              });
            };
            this.realms.addEventListener('entityremove', onWorldAppEntityRemove);

            // Update app managers and client app per remote player app transplants.
            const onWorldAppEntityTransplant = e => {
              const {arrayId, entityId, realm} = e.data;
              const [targetAppManagerId, targetPlayerId] = arrayId.split(':');
              const appId = entityId;

              const app = appEntityBinder.getAppByEntityId(entityId);
              const sourceAppManager = app.parent;

              let targetAppManager = null;
              switch (targetAppManagerId) {
                case 'playerApps':
                  if (targetPlayerId === localPlayer.playerId) {
                    targetAppManager = localPlayer.appManager;
                  } else {
                    targetAppManager = this.playersManager.getRemotePlayer(targetPlayerId).appManager;
                  }
                  break;
                case 'worldApps':
                  targetAppManager = this.appManager;
                  break;
                default:
                  debugger;
              }

              if (sourceAppManager && targetAppManager) {
                if (sourceAppManager !== targetAppManager) {
                  console.log('world app entity transplant');
                  // App not already transplanted by local player.
                  targetAppManager.apps.set(app.instanceId, app);
                  targetAppManager.add(app);

                  if (targetAppManager === this.appManager) {
                    // App dropped into the world. Store the target drop position for unwearing.
                    const crdtData = realm.dataClient.crdt.get(`${arrayId}:${appId}`);
                    const transform = crdtData[1].transform[1];
                    app.drop = {
                      dropStartPosition: new THREE.Vector3().fromArray(transform, 0),
                      dropDirection: new THREE.Vector3(0, 0, -1)
                        .applyQuaternion(new THREE.Quaternion().fromArray(transform, 3)),
                    }
                  }

                  sourceAppManager.apps.delete(app.instanceId);
                  sourceAppManager.remove(app);
                }
              } else {
                debugger;
              }
            }
            this.realms.addEventListener('entitytransplant', onWorldAppEntityTransplant);

            this.appManager.addEventListener('apptransplant', e => {
              console.log('world app transplant', e);
              const {
                app,
                oldAppManager,
                newAppManager,
              } = e.data;
              if (newAppManager === localPlayer.appManager) {
                const appJson = getAppJson(app);

                const headRealm = this.realms.getClosestRealm(realmKey);
                console.log('transplant A 1', appJson.instanceId, appJson.components, appJson);
                this.realms.localPlayer.playerApps.addEntityAt(
                  appJson.instanceId,
                  appJson,
                  headRealm
                );
                console.log('transplant A 2');
                virtualWorld.worldApps.removeEntityAt(appJson.instanceId);
                console.log('transplant A 3');
              } else {
                console.warn('transplanting from world to non-local player', {
                  app,
                  oldAppManager,
                  newAppManager,
                });
                debugger;
              }
            });
          };
          _listenWorldEvents();

          const _bindAppManager = () => {
            const addRemoteApp = e => {
              const {
                app,
                start_url,
                position,
                quaternion,
                scale,
                components,
                instanceId,
              } = e;

              const transform = new Float32Array(11);
              position.toArray(transform, 0);
              quaternion.toArray(transform, 3);
              scale.toArray(transform, 7);
              const now = performance.now();
              transform[10] = now;
              const appJson = {
                start_url,
                instanceId,
                transform,
                components,
              }
              // console.log('add app json', appJson);

              const headRealm = this.realms.getClosestRealm(realmKey);
              let newRemoteApp;
              this.realms.tx(() => {
                newRemoteApp = virtualWorld.worldApps.addEntityAt(
                  appJson.instanceId,
                  appJson,
                  headRealm,
                );
              });
              const newEntity = virtualWorld.worldApps.getMapEntity(newRemoteApp);
              appEntityBinder.bindAppEntity(app, newEntity);
            };
            const removeRemoteApp = e => {
              const {app} = e;
              const entity = appEntityBinder.getEntity(app);
              if (!entity) {
                debugger;
              }
              
              this.realms.tx(() => {
                virtualWorld.worldApps.removeEntityAt(entity.arrayIndexId);
              });
              
              appEntityBinder.unbindAppEntity(app);
            };
            const _pushInitialAppManagerApps = () => {
              for (const app of this.appManager.getApps()) {
                console.log('push initial app', app);
                addRemoteApp({
                  app,
                  start_url: app.start_url,
                  position: app.position,
                  quaternion: app.quaternion,
                  scale: app.scale,
                  components: app.components,
                  instanceId: app.instanceId,
                });
              }
            };
            _pushInitialAppManagerApps();

            // listen for add/remove
            this.appManager.onBeforeAppAdd = (e) => {
              console.log('local app manager multiplayer add', e);
              addRemoteApp(e);
            };
            this.appManager.onBeforeAppRemove = (e) => {
              console.log('local app manager multiplayer remove', e);
              removeRemoteApp(e);
            };
          };
          _bindAppManager();

          const _loadApps = async () => {
            const existingApps = virtualWorld.worldApps.needledVirtualEntities;
            if (existingApps.size === 0) {
              // console.log('no world apps so initializing app manager', existingApps, virtualWorld);

              // const j = await getSceneJson(realmSpec);
              // await this.appManager.loadScnFromJson(j);
              // this.sceneContextManager.setSceneContext(j);

              let promise = Promise.resolve();
              const e = {
                type: 'init',
                waitUntil(p) {
                  promise = p;
                },
              };
              this.dispatchEvent(e);

              await promise;
            } else {
              console.log('had world apps so not initializing app manager', existingApps, virtualWorld);

              const appLoadPromises = [];
              this.appManager.tx(() => {
                const existingNeedledEntities = Array.from(existingApps.values());
                for (const needledEntity of existingNeedledEntities) {
                  const object = needledEntity.toObject();
                  const {
                    start_url,
                    instanceId,
                    transform,
                    components,
                  } = object;
                  
                  const app = new App();
                  appEntityBinder.bindAppEntity(app, needledEntity);

                  const _loadLocalApp = async () => {
                    const position = new THREE.Vector3().fromArray(transform, 0);
                    const quaternion = new THREE.Quaternion().fromArray(transform, 3);
                    const scale = new THREE.Vector3().fromArray(transform, 7);
                    const timestamp = transform[10];

                    await this.appManager.addAppAsync({
                      start_url,
                      instanceId,
                      app,
                      position,
                      quaternion,
                      scale,
                      components,
                      // position = new THREE.Vector3(),
                      // quaternion = new THREE.Quaternion(),
                      // scale = new THREE.Vector3(1, 1, 1),
                      // components = [],
                      // instanceId = getRandomString(),
                    });
                  };
                  const p = _loadLocalApp();
                  appLoadPromises.push(p);
                }
              });
              await Promise.all(appLoadPromises);
            }
          };
          await _loadApps();
        };
        await _trackWorld();
      })());
    };
    this.realms.addEventListener('connect', onConnect);

    const _trackRemotePlayers = () => {
      virtualPlayers.addEventListener('join', e => {
        const {playerId, player} = e.data;
        console.log('Player joined:', playerId, player, e.data);

        const remotePlayer = this.playersManager.addRemotePlayer({
          playerId,
        });
        this.playersMap.set(playerId, remotePlayer);

        // apply initial remote player state
        {
          const transform = player.getKeyValue('transform');
          if (transform) {
            remotePlayer.setRemoteTransform(transform);
          }

          const playerSpec = player.getKeyValue('playerSpec');
          if (playerSpec) {
            remotePlayer.setPlayerSpec(playerSpec);
          }
        }

        const _addRemotePlayerActionLocally = (key, action, remoteTimestamp) => {
          const actionId = key;
          const localToRemoteTimestampBias = remotePlayer.getLocalToRemoteTimestampBias();
          const timestamp = remoteTimestamp - localToRemoteTimestampBias;

          if (action !== null) {
            remotePlayer.actionInterpolant.pushAction({
              actionId,
              action,
            }, timestamp);
          } else {
            remotePlayer.actionInterpolant.pushAction({
              actionId,
              action: null,
            }, timestamp);
          }
        };
        const _removeRemotePlayerActionLocally = (key, remoteTimestamp) => {
          // const actionId = key.slice(actionsPrefix.length);
          const actionId = key;
          const localToRemoteTimestampBias = remotePlayer.getLocalToRemoteTimestampBias();
          const timestamp = remoteTimestamp - localToRemoteTimestampBias;
          remotePlayer.actionInterpolant.pushAction({
            actionId,
            action: null,
          }, timestamp);
        };

        // initialize actions
        {
          const keys = player.playerActions.getKeys();
          for (const key of keys) {
            const map = player.playerActions.getVirtualMap(key);
            const {
              action,
              timestamp,
            } = map.toObject();
            /* console.log('initialize actions', {
              key,
              action,
            }); */
            _addRemotePlayerActionLocally(key, action, timestamp);
          }
        }

        // Handle remote player state updates
        player.addEventListener('update', e => {
          const {key, val} = e.data;

          this.dispatchEvent({
            type: 'remotePlayerUpdate',
            key,
            value: val,
          });

          if (key === 'playerSpec') {
            remotePlayer.setPlayerSpec(val);
          } else if (key === 'timestamp') {
            const remoteTimestamp = val;
            const localTimestamp = performance.now();
            remotePlayer.setRemoteTimestampBias(localTimestamp, remoteTimestamp);
          } else if (key === 'transform') {
            // playersArray.doc.transact(() => {
              // playerMap.set('transform', val);
              remotePlayer.setRemoteTransform(val);
            // });
          } else if (key === 'velocity') {
            // playersArray.doc.transact(() => {
              // playerMap.set('velocity', val);
              remotePlayer.setRemoteVelocity(val);
            // });
          } else if (key === 'avatarPose') {
            // playersArray.doc.transact(() => {
              // playerMap.set('transform', val);
              if (val) {
                const avatarPose = remotePlayer.getAvatarPose() ?? new AvatarPose();
                avatarPose.deserialize(val);
                remotePlayer.setAvatarPose(avatarPose);
              } else {
                remotePlayer.setAvatarPose(null);
              }
            // });
          } else if (key === 'avatar') {
            // Set new avatar instanceId.
            // playersArray.doc.transact(() => {
              console.log('got avatar change', val);
              // playerMap.set('avatar', val);
            // });
          } else {
            console.warn('unknown player update key', key, val);
          } /* else if (key.startsWith(actionsPrefix)) {
            // console.log('got action update', key, val);

            _addRemotePlayerActionLocally(key, val);
          } */
        });

        // Handle remote player action updates
        const entityadd = e => {
          const {
            entityId,
            needledEntity,
          } = e.data;
          const {
            action,
            timestamp,
          } = needledEntity.toObject();

          const localToRemoteTimestampBias = remotePlayer.getLocalToRemoteTimestampBias();
          const timestamp2 = timestamp + localToRemoteTimestampBias;
          _addRemotePlayerActionLocally(entityId, action, timestamp2);
        };
        player.playerActions.addEventListener('needledentityadd', entityadd);
        const entityremove = e => {
          const {
            entityId,
          } = e.data;

          const timestamp = performance.now();
          const localToRemoteTimestampBias = remotePlayer.getLocalToRemoteTimestampBias();
          const timestamp2 = timestamp + localToRemoteTimestampBias;
          _removeRemotePlayerActionLocally(entityId, timestamp2);
        };
        player.playerActions.addEventListener('needledentityremove', entityremove);

        /* const _trackActionManager = () => {
          const _actionadded = e => {
            const {action} = e.data;
            if (action.type === 'wear') {
              // console.log('apply wear on remote player');
              const app = remotePlayer.appManager.getAppByInstanceId(action.instanceId);
              remotePlayer.applyWear(app, {
                loadoutIndex: action.loadoutIndex
              });
            }
          };
          remotePlayer.actionManager.addEventListener('actionadded', _actionadded);
          const _actionremoved = e => {
            const {action} = e.data;
            if (action.type === 'wear') {
              // console.log('unapply wear on remote player');
              const app = this.appManager.getAppByInstanceId(action.instanceId);
              if (app) {
                remotePlayer.unapplyWear(app, {
                  loadoutIndex: action.loadoutIndex,
                  dropStartPosition: app.drop.dropStartPosition,
                  dropDirection: app.drop.dropDirection,
                });
                delete app.drop;
              } else {
                // App doesn't exist if player has left the scene wearing it.
                // console.log('skip unapplying wear for deleted app');
              }
            }
          };
          remotePlayer.actionManager.addEventListener('actionremoved', _actionremoved);
        };
        _trackActionManager(); */

        const _loadRemotePlayerAvatar = async () => {
          // const spec = await this.characterSelectManager.getDefaultSpecAsync();
          await remotePlayer.setPlayerSpec(spec);
        };
        remotePlayer.addEventListener('update',async e => {
          console.log('got player update', e.data);
          debugger;
          await _loadRemotePlayerAvatar();
        });

        this.dispatchEvent({
          type: 'join',
          playerId,
          player: remotePlayer,
        });
      });
      virtualPlayers.addEventListener('leave', e => {
        const {playerId} = e.data;
        console.log('Player left:', playerId);
        const remotePlayer = this.playersMap.get(playerId);
        if (remotePlayer) {
          this.playersManager.removeRemotePlayer(remotePlayer);
          this.playersMap.delete(playerId);
        } else {
          console.warn('remote player not found', playerId);
          debugger;
        }

        closeAudioStreamsForPlayer(playerId);

        this.dispatchEvent({
          type: 'leave',
          playerId,
          player: remotePlayer,
        });
      });

      // Handle audio routes.
      const audioStreams = new Map(); // playerId:streamId => stream
      const getAudioStreamsForPlayer = playerId => {
        const result = [];
        for (const [key, stream] of audioStreams) {
          const [playerId2, streamId] = key.split(':');
          if (playerId2 === playerId) {
            result.push(stream);
          }
        }
        return result;
      };
      virtualPlayers.addEventListener('audio', async e => {
        const {
          playerId,
          streamId,
          data,
        } = e.data;
        
        const audioStream = ensureAudioStream(playerId, streamId);
        audioStream.write(data);
      });
      virtualPlayers.addEventListener('audioend', e => {
        const {
          playerId,
          streamId,
        } = e.data;
        closeAudioStream(playerId, streamId);
      });
      const ensureAudioStream = (playerId, streamId) => {
        const key = `${playerId}:${streamId}`;
        let audioStream = this.outputAudioStreams.get(key);
        if (!audioStream) {
          const {
            audioContext,
          } = this.audioManager;
          const stream = createOpusAudioOutputStream({
            audioContext,
          });
          
          const audioManagerInput = this.audioManager.getInput();
          stream.outputNode.connect(audioManagerInput);
          console.log('connect node', stream.outputNode);

          audioStreams.set(key, stream);
          audioStream = stream;

          // connect to avatar
          (async () => {
            const remotePlayer = this.playersMap.get(playerId);
            if (remotePlayer) {
              await remotePlayer.waitForAvatar();
              // handle the race condition where the audio stream ends before the avatar is loaded
              if (!audioStreams.has(key)) return;

              remotePlayer.avatar.setAudioEnabled({
                audioContext: this.audioManager.audioContext,
              });
              const audioInput = remotePlayer.avatar.getAudioInput();
              stream.outputNode.connect(audioInput);
            } else {
              console.warn('remote player not found', {
                playerId,
                playersMap: this.playersMap,
              });
              debugger;
            }
          })();
        }
        return audioStream;
      };
      const closeAudioStream = (playerId, streamId) => {
        const key = `${playerId}:${streamId}`;
        const audioStream = audioStreams.get(key);
        if (audioStream) {
          audioStreams.delete(key);

          audioStream.end();
          audioStream.outputNode.addEventListener('finish', () => {
            audioStream.outputNode.disconnect();
    
            // disable avatar audio processing when there is no audio to process
            const playerAudioStreams = getAudioStreamsForPlayer(playerId).length;
            if (playerAudioStreams.length === 0) {
              remotePlayer.avatar.setAudioEnabled({
                audioContext: null,
              });
            }
          }, {
            once: true,
          });
        }
      };
      const closeAudioStreamsForPlayer = (playerId) => {
        for (const [key, audioStream] of audioStreams.entries()) {
          const match = key.match(/^([^:]+):([^:]+)$/);
          const [
            pid,
            streamId,
          ] = match;
          if (pid === playerId) {
            closeAudioStream(pid, streamId);
          }
        }
      };
    };
    _trackRemotePlayers();

    if (room) {
      await this.realms.updateRealmsKeys({
        realmsKeys: [room],
        rootRealmKey: room,
      });
    }

    /* // Handle remote players joining and leaving the set of realms.
    // These events are received both upon starting and during multiplayer.
    const virtualPlayers = this.realms.getVirtualPlayers();
    virtualPlayers.addEventListener('join', async e => {
      const {playerId, player} = e.data;
      console.log('Player joined:', playerId);

      const defaultTransform = new Float32Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1]);

      const playersArray = this.state.getArray(playersMapName);
      const playerMap = new Z.Map();
      playersArray.doc.transact(() => {
        playerMap.set('playerId', playerId);

        const appsArray = new Z.Array();
        playerMap.set(appsMapName, appsArray);

        const actionsArray = new Z.Array();
        playerMap.set(actionsMapName, actionsArray);

        playersArray.push([playerMap]);
      });

      const getActionsState = () => {
        let actionsArray = playerMap.has(actionsMapName) ? playerMap.get(actionsMapName, Z.Array) : null;
        if (!actionsArray) {
          actionsArray = new Z.Array();
          playerMap.set(actionsMapName, actionsArray);
        }
        return actionsArray;
      };

      // Handle remote player updates.
      player.addEventListener('update', e => {
        const {key, val} = e.data;

        if (key === 'transform') {
          playersArray.doc.transact(() => {
            playerMap.set('transform', val);
          });
        } else if (key === 'velocity') {
          playersArray.doc.transact(() => {
            playerMap.set('velocity', val);
          });
        } else if (key.startsWith(this.actionsPrefix)) {
          const actionType = key.slice(this.actionsPrefix.length);
          playersArray.doc.transact(() => {
            if (val !== null) {
              // Add action to state.
              getActionsState().push([val]);
              const remotePlayer = metaversefile.getRemotePlayerByPlayerId(playerId);
              if (remotePlayer.avatar) {
                physx.physxWorker.addActionAnimationAvatar(remotePlayer.avatar.animationAvatarPtr, val);
              }
            } else {
              // Remove action from state.
              const actionsState = getActionsState();
              const actionsArray = Array.from(actionsState);
              let i = 0;
              for (const action of actionsState) {
                if (action.type === actionType) {
                  actionsState.delete(i);
                  const remotePlayer = metaversefile.getRemotePlayerByPlayerId(playerId);
                  if (remotePlayer.avatar) {
                    physx.physxWorker.removeActionAnimationAvatar(remotePlayer.avatar.animationAvatarPtr, actionsArray[i]);
                  }
                  break;
                }
                i++;
              }
            }
          });
        } else if (key.startsWith(this.appsPrefix)) {
          playersArray.doc.transact(() => {
            const apps = playerMap.get(appsMapName);

            if (val !== null) {
              // Add app to state.
              apps.push([{
                components: [],
                transform: defaultTransform.slice(),
                ...val,
              }]);
            } else {
              // Remove app from state.
              const appKey = key.slice(this.appsPrefix.length);
              let index = 0;
              for (const app of apps) {
                if (app.get('instanceId') === appKey) {
                  apps.delete(index);
                  break;
                }
                index += 1;
              }
            }
          });
        } else if (key === 'avatar') {
          // Set new avatar instanceId.
          playersArray.doc.transact(() => {
            playerMap.set('avatar', val);
          });
        } else if (key === 'voiceSpec') {
          playersArray.doc.transact(() => {
            playerMap.set('voiceSpec', val);
          });
        }
      });

      // Add this player to player map.
      const transform = player.getKeyValue('transform');
      if (transform) {
        playersArray.doc.transact(() => {
          playerMap.set('transform', transform);
          playerMap.set('velocity', [0, 0, 0]);
        });
      }
      const voiceSpec = player.getKeyValue('voiceSpec');
      if (voiceSpec) {
        playersArray.doc.transact(() => {
          playerMap.set('voiceSpec', voiceSpec);
        });
      }
      const avatar = player.getKeyValue('avatar');
      if (avatar) {
        const avatarApp = player.getKeyValue(this.appsPrefix + avatar);
        if (avatarApp) {
          // Add new avatar app.
          playersArray.doc.transact(() => {
            const apps = playerMap.get(appsMapName);
            apps.push([{
              instanceId: avatar,
              contentId: avatarApp.contentId,
              components: [],
              transform: defaultTransform.slice(),
            }]);
          });
        }
        playersArray.doc.transact(() => {
          // Set new avatar instanceId.
          playerMap.set('avatar', avatar);
        });
      }
    });
    virtualPlayers.addEventListener('leave', e => {
      const {playerId} = e.data;
      console.log('Player left:', playerId);

      const playersArray = this.state.getArray(playersMapName);
      for (let i = 0; i < playersArray.length; i++) {
        const playerMap = playersArray.get(i, Z.Map);
        if (playerMap.get('playerId') === playerId) {
          playersArray.delete(i);
          break;
        }
      }
    });

    // Handle scene updates from network realms.
    // In particular, 'entityadd' events for world apps are received by player 2+ when they join a room.
    const onWorldAppEntityAdd = e => {
      const {arrayId, entityId} = e.data;
      const instanceId = entityId;
      if (arrayId === "worldApps" && !world.appManager.hasTrackedApp(instanceId)) {
        const virtualWorld = this.realms.getVirtualWorld();
        const {contentId, transform, components} = virtualWorld.worldApps.getVirtualMap(instanceId).toObject();
        const appsArray = state.getArray(appsMapName);
        appsArray.doc.transact(() => {
          const appMap = new Z.Map();
          appMap.set('instanceId', instanceId);
          appMap.set('contentId', contentId);
          appMap.set('transform', new Float32Array(transform));
          appMap.set('components', components);
          appsArray.push([appMap]);
        });
      }
    };
    this.realms.addEventListener('entityadd', onWorldAppEntityAdd);
    const onWorldAppEntityRemove = e => {
      // TODO
      console.warn('onWorldAppEntityRemove() not implemented');
    };
    this.realms.addEventListener('entityremove', onWorldAppEntityRemove);

    const onConnect = async position => {
      const localPlayer = this.playersManager.getLocalPlayer();
      const virtualWorld = this.realms.getVirtualWorld();

      // World app initialization.
      // 'trackedappadd' events occur when player 1 loads the scene upon entering multiplayer. These apps are added to the
      // realms for other players to obtain when they join via realms 'entityadd' events.
      // TODO: Won't need this once the multiplayer-do state is used instead of current Z state.
      const onTrackedAppAdd = async e => {
        const {trackedApp} = e.data;
        const {instanceId, contentId, transform, components} = trackedApp.toJSON();
        const position = [...transform].slice(0, 3);
        const realm = this.realms.getClosestRealm(position);
        virtualWorld.worldApps.addEntityAt(instanceId, {instanceId, contentId, transform, components}, realm);
      };
      this.world.appManager.addEventListener('trackedappadd', onTrackedAppAdd);
      this.playerCleanupFns.push(() => {
        this.world.appManager.removeEventListener('trackedappadd', onTrackedAppAdd);
      });

      // Player app changes.
      // TODO: Use realms.localPlayer.playerApps collection instead of key values.
      const onAppAdd = e => {
        const app = e.data;
        const components = app.components.reduce((acc, val) => {
          acc[val.key] = val.value;
          return acc;
        }, {});
        this.realms.localPlayer.setKeyValue(this.appsPrefix + app.instanceId, {
          instanceId: app.instanceId,
          ...components,
        });
      };
      localPlayer.appManager.addEventListener('appadd', onAppAdd);
      this.playerCleanupFns.push(() => {
        localPlayer.appManager.removeEventListener('appadd', onAppAdd);
      });
      const onAppRemove = e => {
        const app = e.data;
        this.realms.localPlayer.setKeyValue(this.appsPrefix + app.instanceId, null);
      };
      localPlayer.appManager.addEventListener('appremove', onAppRemove);
      this.playerCleanupFns.push(() => {
        localPlayer.appManager.removeEventListener('appremove', onAppRemove);
      });

      // Player avatar changes.
      const onAvatarChange = e => {
        this.realms.localPlayer.setKeyValue('avatar', localPlayer.getAvatarInstanceId());
      };
      localPlayer.addEventListener('avatarchange', onAvatarChange);
      this.playerCleanupFns.push(() => {
        localPlayer.appManager.removeEventListener('avatarchange', onAvatarChange);
      });
      const onAvatarUpdate = e => {
        // Nothing to do.
      };
      localPlayer.addEventListener('avatarupdate', onAvatarUpdate);
      this.playerCleanupFns.push(() => {
        localPlayer.appManager.removeEventListener('avatarupdate', onAvatarUpdate);
      });

      // Player action changes.
      // TODO: Use realms.localPlayer.playerActions collection instead of key values.
      const onActionAdd = e => {
        this.realms.localPlayer.setKeyValue(this.actionsPrefix + e.action.type, e.action);
      };
      localPlayer.addEventListener('actionadd', onActionAdd);
      this.playerCleanupFns.push(() => {
        localPlayer.removeEventListener('actionadd', onActionAdd);
      });
      const onActionRemove = e => {
        this.realms.localPlayer.setKeyValue(this.actionsPrefix + e.action.type, null);
      };
      localPlayer.addEventListener('actionremove', onActionRemove);
      this.playerCleanupFns.push(() => {
        localPlayer.removeEventListener('actionremove', onActionRemove);
      });

      // Initialize network realms player.
      this.realms.localPlayer.initializePlayer({
        position,
      }, {});
      const transformAndTimestamp = [...localPlayer.transform, performance.now()];
      this.realms.localPlayer.setKeyValue('transform', transformAndTimestamp);
      this.realms.localPlayer.setKeyValue('voiceSpec', localPlayer.playerMap.get('voiceSpec'));

      // Avatar model.
      const apps = localPlayer.playerMap.get(appsMapName);
      const appsArray = Array.from(apps);
      const avatarInstanceId = localPlayer.getAvatarInstanceId();
      const avatarApp = appsArray.find(app => app.get('instanceId') === avatarInstanceId);
      const components = {
        contentId: avatarApp.get('contentId'),
        instanceId: avatarInstanceId,
      };
      this.realms.localPlayer.setKeyValue(this.appsPrefix + avatarInstanceId, components);
      this.realms.localPlayer.setKeyValue('avatar', avatarInstanceId);

      // Mic state.
      if (voiceInput.micEnabled()) {
        this.realms.enableMic();
      }

      // Load the scene.
      // First player loads scene from src.
      // Second and subsequent players load scene from network realms.
      // TODO: Won't need to load the scene once the multiplayer-do state is used instead of the current Z state.
      if (virtualWorld.worldApps.getSize() === 0) {
        await metaversefile.createAppAsync({
          start_url: src,
        });
      }

      console.log('Multiplayer connected');
      this.multiplayerConnected = true;
    };

    // Initiate network realms connection.
    await this.realms.updatePosition(localPlayer.position.toArray(), realmSize, {
      onConnect,
    });


    // Wait for world apps to be loaded so that avatar doesn't fall.
    const TEST_INTERVAL = 100;
    const MAX_TIMEOUT = 20000;
    const startTime = Date.now();
    while (world.appManager.pendingAddPromises.size > 0 && (Date.now() - startTime) < MAX_TIMEOUT) {
      await new Promise(resolve => setTimeout(resolve, TEST_INTERVAL));
    } */
  }

  getPlayers() {
    return Array.from(this.playersMap.values());
  }

  sendMessage(m) {
    this.realms.sendChatMessage(m);
  }

  createTracker({
    getKeySpec = () => ({
      realmsKeys: [],
      rootRealmKey: null,
    }),
  } = {}) {
    return new Tracker({
      getKeySpec,
      realms: this.realms,
    });
  }

  clearRemoteApps()  {
    this.realms.tx(() => {
      const virtualWorld = this.realms.getVirtualWorld();
      // const virtualPlayers = this.realms.getVirtualPlayers();

      const existingApps = virtualWorld.worldApps.needledVirtualEntities;
      // virtualWorld.worldApps.removeEntityAt(collidedVirtualMap.entityMap.arrayIndexId);

      const arrayIndexIds = Array.from(existingApps.values())
        .map(entity => entity.entityMap.arrayIndexId);
      console.log('got existing apps', arrayIndexIds);
      for (const arrayIndexId of arrayIndexIds) {
        virtualWorld.worldApps.removeEntityAt(arrayIndexId);
      }
    });
  };

  // Called by enterWorld() to ensure we aren't connected to multi-player.
  disconnectMultiplayer() {
    if (!this.multiplayerConnected) {
      throw new Error('not connected to multiplayer');
    }

    if (this.realms) {
      this.realms.disconnect();
      this.realms = null;
    }

    // console.log('Multiplayer disconnected');
  }

  clear() {
    if (this.multiplayerConnected) {
      this.disconnectMultiplayer();
    }
    super.clear();
    this.appManager.clear();
  }

  destroy() {
    this.clear();
    this.remove(this.appManager);
    this.appManager.destroy();
    this.appManager = null;
  }
}
// const universe = new Universe();
// export default universe;