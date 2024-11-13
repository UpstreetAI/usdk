import * as THREE from 'three';
// import ioManager from './io-manager.js';
// import {
//   IoManager,
// } from './io-manager.js';
// import {playersManager} from './players-manager.js';
// import {
//   PlayersManager,
// } from './players-manager.js';
import physicsManager from './physics/physics-manager.js';
import avatarsWasmManager from './avatars/avatars-wasm-manager.js';
// import metaversefileApi from './metaversefile-api.js';
// import {getRenderer, sceneLowPriority, camera} from './renderer.js';
// import cameraManager from './camera-manager.js';
// import {
//   CameraManager,
// } from './camera-manager.js';
// import game from './game.js';
import {
  // buildMaterial,
  highlightMaterial,
  // selectMaterial,
  // hoverMaterial,
  // hoverEquipmentMaterial,
} from './shaders.js';
import {getTopLevelApp} from './util.js';

// import {maxGrabDistance} from './constants.js';
// import {snapPosition} from './util.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
// const localVector3 = new THREE.Vector3();
// const localVector4 = new THREE.Vector3();
// const localVector5 = new THREE.Vector3();
// const localVector6 = new THREE.Vector3();
// const localVector7 = new THREE.Vector3();
// const localVector8 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
// const localQuaternion2 = new THREE.Quaternion();
// const localQuaternion3 = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();
// const localMatrix3 = new THREE.Matrix4();
// const localBox = new THREE.Box3();

const rotationSnap = Math.PI / 6;
const maxGridSnap = 32;
const minGridSnap = 0
let highlightedPhysicsObject = null;
// let highlightedPhysicsId = 0;
let transformIndicators = null;

/* const getPhysicalPosition = box => {
  return localVector7.set(
    (box.min.x + box.max.x) / 2,
    box.min.y,
    (box.min.z + box.max.z) / 2
  );
} */

/* const _updateGrabbedObject = (
  o,
  grabMatrix,
  offsetMatrix,
  physicsScene,
  {collisionEnabled, handSnapEnabled, gridSnap}
) => {
  grabMatrix.decompose(localVector, localQuaternion, localVector2);
  offsetMatrix.decompose(localVector3, localQuaternion2, localVector4);

  const offset = localVector3.length();

  localMatrix
    .multiplyMatrices(grabMatrix, offsetMatrix)
    .decompose(localVector5, localQuaternion3, localVector6);

  let physicalOffset = null;
  const grabbedPhysicsObjects = o.getPhysicsObjects();

  // Compute physical local bounding box and it's position offset from app.position.
  // THREE.Box3.getCenter() has a console error, so I calculate manually.
  if(grabbedPhysicsObjects) {
    localBox.makeEmpty();
    for(const physicsObject of grabbedPhysicsObjects) {
      const geometry = physicsObject.physicsMesh.geometry;
      geometry.computeBoundingBox();
      localBox.union(geometry.boundingBox);
    }
    transformIndicators.bb = localBox;
    physicalOffset = getPhysicalPosition(localBox);
  }

  // raycast from localPlayer in direction of camera angle
  const collision = collisionEnabled && physicsScene.raycast(localVector, localQuaternion);

  // raycast from grabbed object down perpendicularly
  localQuaternion2.setFromAxisAngle(localVector2.set(1, 0, 0), -Math.PI * 0.5);
  const downCollision = collisionEnabled && physicsScene.raycast(localVector5, localQuaternion2);

  if (collision) {
    const {point} = collision;
    localVector6.fromArray(point);
  }

  if (downCollision) {
    const {point} = downCollision;
    localVector4.fromArray(point);
  }

  const collisionIsWithinOffset = localVector.distanceTo(localVector6) < offset;
  const collisionIsAboveGround = localVector4.y < localVector6.y;

  // Did the ray collide with any other object than the grabbed object? Need this check because on the first frame
  // it collides with the grabbed object, although physical actors are being disabled. This caused teleport issue.
  const collNonGrabbedObj = !!collision && !o.physicsObjects.some(obj => obj.physicsId === collision.objectId);

  // if collision point is closer to the player than the grab offset and collisionDown point
  // is below collision point then place the object at collision point
  if (collNonGrabbedObj && !!downCollision && collisionIsWithinOffset && collisionIsAboveGround) {
    localVector5.copy(localVector6).sub(physicalOffset);
  }

  const objectOverlapsVertically = localVector8.copy(localVector5).add(physicalOffset).y < localVector4.y;

  // if grabbed object would overlap vertically then place object at downCollision point
  if (!!downCollision && objectOverlapsVertically) {
    localVector5.setY(localVector4.sub(physicalOffset).y);
  }

  o.position.copy(localVector5);

  const handSnap =
    !handSnapEnabled ||
    offset >= maxGrabDistance ||
    !!collision ||
    !!downCollision;
  if (handSnap) {
    snapPosition(o, gridSnap);
    o.quaternion.setFromEuler(o.savedRotation);
  } else {
    o.quaternion.copy(localQuaternion3);
  }

  o.updateMatrixWorld();

  return {
    handSnap,
  };
} */

