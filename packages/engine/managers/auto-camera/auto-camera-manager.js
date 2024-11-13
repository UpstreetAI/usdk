import * as THREE from 'three';
import alea from 'alea';
import weighted from 'weighted';

import {
  cameraTypeFns,
  cameraTypes,
} from './camera-animations.js';
import {
  screenshotSize,
} from '../../constants.js';

//

// const zeroObject = new THREE.Object3D();

//

const seedPrefix = 'camera:';
export const numAutoCameraRetries = 100;

// export const intervalDelayMin = 2000;
// export const intervalDelayMax = 5000;

//

class AutoCamera {
  constructor({
    autoCameraManager,
    camera,
    seed = (Math.floor(Math.random() * 0xFFFFFFFF)).toString(16),
  }) {
    this.autoCameraManager = autoCameraManager;
    this.camera = camera;

    this.rng = alea(seedPrefix + seed);
    this.cameraSeed = this.rng();
  }

  tick() {
    this.cameraSeed = this.rng();
  }

  getSeed() {
    return this.cameraSeed;
  }

  createEstablishingAnimation(opts) {
    const fnOpts = {
      ...this.#getFnOps(),
      ...opts,
    };
    return new cameraTypeFns.establishing.constructor(fnOpts);
  }
  createSimpleAnimation(opts) {
    const fnOpts = {
      ...this.#getFnOps(),
      ...opts,
    };
    return new cameraTypeFns.simple.constructor(fnOpts);
  }
  createCinematicAnimation(opts) {
    const fnOpts = {
      ...this.#getFnOps(),
      ...opts,
    };
    const allowedCameraTypeSpecs = cameraTypes.map(cameraType => {
      const cameraTypeSpec = cameraTypeFns[cameraType];
      const animation = new cameraTypeSpec.constructor(fnOpts);
      const weight = cameraTypeSpec.weight;

      if (animation.isValid()) {
        return {
          angleType: cameraType,
          animation,
          weight,
        };
      } else {
        return null;
      }
    }).filter(a => a !== null);
    const allowedCameraTypeWeights = allowedCameraTypeSpecs.map(s => s.weight);
    const rng = alea(this.cameraSeed);
    const angleTypeSpec = weighted.select(
      allowedCameraTypeSpecs,
      allowedCameraTypeWeights,
      {
        rand: () => rng(),
        normal: false,
      },
    );
    // console.log('new animation', angleTypeSpec?.animation);
    return angleTypeSpec.animation;
  }

  /* isValidCameraType(cameraType) {
    return [
      'establishing',
      'cinematic',
      'simple',
    ].includes(cameraType);
  } */
  /* updateCameraType(cameraType) {
    switch (cameraType) {
      case 'establishing': {
        return this.updateEstablishing();
      }
      case 'cinematic': {
        return this.updateCinematic();
      }
      case 'simple': {
        return this.updateSimple();
      }
      default: {
        console.warn('invalid camera type', cameraType);
        return null;
      }
    }
  } */

  /* // XXX get this from the function state
  isAnimating() {
    return this.cameraState?.animation ?
      !this.cameraState.animation.done
    :
      false;
  } */

  #getFnOps() {
    const {
      postProcessing,
      locationTargets,
      characterTargets,
      propTargets,
      bindingsList,
    } = this.autoCameraManager;
    const {
      camera,
      // cameraSeed,
    } = this;

