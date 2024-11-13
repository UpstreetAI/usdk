import * as THREE from 'three';
// import {canvas, getRenderer, camera} from './renderer.js';
import physicsManager from './physics/physics-manager.js';
import {shakeAnimationSpeed, minFov, maxFov, midFov, wideFov} from './constants.js';
import Simplex from './simplex-noise.js';
import easing from './easing.js';
import {cameraSpeed} from './constants/camera-constants.js';
import mobile from 'is-mobile';
const isMobile = mobile();

const cubicBezier = easing(0, 1, 0, 1);
// const cubicBezier2 = easing(0.5, 0, 0.5, 1);
const defaultLerpTime = 2000;

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
// const localVector5 = new THREE.Vector3();
// const localVector6 = new THREE.Vector3();
// const localVector7 = new THREE.Vector3();
// const localVector8 = new THREE.Vector3();
// const localVector9 = new THREE.Vector3();
const localVector10 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
// const localQuaternion3 = new THREE.Quaternion();
// const localQuaternion4 = new THREE.Quaternion();
const localEuler = new THREE.Euler();
const localMatrix = new THREE.Matrix4();

/*
Anon: "Hey man, can I get your autograph?"
Drake: "Depends. What's it worth to you?"
Anon: "Your first born child"
Drake: "No thanks. I don't think your child would be worth very much."
*/

const zeroVector = new THREE.Vector3(0, 0, 0);
const upVector = new THREE.Vector3(0, 1, 0);
const rightVector = new THREE.Vector3(1, 0, 0);
const downQuaternion = new THREE.Quaternion()
   .setFromAxisAngle(rightVector, Math.PI / 2);
const identityQuaternion = new THREE.Quaternion();
const cameraOffsetDefault = 0.65;
const maxFocusTime = 300;

let isLandscape = isMobile && window.innerWidth > window.innerHeight;
const cameraOffset = new THREE.Vector3(0,0,0) // !isMobile ? new THREE.Vector3(0,0,0) : new THREE.Vector3(isLandscape ? -.5 : -.3, 0, isLandscape ? -1.75 : -2.0);

let cameraOffsetTargetZ = cameraOffset.z;
let cameraOffsetLimitZ = Infinity;

const freeCameraSpeed = 0.05;
const freeCameraSpeedRunMultiplier = 5;

// let cameraOffsetZ = cameraOffset.z;
const rayVectorZero = new THREE.Vector3(0,0,0);
// const rayVectorUp = new THREE.Vector3(0,1,0);
// const rayStartPos = new THREE.Vector3(0,0,0);
// const rayDirection = new THREE.Vector3(0,0,0);
// const rayOffsetPoint = new THREE.Vector3(0,0,0);
// const rayMatrix = new THREE.Matrix4();
// const rayQuaternion = new THREE.Quaternion();
// const rayOriginArray = [new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0)]; // 6 elements
// const rayDirectionArray = [new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion(),new THREE.Quaternion()]; // 6 elements

/* function getNormal(u, v) {
  return localPlane.setFromCoplanarPoints(zeroVector, u, v).normal;
} */
/* function signedAngleTo(u, v) {
  // Get the signed angle between u and v, in the range [-pi, pi]
  const angle = u.angleTo(v);
  console.log('signed angle to', angle, u.dot(v));
  return (u.dot(v) >= 0 ? 1 : -1) * angle;
} */
/* function signedAngleTo(a, b, v) {
  const s = v.crossVectors(a, b).length();
  // s = length(cross_product(a, b))
  const c = a.dot(b);
  const angle = Math.atan2(s, c);
  console.log('get signed angle', s, c, angle);
  return angle;
} */

const getSideOfY = (() => {
  const localVector = new THREE.Vector3();
  const localVector2 = new THREE.Vector3();
  const localQuaternion = new THREE.Quaternion();
  const localPlane = new THREE.Plane();

  function getSideOfY(a, b) {
    localQuaternion.setFromRotationMatrix(
      localMatrix.lookAt(
        zeroVector,
        a,
        upVector
      )
    );
    const rightVector = localVector.set(1, 0, 0).applyQuaternion(localQuaternion);
    localPlane.setFromNormalAndCoplanarPoint(rightVector, a);
    const distance = localPlane.distanceToPoint(b, localVector2);
    return distance >= 0 ? 1 : -1;
  }
  return getSideOfY;
})();

// const lastCameraQuaternion = new THREE.Quaternion();
// let lastCameraZ = 0;
// let lastCameraValidZ = 0;

const seed = 'camera';
const shakeNoise = new Simplex(seed);

class Shake extends THREE.Object3D {
  constructor(intensity, startTime, radius, decay) {
    super();

    this.intensity = intensity;
    this.startTime = startTime;
    this.radius = radius;
    this.decay = decay;
  }
}

