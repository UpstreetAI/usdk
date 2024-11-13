import * as THREE from 'three';
import physicsManager from './physics/physics-manager.js';

import {
  getTopLevelApp,
} from './util.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector2D = new THREE.Vector2();
// const localVector2D2 = new THREE.Vector2();
// const localVector2D3 = new THREE.Vector2();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();
const localRaycaster = new THREE.Raycaster();

//

class FakeMouseEvent {
  constructor(clientX = 0, clientY = 0, deltaX = 0, deltaY = 0, inside = false) {
    this.clientX = clientX;
    this.clientY = clientY;
    this.deltaX = deltaX;
    this.deltaY = deltaY;
    this.inside = inside;
  }
}

export class RaycastManager extends EventTarget {
  constructor({
    engineRenderer,
    cameraManager,
    physicsTracker,
  }) {
    super();

    if (!engineRenderer || !cameraManager || !physicsTracker) {
      throw new Error('missing required argument');
    }
    this.engineRenderer = engineRenderer;
    this.cameraManager = cameraManager;
    this.physicsTracker = physicsTracker;

    this.lastMouseEvent = new FakeMouseEvent();

    this.hoveredPair = [null, null];
  }

  getHoveredPair() {
    return this.hoveredPair[0] ? this.hoveredPair : null;
  }
  getHoveredApp() {
    return this.hoveredPair[0];
  }
  getHoveredPhysicsObject() {
    return this.hoveredPair[1];
  }
  #updateHoveredPair() {
    const {camera, renderer} = this.engineRenderer;
    // set raycaster from camera
    if (!document.pointerLockElement) {
      const e = this.lastMouseEvent;
      const pixelRatio = renderer.getPixelRatio();
      localVector2D.set(
        (e.clientX / renderer.domElement.width * pixelRatio) * 2 - 1,
        -(e.clientY / renderer.domElement.height * pixelRatio) * 2 + 1
      );
    } else {
      localVector2D.set(0, 0);
    }

    localRaycaster.setFromCamera(localVector2D, camera);
    const p = localRaycaster.ray.origin;
    const q = localQuaternion.setFromRotationMatrix(
      localMatrix.lookAt(
        localVector.set(0, 0, 0),
        localRaycaster.ray.direction,
        localVector2.set(0, 1, 0)
      )
    );
    const physicsScene = physicsManager.getScene();
    const intersection = physicsScene.raycast(p, q);
    if (intersection) {
      // get the pair
      let [
        app,
        physicsObject,
      ] = this.physicsTracker.getPairByPhysicsId(intersection.objectId);

      // handle special cases
      app = getTopLevelApp(app);

      this.hoveredPair[0] = app;
      this.hoveredPair[1] = physicsObject;
    } else {
      this.hoveredPair[0] = null;
      this.hoveredPair[1] = null;
    }
  }

  setLastMouseEvent(e) {
    if (e) {
      this.lastMouseEvent.clientX = e.clientX;
      this.lastMouseEvent.clientY = e.clientY;
      this.lastMouseEvent.deltaX = e.deltaX;
      this.lastMouseEvent.deltaY = e.deltaY;
      this.lastMouseEvent.inside = true;
    } else {
      this.lastMouseEvent.inside = false;
    }
  }

  /*getMouseRaycaster = (() => {
    const localVector2D = new THREE.Vector2();
    const localVector2D2 = new THREE.Vector2();
    const localRaycaster = new THREE.Raycaster();
  
    return function(e = this.lastMouseEvent) {
      const {clientX, clientY} = e;
      const {renderer} = this.engineRenderer;
      if (renderer) {
        renderer.getSize(localVector2D2);
        localVector2D.set(
          (clientX / localVector2D2.x) * 2 - 1,
          -(clientY / localVector2D2.y) * 2 + 1
        );
        if (
          localVector2D.x >= -1 && localVector2D.x <= 1 &&
          localVector2D.y >= -1 && localVector2D.y <= 1
        ) {
          localRaycaster.setFromCamera(
            localVector2D,
            this.engineRenderer.camera,
          );
          return localRaycaster;
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  })(); */

  /* getCenterEvent() {
    const {renderer} = this.engineRenderer;
    if (renderer) {
      const size = renderer.getSize(localVector2D3);
      fakeCenterEvent.clientX = size.width / 2;
      fakeCenterEvent.clientY = size.height / 2;
      return fakeCenterEvent;
    } else {
      return null;
    }
  } */

  update() {
    this.#updateHoveredPair();
  }
}