/* const _createTransformIndicators = () => {
  transformIndicators = metaversefileApi.createApp();
  (async () => {
    const {importModule} = metaversefileApi.useDefaultModules();
    const m = await importModule('transformIndicators');
    await transformIndicators.addModule(m);
  })();
  transformIndicators.targetApp = null;
  sceneLowPriority.add(transformIndicators);
} */

//

const makeHighlightMesh = (baseMaterial) => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = baseMaterial.clone();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  // mesh.physicsId = 0;
  // mesh.onBeforeRender = () => {
  //   debugger;
  // }
  return mesh;
};
class PhysicsTarget extends THREE.Object3D {
  constructor() {
    super();

    // children
    this.highlightMesh = makeHighlightMesh(highlightMaterial);
    this.highlightMesh.visible = false;
    this.add(this.highlightMesh);
    this.highlightMesh.updateMatrixWorld();

    // attributes
    this.targetApp = null;
    this.targetPhysicsObject = -1;
    this.useFactor = 0;
  }

  canUse() {
    return !!this.targetApp;
  }

  setTarget(targetApp, targetPhysicsObject) {
    // console.log('set target', targetApp, targetPhysicsObject?.physicsMesh);
    this.targetApp = targetApp;
    this.targetPhysicsObject = targetPhysicsObject;

    if (targetApp && targetPhysicsObject) {
      const {physicsMesh} = targetPhysicsObject;
      this.highlightMesh.geometry = physicsMesh.geometry;
      // globalThis.newGeometry = physicsMesh.geometry;
      // globalThis.newMatrixWorld = physicsMesh.matrixWorld;
      physicsMesh.matrixWorld
        .decompose(
          this.highlightMesh.position,
          this.highlightMesh.quaternion,
          this.highlightMesh.scale
        );
      this.highlightMesh.updateMatrixWorld();

      // XXX unlock this with grab use mesh
      // this.physicsTarget.position.setFromMatrixPosition(physicsObject.physicsMesh.matrixWorld);
      // this.physicsTarget.quaternion.copy(this.cameraManager.camera.quaternion);
      // this.physicsTarget.updateMatrixWorld();
    }
  }
  setUseFactor(useFactor) {
    const lastUseFactor = this.useFactor;
    this.useFactor = useFactor;
    if (lastUseFactor < 1 && useFactor >= 1) {
      this.dispatchEvent({
        type: 'use',
      });
    }
    // this.physicsTarget.setComponent('value', useFactor);
  }
}

//