    return {
      camera,
      postProcessing,
      bindingCandidates: {
        locationTargets,
        characterTargets,
        propTargets,
        bindingsList,
      },
      // seed: cameraSeed,
    };
  }
  /* updateEstablishing(opts) {
    const fnOpts = {
      ...this.#getFnOps(),
      opts,
    };

    // XXX make this stateful
    const fingerprint = cameraTypeFns.establishing.fn(fnOpts);
    if (!fingerprint) {
      console.warn('ignoring establishing camera', cameraTypeFns.establishing, 'because it became invalid');
    }
    return fingerprint;
  } */
  /* updateSimple() {
    const fnOpts = {
      ...this.#getFnOps(),
      opts,
    };

    const fingerprint = cameraTypeFns.simple.fn(fnOpts);
    if (!fingerprint) {
      console.warn('ignoring simple camera because it became invalid');
    }
    return fingerprint;
  } */
  /* updateCinematic(opts) {
    const fnOpts = {
      ...this.#getFnOps(),
      opts,
    };

    const fingerprint = this.cameraAngleFn(fnOpts);
    if (!fingerprint) {
      console.warn('ignoring cinematic camera', this.cameraAngleFn, 'because it became invalid');
    }
    return fingerprint;
  } */

  async capture(screenshotSizeX = screenshotSize, screenshotSizeY = screenshotSize) {
    const {
      autoCameraManager,
      camera,
    } = this;
    const {
      engineRenderer,
      playersManager,
    } = autoCameraManager;
    
    // set aspect ratio of camera
    const aspect = screenshotSizeX / screenshotSizeY;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    const localPlayer = playersManager.getLocalPlayer();
    const localAvatarApp = localPlayer?.avatar?.app;
    const oldParent = localAvatarApp?.parent;
    if (localAvatarApp) {
      oldParent.remove(localAvatarApp);
    }
    const popSize = engineRenderer.pushSize(screenshotSizeX, screenshotSizeY);
    // renderer.render(this.engineRenderer.scene, camera);
    engineRenderer.render({
      postProcessing: false,
      camera,
    });
    const screenshotBlobPromise = new Promise((accept, reject) => {
      engineRenderer.renderer.domElement.toBlob(accept, 'image/jpeg');
    });
    popSize();
    if (localAvatarApp) {
      oldParent.add(localAvatarApp);
    }

    const screenshotBlob = await screenshotBlobPromise;
    return screenshotBlob;
  }
}

//

export class AutoCameraManager {
  constructor({
    engineRenderer,
    playersManager,
    postProcessing,
    // appTracker,
    loreManager,
  } = {}) {
    if (!engineRenderer  || !playersManager || !postProcessing/* || !appTracker*/ || !loreManager) {
      console.warn('missing arguments', {
        engineRenderer,
        playersManager,
        postProcessing,
        // appTracker,
        loreManager,
      });
      debugger;
      throw new Error('missing arguments');
    }
    this.engineRenderer = engineRenderer;
    this.playersManager = playersManager;
    this.postProcessing = postProcessing;
    // this.appTracker = appTracker;
    this.loreManager = loreManager;
    this.bindingsList = [];

    // auto camera state
    this.locationTargets = [];
    this.characterTargets = [];
    this.propTargets = [];
    // this.appTrackerCleanup = null;

    // XXX listen for lore manager here
    this.#listen();
  }

  #listen() {
    // XXX bind to lore instead of app manager
    // const bindables = Array.from(this.#actors.values())
    //   .map(actor => {
    //     return {
    //       name: normalizeName(actor.spec.name),
    //       type: actor.type,
    //       value: actor,
    //     };
    //   }).concat(
    //     this.#locations.map(location => {
    //       return {
    //         name: normalizeName(location.name),
    //         type: 'location',
    //         value: location,
    //       };
    //     })
    //   )

    const lore = this.loreManager.getLore();
    const actorsupdate = () => {
      this.locationTargets = lore.getLocations();
      const actors = lore.getActors();
      this.characterTargets = actors.filter(actor => actor.type === 'character');
      this.propTargets = actors.filter(actor => actor.type === 'object');
    };
    actorsupdate();
    lore.addEventListener('actorsupdate', actorsupdate);

