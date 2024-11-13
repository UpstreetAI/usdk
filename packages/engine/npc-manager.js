/*
npc manager tracks instances of all npcs.
npcs includes,
  - characters in party system
  - world npcs
  - detached npcs for character select preview
*/

import * as THREE from 'three';
// import Avatar from './avatars/avatars.js';
// import {LocalPlayer} from './character-controller.js';
import {NpcPlayer} from './character-controller.js';
// import * as voices from './voices.js';
// import {world} from './world.js';
// import {chatManager} from './chat-manager.js';
import {makeId, createRelativeUrl} from './util.js';
// import {characterSelectManager} from './characterselect-manager.js';
// import {idleFn} from './npc-behavior.js';
// import {
//   createAppAsync,
// } from '../metaversefile/apps';
import physicsManager from './physics/physics-manager.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localMatrix = new THREE.Matrix4();
const localFrustum = new THREE.Frustum();

// const updatePhysicsFnMap = new WeakMap();
// const updateAvatarsFnMap = new WeakMap();
// const cancelFnsMap = new WeakMap();
// let targetSpec = null;

//

// const BehaviorType = {
//   IDLE: 0,
//   FOLLOW: 1,
// };

//

export class NpcManager extends THREE.Object3D {
  constructor({
    engine,
    engineRenderer,
    physicsTracker,
    environmentManager,
    audioManager,
    hupsManager,
    sounds,
    voices,
    characterSelectManager,
    hitManager,
    importManager,
    sfxManager,
    appContextFactory,
    loreManager,
  }) {
    super();

    // members
    if (!engine || !engineRenderer || !physicsTracker || !environmentManager || !audioManager || !hupsManager || !sounds || !voices || !characterSelectManager || !hitManager || !importManager || !sfxManager || !appContextFactory || !loreManager) {
      // throw new Error('missing required arguments');
      console.warn('missing required arguments', {
        engine,
        engineRenderer,
        physicsTracker,
        environmentManager,
        audioManager,
        hupsManager,
        sounds,
        voices,
        characterSelectManager,
        hitManager,
        importManager,
        sfxManager,
        appContextFactory,
        loreManager,
      });
      debugger;
    }
    this.engine = engine;
    this.engineRenderer = engineRenderer;
    this.physicsTracker = physicsTracker;
    this.environmentManager = environmentManager;
    this.audioManager = audioManager;
    this.hupsManager = hupsManager;
    this.sounds = sounds;
    this.voices = voices;
    this.characterSelectManager = characterSelectManager;
    this.hitManager = hitManager;
    this.importManager = importManager;
    this.sfxManager = sfxManager;
    this.appContextFactory = appContextFactory;
    this.loreManager = loreManager;

    // locals
    this.npcPlayers = new Set();

    // this.npcs = [];
    // this.detachedNpcs = [];
    // this.npcAppMap = new WeakMap();
    // this.targetMap = new WeakMap();
  }

  getNpcByPlayerId(playerId) {
    for (const npc of this.npcPlayers.values()) {
      if (npc.playerId === playerId) {
        return npc;
      }
    }
    return null;
  }
  getNpcByName(name) {
    for (const npc of this.npcPlayers.values()) {
      if (npc.playerSpec.name === name) {
        return npc;
      }
    }
    return null;
  }
  getNpcByNameFunction(fn) {
    return Array.from(this.npcPlayers.values()).find(npc => fn(npc.playerSpec.name));
  }

  getNpcs() {
    return this.npcPlayers;
  }

  /* getNpcByVrmApp(vrmApp) {
    for (const npc of this.npcPlayers.values()) {
      if (npc.appManager.getOwnerApp() === vrmApp) {
        return npc;
      }
    }
    return null;
  } */
  /* getNpcByVrmApp(vrmApp) {
    if (vrmApp.parent.isAppManager) {
      const npcApp = vrmApp.parent.getOwnerApp();
      if (npcApp?.npc) {
        return npcApp.npc;
      }
    }
    return null;
  } */

  /* getAppByNpc(npc) {
    return this.npcAppMap.get(npc);
  }

  getNpcByAppInstanceId(instanceId) {
    return this.npcs.find(npc => this.getAppByNpc(npc).instanceId === instanceId);
  }

  getDetachedNpcByApp(app) {
    return this.detachedNpcs.find(npc => this.getAppByNpc(npc) === app);
  }

  async initDefaultPlayer() {
    const spec = await characterSelectManager.getDefaultSpecAsync();
    // const player = metaversefile.useLocalPlayer();
    const player = this.playersManager.getLocalPlayer();
    // console.log('set player spec', spec);
    await player.setPlayerSpec(spec);

    const createPlayerApp = () => {
      const app = createAppAsync();
      app.instanceId = makeId(5);
      app.name = 'player';
      app.contentId = spec.avatarUrl;
      return app;
    };
    const app = createPlayerApp();

    app.addEventListener('destroy', () => {
      this.removeNpcApp(app);
    });
  } */