export class InteractionManager extends THREE.Object3D {
  constructor({
    cameraManager,
    playersManager,
    appManagerContext,
    // ioManager,
    engineRenderer,
    physicsTracker,
  }) {
    super();

    if (!cameraManager || !playersManager || !appManagerContext /*|| !ioManager*/ || !engineRenderer || !physicsTracker) {
      console.warn('bad args', {
        cameraManager,
        playersManager,
        appManagerContext,
        // ioManager,
        engineRenderer,
        physicsTracker,
      });
      debugger;
      throw new Error('missing required parameters');
    }

    // members
    this.cameraManager = cameraManager;
    this.playersManager = playersManager;
    this.appManagerContext = appManagerContext;
    // this.ioManager = ioManager;
    this.engineRenderer = engineRenderer;
    this.physicsTracker = physicsTracker;

    // locals
    this.physicsTarget = new PhysicsTarget();
    this.physicsTarget.addEventListener('use', e => {
      let {targetApp} = this.physicsTarget;
      const localPlayer = this.playersManager.getLocalPlayer();
      
      targetApp = getTopLevelApp(targetApp);
      // console.log('use target app', targetApp, targetApp.components, targetApp.hasComponent('activate'));

      const _clearActivateAction = () => {
        if (localPlayer.actionManager.hasActionType('activate')) {
          localPlayer.actionManager.removeActionType('activate');
        } else {
          console.warn('no activate action');
          debugger;
        }
      };
      _clearActivateAction();

      if (targetApp.hasComponent('activate')) {
        localPlayer.activate(targetApp);
      } else if (
        targetApp.hasComponent('wear') ||
        targetApp.hasComponent('sit')
      ) {
        localPlayer.wear(targetApp);
      }
    });
    this.physicsTarget.visible = false;
    this.add(this.physicsTarget);
    this.physicsTarget.updateMatrixWorld();

    this.capsuleCollisionApp = null;
    this.capsuleCollisionPhysicsObject = null;
    this.lastCapsuleCollisionPhysicsObject = null;

    this.gridSnap = minGridSnap;
    this.editMode = false;
  }

  getCapsuleCollisionApp() {
    return this.capsuleCollisionApp;
  }
  getCapsuleCollisionPhysicsObject() {
    return this.capsuleCollisionPhysicsObject;
  }

  canUse() {
    return this.physicsTarget.canUse();
  }

  canInteractImmediate() {
    return !!this.capsuleCollisionApp;
  }
  interact() {
    const app = this.capsuleCollisionApp;
    const physicsId = this.capsuleCollisionPhysicsObject.physicsId;
    this.dispatchEvent({
      type: 'interact',
      app,
      physicsId,
    });
  }

  grab(object) {
    const localPlayer = this.playersManager.getLocalPlayer();
    localPlayer.grab(object);
    transformIndicators.targetApp = object;
    this.gridSnap = minGridSnap;
    // this.editMode = false;
  }

  getGrabAction(i) {
    const targetHand = i === 0 ? 'left' : 'right';
    const localPlayer = this.playersManager.getLocalPlayer();
    const grabAction = localPlayer.actionManager.findAction(
      (action) => action.type === 'grab' && action.hand === targetHand
    );
    return grabAction;
  }

  getGrabbedObject(i) {
    const grabAction = this.getGrabAction(i);
    const grabbedObjectInstanceId = grabAction?.instanceId;
    const result = grabbedObjectInstanceId
      ? metaversefileApi.getAppByInstanceId(grabbedObjectInstanceId)
      : null;
    return result;
  }

  async toggleEditMode() {
    this.editMode = !this.editMode;
    this.setGridSnap(minGridSnap);
    // transformIndicators.targetApp = null;
    if (this.editMode) {
      // if (!this.cameraManager.pointerLockElement) {
      //   await this.cameraManager.requestPointerLock();
      // }
      // if (this.game.getMouseSelectedObject()) {
      //   this.game.setMouseSelectedObject(null);
      // }
      if (this.getGrabbedObject(0)) {
        const localPlayer = this.playersManager.getLocalPlayer();
        localPlayer.ungrab();
      }
      // this.showUi();
      this.drawPhone();
    } else {
      // this.hideUi();
      this.undrawPhone();
    }
  }