    /* const candidateLocationTargets = new Set();
    const candidateCharacterTargetApps = new Set();
    const candidatePropTargetApps = new Set();

    const updateCenterTarget = () => {
      if (candidateLocationTargets.size > 0) {
        this.locationTargets = Array.from(candidateLocationTargets);
      } else {
        this.locationTargets = [];
      }
    };
    const updateCharacterTarget = () => {
      this.characterTargets = Array.from(candidateCharacterTargetApps);
    };
    const updatePropTarget = () => {
      this.propTargets = Array.from(candidatePropTargetApps);
    };

    const {
      cancel: cancelCenterTargetListen,
    } = this.appTracker.registerAppTracker({
      appManagerName,
      query: app => centerAppTypes.includes(app.appType),
      addCb: app => {
        const centerTarget = app.center ?? app;
        candidateLocationTargets.add(centerTarget);
        updateCenterTarget();
      },
      removeCb: app => {
        const centerTarget = app.center ?? app;
        candidateLocationTargets.delete(centerTarget);
        updateCenterTarget();
      },
    });
    const {
      cancel: cancelCharacterTargetListen,
    } = this.appTracker.registerAppTracker({
      appManagerName,
      query: app => app.appType === 'npc',
      addCb: app => {
        candidateCharacterTargetApps.add(app);
        updateCharacterTarget();
      },
      removeCb: app => {
        candidateCharacterTargetApps.delete(app);
        updateCharacterTarget();
      },
    });
    const {
      cancel: cancelPropTargetListen,
    } = this.appTracker.registerAppTracker({
      appManagerName,
      query: app => app.appType === 'prop',
      addCb: app => {
        candidatePropTargetApps.add(app);
        updatePropTarget();
      },
      removeCb: app => {
        candidatePropTargetApps.delete(app);
        updatePropTarget();
      },
    });
    this.appTrackerCleanup = () => {
      cancelCenterTargetListen();
      cancelCharacterTargetListen();
      cancelPropTargetListen();
    }; */
  }
  addBindings(bindings) {
    this.bindingsList.push(bindings);
  }
  clearBindings() {
    this.bindingsList.length = 0;
  }

  createAutoCamera({
    camera,
  }) {
    return new AutoCamera({
      autoCameraManager: this,
      camera,
    });
  }

  async takeStaticScreenshot(screenshotSizeX = screenshotSize, screenshotSizeY = screenshotSize) {
    const {engineRenderer} = this;
    const {renderer} = engineRenderer;

    const popSize = engineRenderer.pushSize(screenshotSizeX, screenshotSizeY);
    engineRenderer.render({
      postProcessing: false,
    });
    const screenshotBlobPromise = new Promise((accept, reject) => {
      renderer.domElement.toBlob(accept, 'image/jpeg');
    });
    popSize();

    // get blob
    const screenshotBlob = await screenshotBlobPromise;
    return screenshotBlob;
  }
  async takeAutoScreenshot(screenshotSizeX = screenshotSize, screenshotSizeY = screenshotSize) {
    const camera = new THREE.PerspectiveCamera();
    const autoCamera = this.createAutoCamera({
      camera,
    });
    const animation = autoCamera.createEstablishingAnimation({
      animate: false,
    });
    animation.update();
    return autoCamera.capture(screenshotSizeX, screenshotSizeY);
  }
  async takeAutoScreenshots(screenshotSizeX = screenshotSize, screenshotSizeY = screenshotSize, n = 3) {
    const camera = new THREE.PerspectiveCamera();
    const autoCamera = this.createAutoCamera({
      camera,
    });

    const seenFingerprints = new Set();
    const capturePromies = [];
    while (seenFingerprints.size < n) {
      let i;
      for (i = 0; i < numAutoCameraRetries; i++) {
        autoCamera.tick();
        const animation = autoCamera.createCinematicAnimation({
          animate: false,
        });
        const fingerprint = animation.getFingerprint();
        if (!seenFingerprints.has(fingerprint)) {
          seenFingerprints.add(fingerprint);

          animation.update();

          const p = autoCamera.capture(screenshotSizeX, screenshotSizeY);
          capturePromies.push(p);
          break;
        }
      }
      if (i === numAutoCameraRetries) {
        console.warn('failed to find new fingerprint', {
          seenFingerprints,
        });
        break;
      }
    }
    return await Promise.all(capturePromies);
  }
}