export class CameraManager extends EventTarget {
  constructor({
    // camera,
    engine,
    engineRenderer,
    postProcessing,
    playersManager,
    pointerLockManager,
    appManagerContext,
    // ioBus,
  })  {
    super();

    if (/*!camera || */!engine || !engineRenderer || !postProcessing || !playersManager || !pointerLockManager || !appManagerContext) {
      console.warn('missing required arguments', {
        engine,
        engineRenderer,
        postProcessing,
        playersManager,
        pointerLockManager,
        appManagerContext,
      });
      throw new Error('missing required arguments');
    }
    // this.camera = camera;
    this.engine = engine;
    this.engineRenderer = engineRenderer;
    this.postProcessing = postProcessing;
    this.playersManager = playersManager;
    this.pointerLockManager = pointerLockManager;
    this.appManagerContext = appManagerContext;
    // this.ioBus = ioBus;

    const {camera} = this.engineRenderer;

    // this.pointerLockElement = null;
    // this.pointerLockEpoch = 0;
    this.mouseDown = false;
    this.mouseMoved = [0, 0];
    this.shakes = [];
    this.focus = false;
    this.lastFocusChangeTime = 0; // XXX this needs to be removed
    this.fovFactor = 0;
    this.lastNonzeroDirectionVector = new THREE.Vector3(0, 0, -1);

    // this.targetType = 'dynamic';
    this.target = null;
    this.target2 = null;
    this.lastTarget = null;
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.targetQuaternion = new THREE.Quaternion();
    this.targetFov = camera.fov;
    this.sourcePosition = new THREE.Vector3();
    this.sourceQuaternion = new THREE.Quaternion();
    this.sourceFov = camera.fov;
    this.lerpStartTime = 0;
    this.lastTimestamp = 0;
    this.lerpTime = defaultLerpTime;
    this.cinematicScript = null;
    this.cinematicScriptStartTime = -1;
    this.controllerFns = [];
    this.lastMode = 'firstperson';

    // bind decapitation
    {
      this.engineRenderer.onBeforeRenders.push(() => {
        this.decapitateLocalPlayer();
      });
      this.engineRenderer.onAfterRenders.push(() => {
        this.undecapitateLocalPlayer();
      });
    }

    // if mobile, update camera offset when screen orientation changes
    if (isMobile) {
      // if screen doesnt exist, return
      if (!window.screen || !window.screen.orientation) return;

      // Change offset on orientation change
      window.screen.orientation.addEventListener("change", (event) => {
        isLandscape = event.target.type.includes('landscape');
        cameraOffset.set(isLandscape ? -.5 : -.3, 0, isLandscape ? -1.75 : -2.0);
        camera.position.add(localVector.copy(this.getCameraOffset()).applyQuaternion(camera.quaternion));
      });
    }
  }

  /* initializeMode() {
    this.ioBus.sendMessage('cameraMode', {
      mode: 'follow',
    });
  } */

  getCamera() {
    return this.engineRenderer.camera;
  }

  focusCamera(position) {
    const {camera} = this.engineRenderer;
    camera.lookAt(position);
    camera.updateMatrixWorld();
  }

  getMode() {
    if (this.target || this.cinematicScript || this.controllerFns.length > 0) {
      return 'isometric';
    } else {
      return cameraOffset.z > -0.5 ? 'firstperson' : 'isometric';
    }
  }