  /* setHighlightPhysicsMesh(mesh) {
    debugger;
    this.highlightPhysicsMesh = mesh;
    this.highlightPhysicsMesh.visible = false;
    this.engineRenderer.sceneLowPriority.add(this.highlightPhysicsMesh);
  } */

  /* showUi() {
    this.dispatchEvent(new MessageEvent('showui'));
  }

  hideUi() {
    this.dispatchEvent(new MessageEvent('hideui'));
  } */

  drawPhone() {
    const localPlayer = this.playersManager.getLocalPlayer();
    if (!localPlayer.actionManager.hasActionType('readyGrab')) {
      localPlayer.actionManager.addAction({
        type: 'readyGrab'
      });
    }
  }

  undrawPhone() {
    const localPlayer = this.playersManager.getLocalPlayer();
    localPlayer.actionManager.removeActionType('readyGrab');
  }

  menuClick() {
    if (this.getGrabbedObject(0)) {
      const localPlayer = this.playersManager.getLocalPlayer();
      localPlayer.ungrab();
  
      transformIndicators.targetApp = null;
      this.undrawPhone();
      this.hideUi();
      this.setGridSnap(minGridSnap);
    } else {
      // if (highlightedPhysicsObject) {
      //   this.grab(highlightedPhysicsObject);
      // }
    }
  }

  menuDelete() {
    const {targetApp} = this.physicsTarget;

    const appManager = this.appManagerContext.getAppManager();
    if (targetApp) {
      appManager.removeApp(targetApp);
    }

    const grabbedObject = this.getGrabbedObject(0);
    const mouseSelectedObject = this.game.getMouseSelectedObject();
    const mouseHoverObject = this.game.getMouseHoverObject();
    
    if (grabbedObject) {
      const localPlayer = this.playersManager.getLocalPlayer();
      localPlayer.ungrab();
      appManager.removeTrackedApp(grabbedObject.instanceId);
    // } else if (highlightedPhysicsObject) {
    //   appManager.removeTrackedApp(highlightedPhysicsObject.instanceId);
    //   highlightedPhysicsObject = null;
    } else if (mouseSelectedObject) {
      appManager.removeTrackedApp(mouseSelectedObject.instanceId);
      if (mouseHoverObject === mouseSelectedObject) {
        this.game.setMouseHoverObject(null);
      }
      this.game.setMouseSelectedObject(null);
    }
  }

  menuGridSnap() {
    if (this.gridSnap === minGridSnap) {
      this.setGridSnap(maxGridSnap);
    } else if (this.gridSnap > 1) {
      this.setGridSnap(this.gridSnap / 2);
    } else {
      this.setGridSnap(minGridSnap);
    }
    this.dispatchEvent(
      new MessageEvent('setgridsnap', {
        data: {gridSnap: this.gridSnap},
      })
    );
  }

  setGridSnap(gridSnap) {
    this.gridSnap = gridSnap;
    this.dispatchEvent(
      new MessageEvent('setgridsnap', {
        data: {gridSnap: this.gridSnap},
      })
    );
  }

  getGridSnap() {
    if (this.gridSnap === 0) {
      return 0;
    } else {
      return 4 / this.gridSnap;
    }
  }

  canRotate() {
    return !!this.getGrabbedObject(0);
  }

  menuRotate(direction) {
    const object = this.getGrabbedObject(0);
    object.savedRotation.y -= direction * rotationSnap;
  }

  canPush() {
    return !!this.getGrabbedObject(0);
  }

