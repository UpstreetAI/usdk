/*
this file is responsible for managing skybox-based logical world scenes.
*/

import * as THREE from 'three';
// import {
//   OctahedronSphereCreator,
// } from '../../../genesis/index.js';
// import {
//   getDoubleSidedGeometry,
// } from '../../../zine/zine-geometry-utils.js';
// import {
//   PhysicsTracker,
// } from './physics/physics-tracker.js';
import {
  PortalMesh,
} from '../../../zine-aux/meshes/portal-mesh.js';
// import {
//   App,
// } from '../../../app-runtime/app.js';
import {
  AppManager,
} from '../../app-manager.js';
// import physicsManager from '../../physics/physics-manager.js';

//

// flip indices
// const invertGeometry = geometry => {
//   for (let i = 0; i < geometry.index.count; i += 3) {
//     const a = geometry.index.array[i];
//     const b = geometry.index.array[i + 1];
//     const c = geometry.index.array[i + 2];
//     geometry.index.array[i] = c;
//     geometry.index.array[i + 1] = b;
//     geometry.index.array[i + 2] = a;
//   }
//   return geometry;
// };

//

export class PortalManager extends THREE.Object3D {
  constructor({
    engineRenderer,
    playersManager,
    importManager,
    appContextFactory,
  }) {
    super();

    if (!engineRenderer || !playersManager || !importManager || !appContextFactory) {
      debugger;
    }

    this.engineRenderer = engineRenderer;
    this.playersManager = playersManager;
    this.importManager = importManager;
    this.appContextFactory = appContextFactory;
  }
  async addPortal(app, json) {
    // console.log('portal json', json);
    const {
      portalContents = [
        {
          start_url: '/models/skybox.glb',
        },
      ],
    } = json;

    //

    const portalAppManager = new AppManager({
      importManager: this.importManager,
      appContextFactory: this.appContextFactory,
    });
    let portalContentsApps = [];
    for (let i = 0; i < portalContents.length; i++) {
      const {
        start_url,
      } = portalContents[i];

      // const portalContentApp = new App();
      // portalContentApps.add(portalContentApp);

      (async () => {
        const portalContentsApp = await portalAppManager.addAppAsync({
          contentId: start_url,
          // position,
          // quaternion,
          // scale,
          // components,
        });
        globalThis.portalContentsApp = portalContentsApp;
        portalContentsApps.push(portalContentsApp);
      })();
    }

    //

    const {renderer, camera} = this.engine.engineRenderer;

    const portalScene = new THREE.Scene();
    portalScene.autoUpdate = false;

    portalScene.add(portalAppManager);
    portalAppManager.updateMatrixWorld();

    // const size = 2;

    const portalCamera = camera.clone();
    const portalMesh = new PortalMesh({
        renderer,
        portalScene,
        portalCamera,
    });
    this.add(portalMesh);
    portalMesh.updateMatrixWorld();
    portalMesh.onBeforeRender = () => {
      console.log('render portal');
    };
    // globalThis.portalMesh = portalMesh;

    // support walking through
    {
      const localPlayer = this.playersManager.getLocalPlayer();
      // XXX
    }

    // render loop
    const _recurse = () => {
      frame = requestAnimationFrame(_recurse);

      const xrCamera = renderer.xr.getSession() ? renderer.xr.getCamera(camera) : camera;
      portalCamera.position.copy(xrCamera.position);
      portalCamera.quaternion.copy(xrCamera.quaternion);
      portalCamera.updateMatrixWorld();

      const now = performance.now();
      portalMesh.update(now);
    };
    let frame = requestAnimationFrame(_recurse);

    //

    app.addEventListener('destroy', () => {
      cancelAnimationFrame(frame);
    });
  }
  removePortal(app, json) {
    console.log('not implemented');
    debugger;
  }
}