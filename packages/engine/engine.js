/*
this file bootstraps the webaverse engine.
it uses the help of various managers and stores, and executes the render loop.
*/

import Avatar from './avatars/avatars.js';
import physx from './physics/physx.js';
// import physicsManager from './physics/physics-manager.js';
import physxWorkerManager from './physics/physx-worker-manager.js';
import {
  MetaversefileCache,
} from '../app-runtime/app-import-cache.js';

// import {
//   EngineContext,
// } from './engine-context.js';
import {
  EngineRuntime,
} from './engine-runtime.js';

//

const bindProxyAccessors = (source, target) => {
  // for all own properties of source
  for (const k in source) {
    const v = source[k];
    Object.defineProperty(target, k, {
      get() {
        return v;
      },
      set(v) {
        throw new Error('cannot set proxy accessor, edit the source at initialization instead');
      }
    });
  }
};

//

const metaversefileCache = new MetaversefileCache();
// globalThis.metaversefileCache = metaversefileCache;

// let numWebaverseEngines = null;
export class Engine extends EventTarget {
  #disablePhysxWorker;

  constructor({
    canvas,
    context,
    runtime,
  } = {}) {
    super();

    if (canvas) {
      throw new Error('canvas provided but not needed');
    }
    if (!context) {
      // context = new EngineContext();
      throw new Error('context not provided');
    }
    if (!runtime) {
      runtime = new EngineRuntime({
        canvas,
        context,
        engine: this,
      });
    }

    // this.canvas = canvas;
    this.context = context;
    this.runtime = runtime;

    bindProxyAccessors(this.context, this);
    bindProxyAccessors(this.runtime, this);

    this.#loadPromise = null;

    // TODO Fixme(Matt): sometimes "this" context is missing in class methods.
    this.destroy = this.destroy.bind(this);
  }

  set disablePhysxWorker(val) {
    this.#disablePhysxWorker = val;
  }

  getCanvas() {
    return this.runtime.getCanvas();
  }
  setCanvas(canvas) {
    this.runtime.setCanvas(canvas);
  }

  #loadPromise = null;
  waitForLoad() {
    if (this.#loadPromise === null) {
      this.#loadPromise = (async () => {
        /**
         * TODO Fixme(Matt): Preventing loading of additional physics wasm by settting numWorkers to 0.
         */
        if(this.#disablePhysxWorker) {
          physxWorkerManager.numWorkers = 0;
        }
        // call the waitForLoad functions and update the loading progress
        // we need to load them simultaneously
        await Promise.all([
          physx.waitForLoad(),
          Avatar.waitForLoad(),
          physxWorkerManager.waitForLoad(),
          this.runtime.waitForLoad(), // sounds, voices, floor
        ]);

        // _startHacks(this);
      })();
    }
    return this.#loadPromise;
  }

  start() {
    this.runtime.start();
  }
  stop() {
    this.runtime.stop();
  }

  // async initializePlayer() {
  //   await this.runtime.initializePlayer();
  // }
  async spawn() {
    await this.runtime.spawn();
    // this.floorManager.disableFloor();
  }

  /* save() {
    const appManager = this.getAppManager();
    return appManager.save();
  }
  async load(j) {
    const oldEnabled = this.floorManager.isEnabled();
    let cleanup;
    if (!oldEnabled) {
      this.floorManager.enableFloor();
      cleanup = () => {
        this.floorManager.disableFloor();
      };
    } else {
      cleanup = () => {};
    }

    try {
      const appManager = this.getAppManager();
      await appManager.load(j);
    } finally {
      cleanup();
    }
  } */

  // createAppManager() {
  //   return this.runtime.createAppManager();
  // }
  // getAppManager() {
  //   return this.runtime.getAppManager();
  // }
  // setAppManager(appManager) {
  //   this.runtime.setAppManager(appManager);
  // }

  createMultiplayer() {
    return this.runtime.createMultiplayer();
  }

  destroy() {
    this.runtime.destroy();
  }
}

/* const _startHacks = webaverse => {
  const localPlayer = playersManager.getLocalPlayer();
  const vpdAnimations = Avatar.getAnimations().filter(animation => animation.name.endsWith('.vpd'));

  // Press } to debug current state in console.
  (typeof window !== 'undefined') && window.addEventListener('keydown', event => {
    if (event.key === '}') {
      console.log('>>>>> current state');
      console.log(universe.state);
      console.log('>>>>> scene');
      console.log(scene);
      console.log('>>>>> local player');
      console.log(localPlayer);
      console.log('>>>>> remote players');
      console.log(playersManager.getRemotePlayers());
    }
  });

  const lastEmotionKey = {
    key: -1,
    timestamp: 0,
  };
  let emotionIndex = -1;
  let poseAnimationIndex = -1;
  const _emotionKey = key => {
    const timestamp = performance.now();
    if ((timestamp - lastEmotionKey.timestamp) < 1000) {
      const key1 = lastEmotionKey.key;
      const key2 = key;
      emotionIndex = (key1 * 10) + key2;

      lastEmotionKey.key = -1;
      lastEmotionKey.timestamp = 0;
    } else {
      lastEmotionKey.key = key;
      lastEmotionKey.timestamp = timestamp;
    }
  };
  const _updateFacePose = () => {
    const oldFacePoseActionIndex = localPlayer.findActionIndex(action => action.type === 'facepose' && /^emotion-/.test(action.emotion));
    if (oldFacePoseActionIndex !== -1) {
      localPlayer.removeActionIndex(oldFacePoseActionIndex);
    }
    if (emotionIndex !== -1) {
      const emoteAction = {
        type: 'facepose',
        emotion: `emotion-${emotionIndex}`,
        value: 1,
      };
      localPlayer.addAction(emoteAction);
    }
  };
  const _updatePose = () => {
    localPlayer.removeAction('pose');
    if (poseAnimationIndex !== -1) {
      const animation = vpdAnimations[poseAnimationIndex];
      const poseAction = {
        type: 'pose',
        animation: animation.name,
      };
      localPlayer.addAction(poseAction);
    }
  };
  webaverse.titleCardHack = false;
  // let haloMeshApp = null;
  (typeof window !== 'undefined') && window.addEventListener('keydown', e => {
    if (e.which === 46) { // .
      emotionIndex = -1;
      _updateFacePose();
    } else if (e.which === 107) { // +
      poseAnimationIndex++;
      poseAnimationIndex = Math.min(Math.max(poseAnimationIndex, -1), vpdAnimations.length - 1);
      _updatePose();

      // _ensureMikuModel();
      // _updateMikuModel();
    } else if (e.which === 109) { // -
      poseAnimationIndex--;
      poseAnimationIndex = Math.min(Math.max(poseAnimationIndex, -1), vpdAnimations.length - 1);
      _updatePose();

      // _ensureMikuModel();
      // _updateMikuModel();
    } else if (e.which === 106) { // *
      webaverse.titleCardHack = !webaverse.titleCardHack;
      webaverse.dispatchEvent(new MessageEvent('titlecardhackchange', {
        data: {
          titleCardHack: webaverse.titleCardHack,
        },
      }));
    } else if (e.code === 'Home') { // home
      const quality = settingsManager.adjustCharacterQuality(-1);
      game.setAvatarQuality(quality);
    } else if (e.code === 'End') { // end
      const quality = settingsManager.adjustCharacterQuality(1);
      game.setAvatarQuality(quality);
    } else {
      const match = e.code.match(/^Numpad([0-9])$/);
      if (match) {
        const key = parseInt(match[1], 10);
        _emotionKey(key);
        _updateFacePose();
      }
    }
  });
}; */