  menuPush(direction) {
    const localPlayer = this.playersManager.getLocalPlayer();
    const grabAction = localPlayer.actionManager.findAction(
      (action) => action.type === 'grab' && action.hand === 'left'
    );
    if (grabAction) {
      const matrix = localMatrix.fromArray(grabAction.matrix);
      matrix.decompose(localVector, localQuaternion, localVector2);
      localVector.z += direction * 0.1;
      matrix
        .compose(localVector, localQuaternion, localVector2)
        .toArray(grabAction.matrix);
    } else {
      console.warn('trying to push with no grab object');
    }
  }

  #getCapsuleCollisionPhysicsObject() {
    let result = null;

    const localPlayer = this.playersManager.getLocalPlayer();
    if (localPlayer.avatar) {
      this.physicsTarget.visible = false;
      this.physicsTarget.setTarget(null, null);
      this.physicsTarget.setUseFactor(0);

      const avatarHeight = localPlayer.avatar ? localPlayer.avatar.height : 0;
      localVector.copy(localPlayer.position)
        .add(localVector2.set(0, avatarHeight * (1 - localPlayer.getCrouchFactor()) * 0.5, -0.3).applyQuaternion(localPlayer.quaternion));

      const physicsScene = physicsManager.getScene();
      physicsScene.disableGeometryQueries(localPlayer.characterPhysics.characterController);
        
      const radius = 1;
      const halfHeight = 0.1;
      const collision = physicsScene.getCollisionObject(
        radius,
        halfHeight,
        localVector,
        localPlayer.quaternion
      );
      if (collision) {
        const physicsId = collision.objectId;

        result = this.physicsTracker.getPhysicsObjectByPhysicsId(physicsId);
        if (result?.isTerrain) {
          result = null;
        }
      }

      physicsScene.enableGeometryQueries(localPlayer.characterPhysics.characterController);
    }

