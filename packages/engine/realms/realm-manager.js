/*
this file contains the universe/meta-world/scenes/multiplayer code.
responsibilities include loading the world on url change.
*/

import * as THREE from 'three';

import {
  initialPosY,
  // realmSize,
} from '../constants.js';
import {makeId, parseQuery} from '../util.js';
import {scenesBaseUrl, defaultSceneName} from '../endpoints.js';
import {
  World,
} from './world.js';
import {
  Multiplayer,
} from './multiplayer.js';

//

export class RealmManager extends THREE.Object3D {
  #rootRealm = null;

  constructor({
    playersManager,
    spawnManager,
    engine,
    sceneContextManager,
    characterSelectManager,
    audioManager,
    ioBus,
    physicsTracker,
    importManager,
    appContextFactory,
  }) {
    super();

    // members
    if (!playersManager || !spawnManager || !engine || !sceneContextManager || !characterSelectManager || !audioManager || !ioBus || !physicsTracker || !importManager || !appContextFactory) {
      console.warn('invalid args', {
        playersManager,
        spawnManager,
        engine,
        sceneContextManager,
        characterSelectManager,
        audioManager,
        ioBus,
        physicsTracker,
        importManager,
        appContextFactory,
      });
      debugger;
    }
    this.playersManager = playersManager;
    this.spawnManager = spawnManager;
    this.engine = engine;
    this.sceneContextManager = sceneContextManager;
    this.characterSelectManager = characterSelectManager;
    this.audioManager = audioManager;
    this.ioBus = ioBus;
    this.physicsTracker = physicsTracker;
    this.importManager = importManager;
    this.appContextFactory = appContextFactory;
  }

  getRootRealm() {
    const rootRealm = this.#rootRealm;
    return rootRealm;
  }

  clear() {
    if (this.#rootRealm) {
      this.remove(this.#rootRealm);
      this.#rootRealm.destroy();
      this.#rootRealm = null;
    }
  }
  async setRealmSpec(realmSpec) {
    this.clear();

    const {/*src, */room} = realmSpec;

    if (!room) { // singleplayer
      this.#rootRealm = this.createWorld();
    } else { // multiplayer
      this.#rootRealm = this.createMultiplayer();
    }
    this.add(this.#rootRealm);
    this.#rootRealm.updateMatrixWorld();
    await this.#rootRealm.setRealmSpec(realmSpec);
    
    const localPlayer = this.playersManager.getLocalPlayer();
    localPlayer.position.set(0, initialPosY, 0);
    localPlayer.updateMatrixWorld();

    localPlayer.characterPhysics.setPosition(localPlayer.position);
    localPlayer.characterPhysics.reset();
    // localPlayer.updatePhysics(0, 0);

    await this.spawnManager.spawn();

    this.dispatchEvent({
      type: 'realmchange',
    });
  }

  createWorld() {
    return new World({
      engine: this.engine,
      sceneContextManager: this.sceneContextManager,
      ioBus: this.ioBus,
      importManager: this.importManager,
      appContextFactory: this.appContextFactory,
    });
  }
  createMultiplayer() {
    return new Multiplayer({
      playersManager: this.playersManager,
      spawnManager: this.spawnManager,
      engine: this.engine,
      sceneContextManager: this.sceneContextManager,
      characterSelectManager: this.characterSelectManager,
      audioManager: this.audioManager,
      physicsTracker: this.physicsTracker,
      importManager: this.importManager,
      appContextFactory: this.appContextFactory,
    });
  }

  isMultiplayer() {
    return this.#rootRealm && this.#rootRealm instanceof Universe;
  }

  enterMultiplayer() {
    if (!this.isMultiplayer()) {
      let {src} = parseQuery(location.search);
      if (src === undefined) {
        src = scenesBaseUrl + defaultSceneName;
      }
      const sceneName = src.trim();
      this.room = makeId(5);
      const url = `/?src=${encodeURIComponent(sceneName)}&room=${this.room}`;
      this.pushUrl(url);
    }
  }

  async pushUrl(u) {
    history.pushState({}, '', u);
    globalThis.dispatchEvent(new MessageEvent('pushstate'));
    await this.handleUrlUpdate();
  }

  async handleUrlUpdate() {
    const q = parseQuery(location.search);
    await this.setRealmSpec(q);
  }

  destroy() {
    this.clear();
  }
}