  async addNpcApp(app, srcUrl) {
    // load json
    const res = await fetch(srcUrl);
    const json = await res.json();

    // npc parameters
    const {
      name,
      bio,
      description,
      // class: className,
    } = json;
    const avatarUrl = createRelativeUrl(json.avatarUrl, srcUrl);
    const {voiceEndpoint, voicePack, previewUrl, preview_url} = json;

    const _previewUrl = previewUrl || preview_url;

    const position = localVector.setFromMatrixPosition(app.matrixWorld)
      .add(localVector2.set(0, 1, 0));
    const quaternion = app.quaternion;
    const scale = app.scale;
    const components = [
      {
        key: 'physics',
        value: false,
      },
    ];

    // create npc
    const npcPlayer = await this.#createNpcAsync({
      ownerApp: app,
      name,
      bio: bio || description,
      // class: className,
      avatarUrl,
      voiceEndpoint,
      voicePack,
      position,
      quaternion,
      scale,
      previewUrl: _previewUrl,
      // detached,
      // norenderer,
      components,
    });
    app.player = npcPlayer;

    const actor = this.loreManager.createActor({
      id: npcPlayer.playerId,
      type: 'character',
      spec: npcPlayer.playerSpec,
      object: npcPlayer,
    });
    this.loreManager.addActor(actor);

    {
      const hitTracker = this.hitManager.createHitTracker({
        app,
      });
      hitTracker.addEventListener('hit', e => {
        const e2 = {...e};
        npcPlayer.dispatchEvent(e2);
      });
      this.hitManager.addAppHitTracker(app, hitTracker);
    }

    this.dispatchEvent({
      type: 'npcadd',
      playerId: npcPlayer.playerId,
      player: npcPlayer,
    });

    return npcPlayer;
  }

  removeNpcApp(app) {
    this.hitManager.removeAppHitTracker(app);

    const npcPlayer = app.player;

    const actor = this.loreManager.getActorById(npcPlayer.playerId);
    this.loreManager.removeActor(actor);

    npcPlayer.destroy();

    this.remove(npcPlayer.appManager);
    npcPlayer.appManager.destroy();

    this.npcPlayers.delete(npcPlayer);

    this.dispatchEvent({
      type: 'npcremove',
      playerId: npcPlayer.playerId,
      player: npcPlayer,
    });
  }

  /* updatePhysics(timestamp, timeDiff) {
    const allNpcs = [].concat(this.npcs, this.detachedNpcs);
    for (const npc of allNpcs) {
      const fn = updatePhysicsFnMap.get(this.getAppByNpc(npc));
      if (fn) {
        fn(npc, timestamp, timeDiff);
      }
    }
  }

  updateAvatar(timestamp, timeDiff) {
    const allNpcs = [].concat(this.npcs, this.detachedNpcs);
    for (const npc of allNpcs) {
      const fn = updateAvatarsFnMap.get(this.getAppByNpc(npc));
      if (fn) {
        fn(timestamp, timeDiff);
      }
    }
  }

  setPartyTarget(player, target) {
    this.targetMap.set(player, target);
  }

  getPartyTarget(player) {
    return this.targetMap.get(player);
  } */

  async #createNpcAsync({
    ownerApp,
    name,
    bio,
    // class: className,
    avatarUrl,
    previewUrl,
    voiceEndpoint,
    voicePack,
    position,
    quaternion,
    scale,
    // detached,
    // norenderer,
    // components,
  }) {
    const playerId = makeId(5);
    const npcPlayer = new NpcPlayer({
      playerId,
      engine: this.engine,
      engineRenderer: this.engineRenderer,
      physicsTracker: this.physicsTracker,
      environmentManager: this.environmentManager,
      audioManager: this.audioManager,
      hupsManager: this.hupsManager,
      sounds: this.sounds,
      voices: this.voices,
      importManager: this.importManager,
      sfxManager: this.sfxManager,
      appContextFactory: this.appContextFactory,
    });
    npcPlayer.name = name ?? 'npc';

    // update transform
    let matrixNeedsUpdate = false;
    if (position) {
      npcPlayer.position.copy(position);
      matrixNeedsUpdate = true;
    }
    if (quaternion) {
      npcPlayer.quaternion.copy(quaternion);
      matrixNeedsUpdate = true;
    }
    if (scale) {
      npcPlayer.scale.copy(scale);
      matrixNeedsUpdate = true;
    }
    if (matrixNeedsUpdate) {
      npcPlayer.updateMatrixWorld();
    }

    // npcPlayer.appManager.setOwnerApp(ownerApp); // for physics parent app resolution

    // const spec = await this.characterSelectManager.getDefaultSpecAsync();
    const npcSpec = {
      avatarUrl,
      name,
      bio,
      previewUrl,
      // class: className,
      voiceEndpoint,
      voicePack,
    };
    await npcPlayer.setPlayerSpec(npcSpec);

    this.add(npcPlayer.appManager);
    npcPlayer.appManager.updateMatrixWorld();
    this.npcPlayers.add(npcPlayer);

    return npcPlayer;
  }

  updateAvatars(timestamp, timeDiff) {
    const {camera} = this.engineRenderer;

    const projScreenMatrix = localMatrix
      .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    localFrustum.setFromProjectionMatrix(projScreenMatrix);

    for (const npcPlayer of this.npcPlayers) {
      if (npcPlayer.enabled) {
        const isLocalPlayer = false;
        const isNoclip = false;
        npcPlayer.updateAvatar(timestamp, timeDiff, isLocalPlayer, isNoclip, localFrustum);
      }
    }
  }

  getClosestNpcPlayer(position) {
    let closestNpcPlayer = null;
    let closestDistance = Infinity;
    for (const npcPlayer of this.npcPlayers) {
      const distance = npcPlayer.position.distanceTo(position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestNpcPlayer = npcPlayer;
      }
    }
    return closestNpcPlayer;
  }

  disableNpcPhysics() {
    const physicsScene = physicsManager.getScene();

    const players = Array.from(this.npcPlayers);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const {
        characterPhysics,
      } = player;
      const {
        characterController,
      } = characterPhysics;
      physicsScene.disableGeometryQueries(characterController);
      physicsScene.disableActor(characterController);
      // console.log('disabled', {
      //   player,
      //   characterController,
      // });
    }
  }
  enableNpcPhysics() {
    const physicsScene = physicsManager.getScene();

    const players = Array.from(this.npcPlayers);
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const {
        characterPhysics,
      } = player;
      const {
        characterController,
      } = characterPhysics;
      physicsScene.enableActor(characterController);
      physicsScene.enableGeometryQueries(characterController);
    }
  }

  /* async #setNpcApp({
    npc,
    app,
    json,
  }) {
    // cleanFns
    npc.cancelFns = [
      () => {
        npc.destroy();
      },
    ];

    cancelFnsMap.set(app, () => {
      for (const cancelFn of npc.cancelFns) {
        cancelFn();
      }
    });

    // npcs list
    const detached = !!json.detached;
    if (!detached) {
      this.npcs.push(npc);
      npc.cancelFns.push(() => {
        const removeIndex = this.npcs.indexOf(npc);
        this.npcs.splice(removeIndex, 1);
      });
    } else {
      this.detachedNpcs.push(npc);
      npc.cancelFns.push(() => {
        const removeIndex = this.detachedNpcs.indexOf(npc);
        this.detachedNpcs.splice(removeIndex, 1);
      });
    }

    // npcApp map
    this.npcAppMap.set(npc, app);
    npc.cancelFns.push(() => {
      this.npcAppMap.delete(npc);
    });

    // playeradd/playerremove events
    const player = npc;
    this.dispatchEvent(new MessageEvent('playeradd', {
      data: {
        player,
      }
    }));
    npc.cancelFns.push(() => {
      this.dispatchEvent(new MessageEvent('playerremove', {
        data: {
          player,
        }
      }));
    });

    // physics object tracking
    app.setPhysicsObject(player.characterPhysics.characterController);
    const avatarupdate = e => {
      app.setPhysicsObject(player.characterPhysics.characterController);
    };
    player.addEventListener('avatarupdate', avatarupdate);
    npc.cancelFns.push(() => {
      player.removeEventListener('avatarupdate', avatarupdate);
    });

    // events

    const _listenEvents = () => {
      const animations = Avatar.getAnimations();
      const hurtAnimation = animations.find(a => a.isHurt);
      const hurtAnimationDuration = hurtAnimation.duration;
      const hittrackeradd = e => {
        app.hitTracker.addEventListener('hit', e => {
          if (!player.hasAction('hurt')) {
            const newAction = {
              type: 'hurt',
              animation: 'pain_back',
            };
            player.addAction(newAction);

            setTimeout(() => {
              player.removeAction('hurt');
            }, hurtAnimationDuration * 1000);
          }
        });
      };
      app.addEventListener('hittrackeradded', hittrackeradd);
      npc.cancelFns.push(() => {
        app.removeEventListener('hittrackeradded', hittrackeradd);
      });

      const activate = () => {
        // check if the npc is a guest giver
        startConversation(app);
      };
      app.addEventListener('activate', activate);
      npc.cancelFns.push(() => {
        app.removeEventListener('activate', activate);
      });

      this.setBehaviorFn(app, idleFn);

      const updateAvatarFn = (timestamp, timeDiff) => {
        player.updateAvatar(timestamp, timeDiff);
      };
      updateAvatarsFnMap.set(app, updateAvatarFn);
      npc.cancelFns.push(() => {
        updateAvatarsFnMap.delete(app);
      });
    };
    _listenEvents();

    // load
    const npcName = json.name;
    const npcVoiceName = json.voice;
    const npcBio = json.bio;
    let npcWear = json.wear ?? [];
    if (!Array.isArray(npcWear)) {
      npcWear = [npcWear];
    }

    // ai scene
    const _addToAiScene = () => {
      const character = world.loreAIScene.addCharacter({
        name: npcName,
        bio: npcBio,
      });
      npc.cancelFns.push(() => {
        world.loreAIScene.removeCharacter(character);
      });
      character.addEventListener('say', e => {
        const localPlayer = playersManager.getLocalPlayer();

        const {message, emote, action, object, target} = e.data;
        const chatId = makeId(5);

        const m = {
          type: 'chat',
          chatId,
          playerId: localPlayer.playerId,
          playerName: localPlayer.name,
          message,
        };

        chatManager.addPlayerMessage(player, m);

        const _triggerEmotes = () => {
          const fuzzyEmotionName = getFuzzyEmotionMapping(emote);
          if (fuzzyEmotionName) {
            this.emoteManager.triggerEmote(fuzzyEmotionName, player);
          }
        };
        _triggerEmotes();

        const _triggerActions = () => {
          if (emote === 'supersaiyan' || action === 'supersaiyan' || /supersaiyan/i.test(object) || /supersaiyan/i.test(target)) {
            const newSssAction = {
              type: 'sss',
            };
            player.addAction(newSssAction);
          } else if (action === 'follow' || (object === 'none' && target === localPlayer.name)) { // follow player
            app.setComponent('state', {behavior: BehaviorType.FOLLOW, target: npcManager.getAppByNpc(localPlayer).instanceId});
          } else if (action === 'stop') { // stop
            app.setComponent('state', {behavior: BehaviorType.IDLE, target: null});
          } else if (action === 'moveto' || (object !== 'none' && target === 'none')) { // move to object
            console.log('move to object', object);
          } else if (action === 'moveto' || (object === 'none' && target !== 'none')) { // move to player
            targetSpec = {
              type: 'moveto',
              object: localPlayer,
            };
          } else if (['pickup', 'grab', 'take', 'get'].includes(action)) { // pick up object
            console.log('pickup', action, object, target);
          } else if (['use', 'activate'].includes(action)) { // use object
            console.log('use', action, object, target);
          }
        };
        _triggerActions();
      });
    };
    _addToAiScene();

    // attach to scene
    const _addPlayerAvatarToApp = () => {
      app.position.set(0, 0, 0);
      app.quaternion.identity();
      app.scale.set(1, 1, 1);

      // app.add(vrmApp);
      app.updateMatrixWorld();
    };
    _addPlayerAvatarToApp();

    // voice endpoint setup
    const _setVoiceEndpoint = () => {
      const voice = voices.voiceEndpoints.find(v => v.name.toLowerCase().replaceAll(' ', '') === npcVoiceName.toLowerCase().replaceAll(' ', ''));
      if (voice) {
        player.setVoiceEndpoint(voice.drive_id);
      } else {
        console.error('*** unknown voice name', npcVoiceName, voices.voiceEndpoints);
      }
    };
    _setVoiceEndpoint();
    // wearables
    const _updateWearables = async () => {
      const wearablePromises = npcWear.map(wear => (async () => {
        const {start_url, components} = wear;
        const app = await player.appManager.addTrackedApp(
          start_url,
          undefined,
          undefined,
          undefined,
          components,
        );

        player.wear(app);
      })());
      await wearablePromises;
    };
    await _updateWearables();
  }

  setBehaviorFn(app, behaviorFn) {
    const npc = this.getNpcByApp(app);
    updatePhysicsFnMap.set(app, behaviorFn);
    npc.cancelFns.push(() => updatePhysicsFnMap.delete(app));
  } */
}