    return result;
  }

  update(timestamp, timeDiff) {
    const localPlayer = this.playersManager.getLocalPlayer();

    if (localPlayer.avatar) {
      const _updateCapsuleCollision = () => {
        this.capsuleCollisionPhysicsObject = this.#getCapsuleCollisionPhysicsObject();
        if (this.capsuleCollisionPhysicsObject) {
          this.capsuleCollisionApp = this.physicsTracker.getAppByPhysicsId(this.capsuleCollisionPhysicsObject.physicsId);

          this.capsuleCollisionApp = getTopLevelApp(this.capsuleCollisionApp);

          if (this.capsuleCollisionApp.getComponent('interactive') === false) {
            this.capsuleCollisionPhysicsObject = null;
            this.capsuleCollisionApp = null;
          }
        } else {
          this.capsuleCollisionApp = null;
        }
        
        if (this.capsuleCollisionPhysicsObject !== this.lastCapsuleCollisionPhysicsObject) {
          this.dispatchEvent({
            type: 'capsulecollisionupdate',
            app: this.capsuleCollisionApp,
            physicsObject: this.capsuleCollisionPhysicsObject,
          });
        }
        this.lastCapsuleCollisionPhysicsObject = this.capsuleCollisionPhysicsObject;
      };
      _updateCapsuleCollision();

      const _updateGrab = () => {
        // const {renderer} = this.engineRenderer;
        /* const _isWear = o => localPlayer.actionManager.findAction(action =>
          action.type === 'wear' &&
          action.instanceId === o.instanceId
        ); */

        this.physicsTarget.visible = false;
        this.physicsTarget.setTarget(null, null);
        this.physicsTarget.setUseFactor(0);

        const app = this.capsuleCollisionApp;
        const physicsObject = this.capsuleCollisionPhysicsObject;
        if (app && physicsObject) {
          this.physicsTarget.setTarget(app, physicsObject);
          const useFactor = avatarsWasmManager.physxWorker.getActionInterpolantAnimationAvatar(localPlayer.avatar.animationAvatarPtr, 'activate', 1);
          this.physicsTarget.setUseFactor(useFactor);
          this.physicsTarget.visible = true;
        }
      };
      _updateGrab();

      /* const _updateGrab = () => {
        const _isWear = (o) =>
          localPlayer.actionManager.findAction(
            action => action.type === 'wear' && action.instanceId === o.instanceId);

        for (let i = 0; i < 2; i++) {
          const grabAction = this.getGrabAction(i);
          const grabbedObject = this.getGrabbedObject(i);
          if (grabbedObject && !_isWear(grabbedObject)) {
            let position = null;
            let quaternion = null;
            if (renderer.xr.getSession()) {
              const h = localPlayer[grabAction.hand === 'left' ? 'leftHand' : 'rightHand'];
              position = h.position;
              quaternion = h.quaternion;
            } else {
              position = localVector2.copy(localPlayer.position);
              quaternion = this.cameraManager.camera.quaternion;
            }

            localMatrix.compose(position, quaternion, localVector.set(1, 1, 1));

            _updateGrabbedObject(
              grabbedObject,
              localMatrix,
              localMatrix3.fromArray(grabAction.matrix),
              physicsScene,
              {
                collisionEnabled: true,
                handSnapEnabled: true,
                gridSnap: this.getGridSnap(),
              }
            );
          }
        }
      };
      _updateGrab();

      const _handlePush = () => {
        if (this.canPush()) {
          if (this.ioManager.keys.forward) {
            this.menuPush(-1);
          } else if (this.ioManager.keys.backward) {
            this.menuPush(1);
          }
        }
      };
      _handlePush();

      const _handlePhysicsHighlight = physicsScene => {
        highlightedPhysicsObject = null;

        if (this.editMode) {
          const {position, quaternion} = renderer.xr.getSession()
            ? localPlayer.leftHand
            : localPlayer;
          const collision = physicsScene.raycast(position, quaternion);
          if (collision) {
            const physicsId = collision.objectId;
            const app = metaversefileApi.getAppByPhysicsId(physicsId);
            if(!app.getComponent('invincible')) {
              highlightedPhysicsObject = app;
              highlightedPhysicsId = physicsId;
            }
          }
        }
      };
      _handlePhysicsHighlight(physicsScene);

      const _updatePhysicsHighlight = () => {
        this.highlightPhysicsMesh.visible = false;

        if (highlightedPhysicsObject) {
          const physicsId = highlightedPhysicsId;

          highlightedPhysicsObject.updateMatrixWorld();

          const physicsObject = metaversefileApi.getPhysicsObjectByPhysicsId(physicsId);
          if (physicsObject) {
            const {physicsMesh} = physicsObject;
            this.highlightPhysicsMesh.geometry = physicsMesh.geometry;
            this.highlightPhysicsMesh.matrixWorld
              .copy(physicsMesh.matrixWorld)
              .decompose(
                this.highlightPhysicsMesh.position,
                this.highlightPhysicsMesh.quaternion,
                this.highlightPhysicsMesh.scale
              );

            this.highlightPhysicsMesh.material.uniforms.uTime.value = (timestamp % 1500) / 1500;
            this.highlightPhysicsMesh.material.uniforms.uTime.needsUpdate = true;
            this.highlightPhysicsMesh.material.uniforms.uColor.value.setHex(
              buildMaterial.uniforms.uColor.value.getHex()
            );
            this.highlightPhysicsMesh.material.uniforms.uColor.needsUpdate = true;
            this.highlightPhysicsMesh.visible = true;
            this.highlightPhysicsMesh.updateMatrixWorld();
          }
        }
      };
      _updatePhysicsHighlight();

      const _handleCellphoneUndraw = () => {
        if(localPlayer.avatar?.cellphoneUndrawTime >= 1000) {
          localPlayer.removeActionType('readyGrab');
        }
      };
      _handleCellphoneUndraw(); */
    } else {
      this.capsuleCollisionPhysicsObject = null;
    }
  }
}