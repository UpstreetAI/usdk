/* player manager manages local and remote players
player manager binds y.js data to player objects
player objects load their own avatar and apps using this binding */

// import * as Z from 'zjs';
import * as THREE from 'three';
import {LocalPlayer, RemotePlayer} from './character-controller.js';
import {makeId} from './util.js';
import {initialPosY} from './constants.js';

//

const localMatrix = new THREE.Matrix4();
const localFrustum = new THREE.Frustum();

//

export class PlayersManager extends THREE.Object3D {
  #localPlayer = null;
  #remotePlayers = new Map();

  constructor({
    engine,
    importManager,
    engineRenderer,
    physicsTracker,
    environmentManager,
    audioManager,
    hupsManager,
    sounds,
    voices,
    sfxManager,
    appContextFactory,
  }) {
    super();

    if (!engine || !importManager || !engineRenderer || !physicsTracker || !environmentManager || !audioManager || !hupsManager || !sounds || !voices || !appContextFactory || !sfxManager) {
      console.warn('missing', {engine, importManager, engineRenderer, physicsTracker, environmentManager, audioManager, hupsManager, sounds, voices, appContextFactory});
      debugger;
      throw new Error('missing');
    }
    this.engine = engine;
    this.importManager = importManager;
    this.engineRenderer = engineRenderer;
    this.physicsTracker = physicsTracker;
    this.environmentManager = environmentManager;
    this.audioManager = audioManager;
    this.hupsManager = hupsManager;
    this.sounds = sounds;
    this.voices = voices;
    this.sfxManager = sfxManager;
    this.appContextFactory = appContextFactory;

    this.setLocalPlayer(this.#addLocalPlayer());
  }

  // XXX debugging
  /* get playersArray() {
    debugger;
  }
  set playersArray(playersArray) {
    debugger;
  } */

  #addLocalPlayer({
    playerId = makeId(5),
  } = {}) {
    const localPlayer = new LocalPlayer({
      playerId,
      engine: this.engine,
      importManager: this.importManager,
      engineRenderer: this.engineRenderer,
      physicsTracker: this.physicsTracker,
      environmentManager: this.environmentManager,
      audioManager: this.audioManager,
      hupsManager: this.hupsManager,
      sounds: this.sounds,
      voices: this.voices,
      sfxManager: this.sfxManager,
      // xrManager: this.xrManager,
      appContextFactory: this.appContextFactory,
    });
    localPlayer.position.y = initialPosY;
    this.add(localPlayer.appManager);
    
    localPlayer.appManager.updateMatrixWorld();

    /* globalThis.testVoice = async text => {
      const apiKey = 'b6cb575a8d4b4f2e763714b701dfca11';
      const voiceId = 'kNBPK9DILaezWWUSHpF9';
      const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
      const j = {
        text,
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      };
      const res = await fetch(`${baseUrl}/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(j),
      });
      const mp3Blob = await res.blob();
      const audio = new Audio();
      audio.src = URL.createObjectURL(mp3Blob);
      audio.play();
    
      // wait for audio to finish
      await new Promise((accept, reject) => {
        audio.addEventListener('ended', accept, {once: true});
        audio.addEventListener('error', reject, {once: true});
      });
    }; */

    return localPlayer;
  }

  getLocalPlayer() {
    return this.#localPlayer;
  }

  setLocalPlayer(newLocalPlayer) {
    const oldPlayer = this.localPlayer;
    this.#localPlayer = newLocalPlayer;

    this.dispatchEvent({
      type: 'localplayerchange',
      // data: {
        oldPlayer: oldPlayer,
        player: this.localPlayer,
      // }
    });
  }

  addRemotePlayer({
    playerId = makeId(5),
  }) {
    const remotePlayer = new RemotePlayer({
      playerId,
      engine: this.engine,
      engineRenderer: this.engineRenderer,
      physicsTracker: this.physicsTracker,
      environmentManager: this.environmentManager,
      audioManager: this.audioManager,
      hupsManager: this.hupsManager,
      sounds: this.sounds,
      voices: this.voices,
      appContextFactory: this.appContextFactory,
      sfxManager: this.sfxManager,
      importManager: this.importManager,
    });
    this.add(remotePlayer.appManager);
    remotePlayer.appManager.updateMatrixWorld();
    this.#remotePlayers.set(playerId, remotePlayer);

    this.dispatchEvent({
      type: 'remoteplayeradd',
      playerId,
      player: remotePlayer,
    });

    return remotePlayer;
  }

  removeRemotePlayer(player) {
    if (player.appManager.parent === this) {
      this.remove(player.appManager);
      const {playerId} = player;
      this.#remotePlayers.delete(playerId);
      
      this.dispatchEvent({
        type: 'remoteplayerremove',
        playerId,
        player,
      });

      player.destroy();
    } else {
      throw new Error('player app manager not a child of this players manager');
    }
  }

  getRemotePlayer(playerId) {
    return this.#remotePlayers.get(playerId);
  }

  getRemotePlayers() {
    return Array.from(this.#remotePlayers.values());
  }

  getPlayer(playerId) {
    return this.getAllPlayers().find(p => p.playerId === playerId) ?? null;
  }
  getAllPlayers() {
    return [this.getLocalPlayer(), ...this.getRemotePlayers()];
  }
  getPlayerByName(name) {
    return this.getAllPlayers().find(p => p.playerSpec.name === name) ?? null;
  }
  getPlayerByNameFunction(fn) {
    return this.getAllPlayers().find(p => fn(p.playerSpec.name)) ?? null;
  }
  getPlayerByVrmApp(vrmApp) {
    return this.getAllPlayers().find(p => p.appManager.getOwnerApp() === vrmApp) ?? null;
  }

  /* clearRemotePlayers() {
    const lastPlayers = this.playersArray;
    if (lastPlayers) {
      const playerSpecs = lastPlayers.toJSON();
      const nonLocalPlayerSpecs = playerSpecs.filter(p => {
        return p.playerId !== this.getLocalPlayer().playerId;
      });
      for (const nonLocalPlayer of nonLocalPlayerSpecs) {
        const remotePlayer = this.remotePlayers.get(nonLocalPlayer.playerId);
        remotePlayer.destroy();
        this.remotePlayers.delete(nonLocalPlayer.playerId);
        this.remotePlayersByInteger.delete(nonLocalPlayer.playerIdInt);
      }
    }
  } */

  getPlayersState() {
    return this.playersArray;
  }
  getPlayersBlacklist({
    includeLocalPlayer = true,
  } = {}) {
    const localPlayer = this.getLocalPlayer();
    return includeLocalPlayer ? [] : [localPlayer];
  }

  updateAvatars(timestamp, timeDiff, camera, session, xrAvatarPose) {
    const projScreenMatrix = localMatrix
      .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    localFrustum.setFromProjectionMatrix(projScreenMatrix);

    const isNoclip = this.engine.game.isNoclip();

    const localPlayer = this.getLocalPlayer();
    const isLocalPlayer = true;
    localPlayer.updateAvatar(timestamp, timeDiff, isLocalPlayer, isNoclip, localFrustum, session, xrAvatarPose);

    for (const remotePlayer of this.#remotePlayers.values()) {
      const isLocalPlayer = false;
      remotePlayer.updateAvatar(timestamp, timeDiff, isLocalPlayer, isNoclip, localFrustum, null, null);
    }
  }

  /* updateAppManagers(timestamp, timeDiff) {
    // XXX all app updates happen in the frameTracker now
    debugger;

    const localPlayer = this.getLocalPlayer();
    localPlayer.appManager.update(timestamp, timeDiff);

    for (const remotePlayer of this.#remotePlayers.values()) {
      remotePlayer.appManager.update(timestamp, timeDiff);
    }
  } */

  /* unbindState() {
    if(this.unbindStateFn != null) {
      this.unbindStateFn();
    }
    if (this.removeListenerFn) {
      this.removeListenerFn();
    }
    this.playersArray = null;
    this.unbindStateFn = null;
    this.removeListenerFn = null;
  }

  bindState(nextPlayersArray) {
    this.unbindState();

    this.playersArray = nextPlayersArray;
    
    if (this.playersArray) {
      const playerSelectedFn = e => {
        const {
          player,
        } = e.data;
        player.bindState(this.playersArray);
      };

      this.addEventListener('playerchange', playerSelectedFn);
      this.removeListenerFn = () => {
        this.removeEventListener('playerchange', playerSelectedFn);
      }
      
      const playersObserveFn = e => {
        const localPlayer = this.localPlayer;
        const {added, deleted, delta, keys} = e.changes;
        for (const item of added.values()) {
          let playerMap = item.content.type;
          if (playerMap.constructor === Object) {
            for (let i = 0; i < this.playersArray.length; i++) {
              const localPlayerMap = this.playersArray.get(i, Z.Map); // force to be a map
              if (localPlayerMap.binding === item.content.type) {
                playerMap = localPlayerMap;
                break;
              }
            }
          }

          const playerId = playerMap.get('playerId');
          
          if (playerId !== localPlayer.playerId) {
            // console.log('add player', playerId, this.playersArray.toJSON());
            
            const remotePlayer = new RemotePlayer({
              playerId,
              playersArray: this.playersArray,
            });
            this.remotePlayers.set(playerId, remotePlayer);
            this.remotePlayersByInteger.set(remotePlayer.playerIdInt, remotePlayer);
            this.dispatchEvent(new MessageEvent('playeradded', {data: {player: remotePlayer}}));
          }
        }
        // console.log('players observe', added, deleted);
        for (const item of deleted.values()) {
          // console.log('player remove 1', item);
          const playerId = item.content.type._map.get('playerId').content.arr[0]; // needed to get the old data
          // console.log('player remove 2', playerId, localPlayer.playerId);

          if (playerId !== localPlayer.playerId) {
            // console.log('remove player', playerId);
            
            const remotePlayer = this.remotePlayers.get(playerId);
            this.remotePlayers.delete(playerId);
            this.remotePlayersByInteger.delete(remotePlayer.playerIdInt);
            remotePlayer.destroy();
            this.dispatchEvent(new MessageEvent('playerremoved', {data: {player: remotePlayer}}));
          }
        }
      };
      this.playersArray.observe(playersObserveFn);
      this.unbindStateFn = this.playersArray.unobserve.bind(this.playersArray, playersObserveFn);
    }
  }

  updateRemotePlayers(timestamp, timeDiff) {
    for (const remotePlayer of this.remotePlayers.values()) {
      remotePlayer.update(timestamp, timeDiff);
    }
  } */
}