  #isDecapitated() {
    return (this.getMode() === 'firstperson' && !this.target && !this.controllerFns.length > 0) ||
      !!this.engineRenderer.renderer.xr.getSession();
  }
  decapitateLocalPlayer() { // XXX move this to the players manager
    const localPlayer = this.playersManager.getLocalPlayer();
    if (localPlayer.avatar) {
      const decapitated = this.#isDecapitated();
      if (decapitated) {
        localPlayer.avatar.decapitate();
      } else {
        localPlayer.avatar.undecapitate();
      }
    }
  }
  undecapitateLocalPlayer() {
    const localPlayer = this.playersManager.getLocalPlayer();
    if (localPlayer.avatar) {
      const decapitated = this.#isDecapitated();
      if (decapitated) {
        localPlayer.avatar.undecapitate();
      }
    }
  }

  getCameraOffset() {
    return cameraOffset;
  }

  handleTouchMove(e) {
    if (!this.controllerFn) {
      const {x, y} = e;
      const {camera} = this.engineRenderer;

      camera.position.add(localVector.copy(this.getCameraOffset()).applyQuaternion(camera.quaternion));

      camera.rotation.y -= x * cameraSpeed;
      camera.rotation.x -= y * cameraSpeed;
      camera.rotation.x = Math.min(Math.max(camera.rotation.x, -Math.PI * 0.35), Math.PI / 2);
      camera.quaternion.setFromEuler(camera.rotation);

      camera.position.sub(localVector.copy(this.getCameraOffset()).applyQuaternion(camera.quaternion));

      camera.updateMatrixWorld();

      if (!this.target) {
        this.targetQuaternion.copy(camera.quaternion);
      }
    }
  }

  handleMouseDown(e) {
    this.mouseDown = true;
    this.mouseMoved[0] = 0;
    this.mouseMoved[1] = 0;
  }
  handleMouseUp(e) {
    this.mouseDown = false;
  }
  handleMouseMove(e) {
    if (this.controllerFns.length === 0) {
      const {movementX, movementY} = e;
      const {camera} = this.engineRenderer;

      camera.position.add(localVector.copy(this.getCameraOffset()).applyQuaternion(camera.quaternion));

      camera.rotation.y -= movementX * cameraSpeed;
      camera.rotation.x -= movementY * cameraSpeed;
      camera.rotation.x = Math.min(Math.max(camera.rotation.x, -Math.PI * 0.35), Math.PI / 2);
      camera.quaternion.setFromEuler(camera.rotation);

      camera.position.sub(localVector.copy(this.getCameraOffset()).applyQuaternion(camera.quaternion));

      camera.updateMatrixWorld();

      if (!this.target) {
        this.targetQuaternion.copy(camera.quaternion);
      }

      this.mouseMoved[0] += Math.abs(movementX);
      this.mouseMoved[1] += Math.abs(movementY);
    }
  }
  lastMouseDownDragged() {
    const dragDistance = Math.sqrt(
      this.mouseMoved[0]*this.mouseMoved[0] +
      this.mouseMoved[1]*this.mouseMoved[1]
    );
    return dragDistance > 5;
  }

  handleWheelEvent(e) {
    if (!this.target && this.controllerFns.length === 0) {
      cameraOffsetTargetZ = Math.min(cameraOffset.z - e.deltaY * 0.01, 0);
    }
  }

  addShake(position, intensity, radius, decay) {
    const startTime = performance.now();
    const shake = new Shake(intensity, startTime, radius, decay);
    shake.position.copy(position);
    this.shakes.push(shake);
    return shake;
  }

  flushShakes() {
    if (this.shakes.length > 0) {
      const now = performance.now();
      this.shakes = this.shakes.filter(shake => now < shake.startTime + shake.decay);
    }
  }

  getShakeFactor() {
    let result = 0;
    if (this.shakes.length > 0) {
      const now = performance.now();
      for (const shake of this.shakes) {
        const distanceFactor = Math.min(Math.max((shake.radius - shake.position.distanceTo(camera.position))/shake.radius, 0), 1);
        const timeFactor = Math.min(Math.max(1 - (now - shake.startTime) / shake.decay, 0), 1);
        // console.log('get shake factor', shake.intensity * distanceFactor * timeFactor, shake.intensity, distanceFactor, timeFactor);
        result += shake.intensity * distanceFactor * timeFactor;
      }
    }
    return result;
  }

  setFocus(focus) {
    if (focus !== this.focus) {
      this.focus = focus;
    }
  }

  setDynamicTarget(target = null, target2 = null) {
    const {camera} = this.engineRenderer;

    // this.targetType = 'dynamic';
    this.target = target;
    this.target2 = target2;

    if (this.target) {
      const _setCameraToDynamicTarget = () => {
        this.target.matrixWorld.decompose(localVector, localQuaternion, localVector2);

        if (this.target2) {
          this.target2.matrixWorld.decompose(localVector3, localQuaternion2, localVector4);

          /* const faceDirection = localVector5.set(0, 0, 1).applyQuaternion(localQuaternion);
          // faceDirection.y = 0;
          // faceDirection.normalize();
          const lookQuaternion = localQuaternion3.setFromRotationMatrix(
            localMatrix.lookAt(
              localVector, // head
              localVector3, // target
              upVector, // up
            )
          );
          const lookDirection = localVector6.set(0, 0, -1).applyQuaternion(lookQuaternion);
          // lookDirection.y = 0;
          // lookDirection.normalize();

          const sideOfY = getSideOfY(faceDirection, lookDirection);
          const face = faceDirection.dot(lookDirection) >= 0 ? 1 : -1;

          const dollyPosition = localVector7.copy(localVector)
            .add(localVector3)
            .multiplyScalar(0.5);

          dollyPosition.add(
            localVector8.set(sideOfY * -0.1, 0, 0.3).applyQuaternion(lookQuaternion)
          );

          const lookToDollyVector = localVector9.copy(dollyPosition).sub(localVector).normalize();

          this.targetPosition.copy(localVector)
            .addScaledVector(lookToDollyVector, 0.6);
          this.targetQuaternion.setFromRotationMatrix(
            localMatrix.lookAt(
              lookToDollyVector,
              zeroVector,
              upVector
            )
          ); */

          // console.log('got facing', faceDirection.toArray(), face, this.target);
          // if (face < 0) {
            // console.log('hit 1', new THREE.Vector3(0, 0, 1).applyQuaternion(localQuaternion));

            localEuler.setFromQuaternion(localQuaternion, 'YXZ');
            localEuler.x = 0;
            localEuler.z = 0;
            // localEuler.y += Math.PI;
            this.targetQuaternion.setFromEuler(localEuler);

            // const rotateDistance = 0.8;
            this.targetPosition.copy(localVector)
              .add(
                new THREE.Vector3(0, 0, 1)
                  .applyQuaternion(this.targetQuaternion)
              );
            /* this.targetPosition.add(localVector10.set(0, 0, -rotateDistance).applyQuaternion(this.targetQuaternion));
            this.targetQuaternion.multiply(localQuaternion4.setFromAxisAngle(upVector, Math.PI));
            this.targetPosition.add(localVector10.set(0, 0, rotateDistance).applyQuaternion(this.targetQuaternion)); */
          // } else if (!this.lastTarget) {
            // console.log('hit 2');
            // this.targetPosition.add(localVector10.set(0, 0, -cameraOffsetDefault).applyQuaternion(this.targetQuaternion));
            // this.targetQuaternion.multiply(localQuaternion4.setFromAxisAngle(upVector, sideOfY * -Math.PI * 0.87));
            // this.targetPosition.add(localVector10.set(0, 0, cameraOffsetDefault).applyQuaternion(this.targetQuaternion));
          // } else {
          //   console.log('hit 3');
          // }
        } else {
          debugger;
          const offset = 0.5;
          this.targetPosition.copy(localVector)
            .add(localVector2.set(0, 0, -offset).applyQuaternion(localQuaternion));
          this.targetQuaternion.copy(localQuaternion)
            .premultiply(localQuaternion2.setFromAxisAngle(upVector, Math.PI));
        }

        this.sourceFov = camera.fov;
        this.targetFov = minFov;

        this.sourcePosition.copy(camera.position);
        this.sourceQuaternion.copy(camera.quaternion);
        const timestamp = performance.now();
        this.lerpStartTime = timestamp;
        this.lastTimestamp = timestamp;

        // cameraOffsetZ = -cameraOffsetDefault;
        cameraOffset.z = -cameraOffsetDefault;
      };
      _setCameraToDynamicTarget();
    } else {
      this.setCameraToNullTarget();
    }
  }

  setStaticTarget(target = null, target2 = null) {
    const {camera} = this.engineRenderer;

    // this.targetType = 'static';
    this.target = target;
    this.target2 = target2;

    // console.log('set static target', this.target, this.target2, new Error().stack);

    if (this.target) {
      const _setCameraToStaticTarget = () => {
        // this.target.matrixWorld.decompose(localVector, localQuaternion, localVector2);

        cameraOffsetTargetZ = -1;
        cameraOffset.z = cameraOffsetTargetZ;

        const localPlayer = this.playersManager.getLocalPlayer();
        const targetPosition = localVector.copy(localPlayer.position)
          .add(localVector2.set(0, 0, -cameraOffsetTargetZ).applyQuaternion(localPlayer.quaternion));
        const targetQuaternion = localPlayer.quaternion;
        // camera.position.lerp(targetPosition, 0.2);
        // camera.quaternion.slerp(targetQuaternion, 0.2);

        this.sourcePosition.copy(camera.position);
        this.sourceQuaternion.copy(camera.quaternion);
        this.sourceFov = camera.fov;
        this.targetPosition.copy(targetPosition);
        this.targetQuaternion.copy(targetQuaternion);
        this.targetFov = midFov;
        const timestamp = performance.now();
        this.lerpStartTime = timestamp;
        this.lastTimestamp = timestamp;

        // cameraOffsetZ = -cameraOffsetDefault;
        // cameraOffset.z = -cameraOffsetDefault;
      };
      _setCameraToStaticTarget();
    } else {
      this.setCameraToNullTarget();
    }
  }

  setFixedTarget(target, fov) {
    const {camera} = this.engineRenderer;

    // this.targetType = 'fixed';
    this.target = target;
    this.target2 = null;

    if (this.target) {
      this.target.matrixWorld.decompose(localVector, localQuaternion, localVector2);

      const targetPosition = localVector;
      const targetQuaternion = localQuaternion;

      this.sourcePosition.copy(camera.position);
      this.sourceQuaternion.copy(camera.quaternion);
      this.sourceFov = camera.fov;
      this.targetPosition.copy(targetPosition);
      this.targetQuaternion.copy(targetQuaternion);
      this.targetFov = fov;
      const timestamp = performance.now();
      this.lerpStartTime = timestamp;
      this.lastTimestamp = timestamp;
      this.lerpTime = 0;
    } else {
      this.setCameraToNullTarget();
    }
  }

  setAimTarget(target, target2, offset, fov) {
    const {camera} = this.engineRenderer;

    // this.targetType = 'aim';
    this.target = target;
    this.target2 = target2;

    if (this.target) {
      this.target.matrixWorld.decompose(localVector, localQuaternion, localVector2);

      const targetPosition = localVector;
      const targetQuaternion = localQuaternion;

      this.sourcePosition.copy(target ? target.position : camera.position);
      this.sourceQuaternion.copy(target ? target.quaternion : camera.quaternion);
      this.sourcePosition.add(
        localVector3.copy(offset)
          .applyQuaternion(this.sourceQuaternion)
      );
      this.sourceFov = camera.fov;

      this.targetPosition.copy(target2 ? target2.position : targetPosition);
      this.targetQuaternion.copy(target2 ? target2.quaternion : targetQuaternion);
      this.targetPosition.add(
        localVector3.copy(offset)
          .applyQuaternion(this.targetQuaternion)
      );
      this.targetFov = fov;

      const timestamp = performance.now();
      this.lerpStartTime = timestamp;
      this.lastTimestamp = timestamp;
      this.lerpTime = 0;
    } else {
      this.setCameraToNullTarget();
    }
  }

  setCameraToNullTarget() {
    const {camera} = this.engineRenderer;

    // this.targetType = 'dynamic';
    this.target = null;
    this.target2 = null;

    this.sourcePosition.copy(camera.position);
    this.sourceQuaternion.copy(camera.quaternion);
    this.sourceFov = camera.fov;
    // this.targetPosition.copy(camera.position);
    // this.targetQuaternion.copy(camera.quaternion);
    this.targetFov = minFov;
    const timestamp = performance.now();
    this.lerpStartTime = timestamp;
    this.lastTimestamp = timestamp;
  }

  startCinematicScript(cinematicScript) {
    this.cinematicScript = cinematicScript;
    this.cinematicScriptStartTime = performance.now();
  }

  createFreeCameraControllerFn({
    position,
    quaternion,
  }) {
    position = position.clone();
    // quaternion = quaternion.clone();
    const euler = new THREE.Euler()
      .setFromQuaternion(quaternion, 'YXZ');

    const {
      keys,
      keysDirection,
    } = this.engine.ioManager;

    const fn = () => {
      const speed = freeCameraSpeed * (keys.shift ? freeCameraSpeedRunMultiplier : 1);
      const velocity = localVector.copy(keysDirection)
        .normalize()
        .multiplyScalar(speed);

      const velocity2 = localVector2.setScalar(0);
      if (keys.space) {
        velocity2.y += 1;
      }
      if (keys.ctrl) {
        velocity2.y -= 1;
      }
      velocity2.normalize()
        .multiplyScalar(speed);

      const {camera} = this.engineRenderer;
      camera.quaternion.setFromEuler(euler);
      velocity.applyQuaternion(camera.quaternion);

      camera.position.add(velocity);
      camera.position.add(velocity2);

      camera.updateMatrixWorld();
    };
    fn.isFreeCameraControllerFn = true;
    fn.isControlCaptured = true;
    fn.mousemove = (e) => {
      if (this.pointerLockManager.pointerLockElement) {
        euler.x -= e.movementY * cameraSpeed;
        euler.x = Math.min(Math.max(euler.x, -Math.PI / 2), Math.PI / 2);
        euler.y -= e.movementX * cameraSpeed;
      }
    };
    return fn;
  }
  createVirtualCameraControllerFn({
    app,
  }) {
    const euler = new THREE.Euler()
      .setFromQuaternion(app.quaternion, 'YXZ');

    const {camera} = this.engineRenderer;
    const {
      keys,
      keysDirection,
    } = this.engine.ioManager;

    const fn = () => {
      const speed = freeCameraSpeed * (keys.shift ? freeCameraSpeedRunMultiplier : 1);
      const velocity = localVector2.copy(keysDirection)
        .normalize()
        .multiplyScalar(speed);

      const velocity2 = localVector3.setScalar(0);
      if (keys.space) {
        velocity2.y += 1;
      }
      if (keys.ctrl) {
        velocity2.y -= 1;
      }
      velocity2.normalize()
        .multiplyScalar(speed);

      app.quaternion.setFromEuler(euler);
      velocity.applyQuaternion(app.quaternion);

      app.position.add(velocity);
      app.position.add(velocity2);

      app.updateMatrixWorld();

      if (
        !camera.position.equals(app.position) ||
        !camera.quaternion.equals(app.quaternion)
      ) {
        camera.position.copy(app.position);
        camera.quaternion.copy(app.quaternion);
        camera.updateMatrixWorld();
      }
    };
    fn.isVirtualCameraControllerFn = true;
    fn.isControlCaptured = true;
    fn.app = app;
    fn.camera = camera;
    fn.mousemove = (e) => {
      if (this.pointerLockManager.pointerLockElement) {
        euler.x -= e.movementY * cameraSpeed;
        euler.x = Math.min(Math.max(euler.x, -Math.PI / 2), Math.PI / 2);
        euler.y -= e.movementX * cameraSpeed;

        app.quaternion.setFromEuler(euler);
        app.updateMatrixWorld();

        camera.quaternion.copy(app.quaternion);
        camera.updateMatrixWorld();
      }
    };
    fn.updateCamera = () => {
      camera.position.copy(app.position);
      camera.quaternion.copy(app.quaternion);
      camera.updateMatrixWorld();
    };
    return fn;
  }

  hasControllerFn() {
    return this.controllerFns.length > 0;
  }
  getControllerFn() {
    return this.controllerFns[this.controllerFns.length - 1];
  }
  getControllerFns() {
    return this.controllerFns.slice();
  }
  setControllerFn(controllerFn) {
    this.controllerFns.push(controllerFn);

    this.dispatchEvent(new MessageEvent('controllerfnupdate', {
      data: {
        controllerFn,
      },
    }));
  }
  unsetControllerFn(controllerFn) {
    if (controllerFn) {
      const oldControllerFn = this.getControllerFn();

      // remove old controller fn
      const index = this.controllerFns.indexOf(controllerFn);
      if (index !== -1) {
        this.controllerFns.splice(index, 1);
      }

      // if the character controller changed, emit update event
      const newControllerFn = this.getControllerFn();
      if (newControllerFn !== oldControllerFn) {
        this.dispatchEvent(new MessageEvent('controllerfnupdate', {
          data: {
            controllerFn: newControllerFn,
          },
        }));
      }
    } else {
      this.controllerFns.length = 0;
    }
  }

  updatePost(timestamp, timeDiff) {
    // const renderer = getRenderer();
    const {renderer, camera} = this.engineRenderer;
    const session = renderer.xr.getSession();
    // const session = null;
    const localPlayer = this.playersManager.getLocalPlayer();

    if (this.target) {
      const _setLerpDelta = (position, quaternion) => {
        const lastTimeFactor = this.lerpTime > 0 ?
          Math.min(Math.max(cubicBezier((this.lastTimestamp - this.lerpStartTime) / this.lerpTime), 0), 1)
        : 0;
        const currentTimeFactor = this.lerpTime > 0 ?
          Math.min(Math.max(cubicBezier((timestamp - this.lerpStartTime) / this.lerpTime), 0), 1)
        : 1;
        if (lastTimeFactor !== currentTimeFactor) {
          {
            // const lastLerp = localVector.copy(this.sourcePosition).lerp(this.targetPosition, lastTimeFactor);
            // const currentLerp = localVector2.copy(this.sourcePosition).lerp(this.targetPosition, currentTimeFactor);
            // position.add(currentLerp).sub(lastLerp);
            position.copy(this.targetPosition);
          }
          {
            // const lastLerp = localQuaternion.copy(this.sourceQuaternion).slerp(this.targetQuaternion, lastTimeFactor);
            // const currentLerp = localQuaternion2.copy(this.sourceQuaternion).slerp(this.targetQuaternion, currentTimeFactor);
            // quaternion.premultiply(lastLerp.invert()).premultiply(currentLerp);
            quaternion.copy(this.targetQuaternion);
          }
        }

        this.lastTimestamp = timestamp;
      };
      _setLerpDelta(camera.position, camera.quaternion);
      camera.updateMatrixWorld();
    } else if (this.controllerFns.length > 0) {
      const controllerFn = this.controllerFns[this.controllerFns.length - 1];
      controllerFn(timestamp);

      this.lastTimestamp = timestamp;
    /* } else if (this.cinematicScript) {
      debugger;

      const timeDiff = timestamp - this.cinematicScriptStartTime;
      // find the line in the script that we are currently on
      let currentDuration = 0;
      const currentLineIndex = (() => {
        let i;
        for (i = 0; i < this.cinematicScript.length; i++) {
          const currentLine = this.cinematicScript[i];
          // const nextLine = this.cinematicScript[i + 1];

          if (currentDuration + currentLine.duration > timeDiff) {
            // return currentLine;
            break;
          } else {
            currentDuration += currentLine.duration;
          }

          // const lineDuration = this.cinematicScript[i].duration;
          // currentDuration += lineDuration;
        }
        return i < this.cinematicScript.length ? i : -1;
      })();

      if (currentLineIndex !== -1) {
        // calculate how far into the line we are, in 0..1
        const currentLine = this.cinematicScript[currentLineIndex];
        const {type} = currentLine;
        switch (type) {
          case 'set': {
            camera.position.copy(currentLine.position);
            camera.quaternion.copy(currentLine.quaternion);
            camera.updateMatrixWorld();
            break;
          }
          case 'move': {
            let factor = Math.min(Math.max((timeDiff - currentDuration) / currentLine.duration, 0), 1);
            if (factor < 1) {
              factor = cubicBezier2(factor);
              const previousLine = this.cinematicScript[currentLineIndex - 1];

              camera.position.copy(previousLine.position).lerp(currentLine.position, factor);
              camera.quaternion.copy(previousLine.quaternion).slerp(currentLine.quaternion, factor);
              camera.updateMatrixWorld();
            } else {
              this.cinematicScript = null;
            }
            break;
          }
          default: {
            throw new Error('unknown cinematic script line type: ' + type);
          }
        }
      } else {
        // console.log('no line', timeDiff, this.cinematicScript.slice());
        this.cinematicScript = null;
      } */
    } else {
      const _bumpCamera = () => {
        const direction = localVector.set(0, 0, 1)
          .applyQuaternion(camera.quaternion);
        const backOffset = 1;
        // const cameraBackThickness = 0.5;

        const sweepDistance = Math.max(-cameraOffsetTargetZ, 0);

        // console.log('offset', cameraOffsetTargetZ);

        cameraOffsetLimitZ = -Infinity;

        if (sweepDistance > 0) {
        // if (false) {
          const halfExtents = localVector2.set(0.5, 0.5, 0.1);
          const maxHits = 1;

          const physicsScene = physicsManager.getScene();
          const result = physicsScene.sweepBox(
            localVector3.copy(localPlayer.position)
              .add(localVector4.copy(direction).multiplyScalar(backOffset)),
            camera.quaternion,
            halfExtents,
            direction,
            sweepDistance,
            maxHits,
          );
          if (result.length > 0) {
            const distance = result[0].distance;
            cameraOffsetLimitZ = distance < 0.5 ? 0 : -distance;
          }
        }
      };
      _bumpCamera();

      const _lerpCameraOffset = () => {
        // const lerpFactor = 0.15;
        let cameraOffsetZ = Math.max(cameraOffsetTargetZ, cameraOffsetLimitZ);
        // if (cameraOffsetZ > -0.5) {
        //   cameraOffsetZ = 0;
        // }
        // cameraOffset.z = cameraOffset.z * (1-lerpFactor) + cameraOffsetZ*lerpFactor;
        cameraOffset.z = cameraOffsetZ;
      };
      _lerpCameraOffset();

      const _setFreeCamera = () => {
        if (localPlayer.avatar && !session) {
          const mode = this.getMode();

          const avatarCameraOffset = session ? rayVectorZero : this.getCameraOffset();
          const avatarHeight = localPlayer.avatar ? localPlayer.avatar.height : 0;
          const crouchOffset = avatarHeight * (1 - localPlayer.getCrouchFactor()) * 0.5;

          switch (mode) {
            case 'firstperson': {
              if (localPlayer.avatar) {
                const boneNeck = localPlayer.avatar.foundModelBones.Neck;
                const boneEyeL = localPlayer.avatar.foundModelBones.Eye_L;
                const boneEyeR = localPlayer.avatar.foundModelBones.Eye_R;
                const boneHead = localPlayer.avatar.foundModelBones.Head;

                if (boneNeck) {
                  boneNeck.quaternion.setFromEuler(localEuler.set(Math.min(camera.rotation.x * -0.5, 0.6), 0, 0, 'XYZ'));
                  boneNeck.updateMatrixWorld();
                }

                if (boneEyeL && boneEyeR) {
                  boneEyeL.matrixWorld.decompose(localVector2, localQuaternion, localVector4);
                  boneEyeR.matrixWorld.decompose(localVector3, localQuaternion, localVector4);
                  localVector4.copy(localVector2.add(localVector3).multiplyScalar(0.5));
                } else {
                  boneHead.matrixWorld.decompose(localVector2, localQuaternion, localVector4);
                  localVector2.add(localVector3.set(0, 0, 0.1).applyQuaternion(localQuaternion));
                  localVector4.copy(localVector2);
                }
              } else {
                localVector4.copy(localPlayer.position);
              }

              this.targetPosition.copy(localVector4)
                .sub(localVector2.copy(avatarCameraOffset).applyQuaternion(this.targetQuaternion));

              break;
            }
            case 'isometric': {
              this.targetPosition.copy(localPlayer.position)
                .sub(
                  localVector2.copy(avatarCameraOffset)
                    .applyQuaternion(this.targetQuaternion)
                );

              break;
            }
            default: {
              throw new Error('invalid camera mode: ' + this.getMode());
            }
          }

          const factor = Math.min((timestamp - this.lerpStartTime) / maxFocusTime, 1);

          this.targetPosition.y -= crouchOffset;
          camera.position.copy(this.sourcePosition)
            .lerp(this.targetPosition, factor);

          localEuler.setFromQuaternion(this.targetQuaternion, 'YXZ');
          localEuler.z = 0;
          camera.quaternion.copy(this.sourceQuaternion)
            .slerp(localQuaternion.setFromEuler(localEuler), factor);

          if (mode !== this.lastMode) {
            this.dispatchEvent(new MessageEvent('modeupdate', {
              data: {
                mode,
              },
            }));
            this.lastMode = mode;
          }
        } else {
          if (localPlayer.avatar) {
            // XXX need this to be the true headset position, not necessarily the avatar position
            camera.position.copy(
              localPlayer.avatar.inputs.hmd.position
            );
            camera.quaternion.copy(
              localPlayer.avatar.inputs.hmd.quaternion
            );
          }
        }

        const _setFocusZ = () => {
          this.postProcessing.setFocusZ(-cameraOffset.z);
        };
        _setFocusZ();
      };
      _setFreeCamera();
    };

    const _setCameraFov = () => {
      if (!renderer.xr.getSession()) {
        let newFov;

        const focusTime = Math.min((timestamp - this.lerpStartTime) / maxFocusTime, 1);
        if (focusTime < 1) {
          this.fovFactor = 0;

          const a = this.sourceFov;
          const b = this.targetFov;
          newFov = a * (1 - focusTime) + focusTime * b;
        } else if (this.focus) {
          this.fovFactor = 0;

          newFov = midFov;
        } else {
          const fovInTime = 3;
          const fovOutTime = 0.3;

          const narutoRun = localPlayer.actionManager.getActionType('narutoRun');
          if (narutoRun) {
            if (this.lastNonzeroDirectionVector.z < 0) {
              this.fovFactor += timeDiff / 1000 / fovInTime;
            } else {
              this.fovFactor -= timeDiff / 1000 / fovInTime;
            }
          } else {
            this.fovFactor -= timeDiff / 1000 / fovOutTime;
          }
          this.fovFactor = Math.min(Math.max(this.fovFactor, 0), 1);

          newFov = minFov + Math.pow(this.fovFactor, 0.75) * (maxFov - minFov);
        }

        if (newFov !== camera.fov) {
          // camera.fov = newFov;
          // camera.updateProjectionMatrix();

          // this.dispatchEvent(new MessageEvent('fovchange', {
          //   data: {
          //     fov: newFov,
          //   },
          // }));
        }
      }
    };
    _setCameraFov();

    const _shakeCamera = () => {
      this.flushShakes();
      const shakeFactor = this.getShakeFactor();
      if (shakeFactor > 0) {
        const baseTime = timestamp/1000 * shakeAnimationSpeed;
        const timeOffset = 1000;
        const ndc = f => (-0.5 + f) * 2;
        let index = 0;
        const randomValue = () => ndc(shakeNoise.noise1D(baseTime + timeOffset * index++));
        localVector.set(
          randomValue(),
          randomValue(),
          randomValue()
        )
          .normalize()
          .multiplyScalar(shakeFactor * randomValue());
        camera.position.add(localVector);
      }
    };
    _shakeCamera();

    // console.log('camera position', camera.position.toArray(), camera.quaternion.toArray());
    camera.updateMatrixWorld();

    this.lastTarget = this.target;

    this.dispatchEvent(new MessageEvent('update'));
  }
  lookAt(position) {
    const {
      engineRenderer,
      playersManager,
    } = this;
    const localPlayer = playersManager.getLocalPlayer();
    const {
      camera,
    } = engineRenderer;
    this.targetQuaternion.setFromRotationMatrix(
      localMatrix.lookAt(
        localPlayer.position,
        position,
        upVector,
      ),
    );
    camera.updateMatrixWorld();
  }
  setVirtualCameraIndex(index) {
    if (index !== -1) {
      const cameraApps = [];
      const appManagers = this.appManagerContext.getAppManagers();
      for (const appManager of appManagers) {
        for (const app of appManager.apps.values()) {
          if (app.isCameraApp) {
            cameraApps.push(app);
          }
        }
      }
      const app = cameraApps[index];
      if (app) {
        this.setVirtualCameraApp(app);
      } else {
        this.setVirtualCameraApp(null);
      }
    } else {
      this.setVirtualCameraApp(null);
    }
  }
  setVirtualCameraApp(app) {
    const oldControllerFn = this.getControllerFn();
    const _clear = () => {
      if (oldControllerFn?.isVirtualCameraControllerFn) {
        this.unsetControllerFn(oldControllerFn)
      }
    };

    if (app) {
      if (!app.isCameraApp) {
        throw new Error('must be a camera app');
      }

      if (oldControllerFn?.isVirtualCameraControllerFn && oldControllerFn?.app === app) {
        _clear();
      } else {
        _clear();

        const virtualCameraControllerFn = this.createVirtualCameraControllerFn({
          app,
        });
        this.setControllerFn(virtualCameraControllerFn);

        virtualCameraControllerFn.updateCamera();
      }
    } else {
      _clear();
    }
  }
  setStoryCamera(shot, framing, angle, srcTarget, dstTarget) {
    console.log('set story camera', {shot, framing, angle, srcTarget, dstTarget});
    /* Shots = [
      "establishing shot",
      "master shot",
      "wide shot",
      "full shot",
      "medium shot",
      "medium close up shot",
      "close up shot",
      "extreme close up shot",
    ];
    Frames = [
      "single shot",
      "two shot",
      "crowd shot",
      "over the shoulder shot",
      "point of view shot",
      "insert shot",
    ];
    Angles = [
      "low angle",
      "high angle",
      "overhead angle",
      "dutch angle",
      "eye level",
      "shoulder level",
      "knee level",
      "ground level",
    ]; */
    const _setShot = (position, quaternion, fov) => {
      const target = new THREE.Object3D();
      target.position.copy(position);
      target.quaternion.copy(quaternion);
      this.setFixedTarget(targetObject, fov);
    };
    const _setAimShot = (srcTarget, dstTarget, offset, fov) => {
      this.setAimTarget(srcTarget, dstTarget, offset, fov);
    };
    switch (shot) {
      case "establishing shot": {
        _setShot(
          new THREE.Vector3(0, 10, 0),
          downQuaternion,
          minFov
        );
        break;
      }
      case "master shot": {
        _setShot(
          new THREE.Vector3(0, 5, 10),
          identityQuaternion,
          minFov,
        );
        break;
      }
      case "wide shot": {
        _setShot(
          new THREE.Vector3(0, 5, 10),
          identityQuaternion,
          wideFov,
        );
        break;
      }
      case "full shot": {
        _setAimShot(
          srcTarget,
          dstTarget,
          localVector10.set(0, -0.75, 3),
          wideFov,
        );
        break;
      }
      case "cowboy shot": {
        _setAimShot(
          srcTarget,
          dstTarget,
          localVector10.set(Math.random() < 0.5 ? -0.1 : 0.1, -0.5, 2),
          wideFov,
        );
        break;
      }
      case "medium shot": {
        _setAimShot(
          srcTarget,
          dstTarget,
          localVector10.set(0, -0.4, 1),
          minFov,
        );
        break;
      }
      case "medium close up shot": {
        _setAimShot(
          srcTarget,
          dstTarget,
          localVector10.set(0, -0.3, 0.5),
          minFov,
        );
        break;
      }
      case "close up shot": {
        _setAimShot(
          srcTarget,
          dstTarget,
          localVector10.set(0, -0.2, 0.3),
          minFov,
        );
        break;
      }
      case "extreme close up shot": {
        _setAimShot(
          srcTarget,
          dstTarget,
          localVector10.set(0, -0.1, 0.2),
          minFov,
        );
        break;
      }
      default: {
        console.warn(`unknown shot: ${shot}`);
        break;
      }
    }
    /* switch (framing) {
      case "single shot":
      case "two shot":
      case "crowd shot":
      case "over the shoulder shot":
      case "point of view shot":
      case "insert shot":
      {
        console.log('got frames', {
          frames,
        });
        break;
      }
    } */
    /* switch (angle) {
      case "low angle":
      case "high angle":
      case "overhead angle":
      case "dutch angle":
      case "eye level":
      case "shoulder level":
      case "knee level":
      case "ground level":
      {
        console.log('got angle', {
          angle,
        });
        break;
      }
    } */
  }
}
// const cameraManager = new CameraManager();
// export default cameraManager;
