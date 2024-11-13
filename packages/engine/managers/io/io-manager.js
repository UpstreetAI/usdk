/*
io manager reads inputs from the browser.
some inputs are implicit, like resize.
the functionality is implemented in other managers.
*/
import mobile from 'is-mobile';
const isMobile = mobile();
import * as THREE from 'three';
import physicsManager from '../../physics/physics-manager.js';
// import {cameraSpeed} from '../../constants/camera-constants.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector2D = new THREE.Vector2();
// const localEuler = new THREE.Euler();
// const localMatrix2 = new THREE.Matrix4();
// const localMatrix3 = new THREE.Matrix4();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
// const localQuaternion3 = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();
// const localPlane = new THREE.Plane();
// const localFrustum = new THREE.Frustum();
const localRaycaster = new THREE.Raycaster();
const localObject = new THREE.Object3D();

const zeroVector = new THREE.Vector3(0, 0, 0);
const upVector = new THREE.Vector3(0, 1, 0);

const doubleTapTime = 200;

//

export class IoManager extends EventTarget {
  lastAxes = [[0, 0, 0, 0], [0, 0, 0, 0]];
  lastButtons = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
  currentWeaponValue = 0;
  lastWeaponValue = 0;
  currentTeleport = false;
  lastTeleport = false;
  currentMenuDown = false;
  lastMenuDown = false;
  menuExpanded = false;
  lastMenuExpanded = false;
  currentWeaponGrabs = [false, false];
  lastWeaponGrabs = [false, false];
  currentWalked = false;
  lastMouseButtons = 0;
  movementEnabled = true;

  // freeCamera = false;
  // freeCameraVector = new THREE.Vector3();
  // freeCameraEuler = new THREE.Euler();

  // XXX replace this
  // freeCameraManagerControllerFn = null;

  keysDirection = new THREE.Vector3();

  keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    forward: false,
    backward: false,
    shift: false,
    doubleTap: false,
    space: false,
    ctrl: false,
    keyG: false,
  };

  lastKeysDownTime = {
    keyW: 0,
    keyA: 0,
    keyS: 0,
    keyD: 0,
    keyG: 0,
  };

  constructor({
    engine,
    cameraManager,
    pointerLockManager,
    raycastManager,
    engineRenderer,
    playersManager,
    storyManager,
    zTargetingManager,
    // controlsManager,
    // ioBus,
  }) {
    super();

    if (!engine || !cameraManager || !pointerLockManager || !raycastManager || !engineRenderer || !playersManager || !storyManager || !zTargetingManager /*|| !controlsManager || !ioBus*/) {
      console.warn('missing managers', {
        engine,
        cameraManager,
        pointerLockManager,
        raycastManager,
        engineRenderer,
        playersManager,
        storyManager,
        zTargetingManager,
        // controlsManager,
        // ioBus,
      });
      debugger;
      throw new Error('missing managers');
    }
    this.engine = engine;
    this.cameraManager = cameraManager;
    this.pointerLockManager = pointerLockManager;
    this.raycastManager = raycastManager;
    this.engineRenderer = engineRenderer;
    this.playersManager = playersManager;
    this.storyManager = storyManager;
    this.zTargetingManager = zTargetingManager;

    this.eventHandlers = new Map();

    this.#listen();
  }

  #listen() {
    // XXX this should be moved to its own manager (pointerlock manager?)
    this.pointerLockManager.addEventListener('pointerlockchange', e => {
      const {
        pointerLockElement,
      } = e.data;
      if (!pointerLockElement) {
        // update movements
        this.engine.game.setMovements();

        // update sprint/naruto run
        {
          const oldShift = this.keys.shift;
          const oldDoubleTap = this.keys.doubleTap;

          oldShift && this.engine.game.setSprint(false);
          oldDoubleTap && this.engine.game.menuUnDoubleTap();
        }

        this.resetKeys();
      }
    });

    // handle events from the iframe
    this.addEventListener('ioBus', e => {
      this[e.data.type](e.data);
    });
  }

  registerEventHandler(type, handler) {
    let eventHandlers = this.eventHandlers.get(type);
    if (!eventHandlers) {
      eventHandlers = [];
      this.eventHandlers.set(type, eventHandlers);
    }
    eventHandlers.push(handler);
  }
  unregisterEventHandler(type, handler) {
    const eventHandlers = this.eventHandlers.get(type);
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler);
      if (index !== -1) {
        eventHandlers.splice(index, 1);
        if (eventHandlers.length === 0) {
          this.eventHandlers.delete(type);
        }
      } else {
        console.warn('failed to find handler to unregister', handler);
      }
    } else {
      console.warn('failed to find event handlers to unregister', type);
    }
  }
  handleCustomEvent(e) {
    const eventHandlers = this.eventHandlers.get(e.type);
    if (eventHandlers) {
      for (let i = 0; i < eventHandlers.length; i++) {
        const eventHandler = eventHandlers[i];
        const result = eventHandler(e);
        if (result !== false) {
          return true;
        }
      }
    }
    return false;
  }

  inputFocused() {
    return document.activeElement &&
      (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.getAttribute('contenteditable') !== null
      )
    };

  update(timeDiff, xrAvatarPose) {
    const {engineRenderer} = this;
    const {renderer, camera} = engineRenderer;
    const session = renderer.xr.getSession();
    const xrCamera = session ?
      renderer.xr.getCamera(camera)
    :
      camera;

    // latch the update functions
    let _updateHorizontal, _updateVertical;
    if (session) {
      const localDirection = new THREE.Vector3();
      let localJumpButton = false;

      const inputSources = Array.from(session.inputSources);
      for (let i = 0; i < inputSources.length; i++) {
        const inputSource = inputSources[i];
        const {handedness, gamepad} = inputSource;
        if (gamepad && gamepad.buttons.length >= 2) {
          const index = handedness === 'right' ? 1 : 0;

          // axes
          const {axes: axesSrc, buttons: buttonsSrc} = gamepad;
          const axes = [
            axesSrc[0] || 0,
            axesSrc[1] || 0,
            axesSrc[2] || 0,
            axesSrc[3] || 0,
          ];
          const buttons = [
            buttonsSrc[0] ? buttonsSrc[0].value : 0,
            buttonsSrc[1] ? buttonsSrc[1].value : 0,
            buttonsSrc[2] ? buttonsSrc[2].value : 0,
            buttonsSrc[3] ? buttonsSrc[3].value : 0,
            buttonsSrc[4] ? buttonsSrc[4].value : 0,
            buttonsSrc[5] ? buttonsSrc[5].value : 0,
          ];
          if (handedness === 'left') {
            const dx = axes[0] + axes[2];
            const dy = axes[1] + axes[3];
            if (Math.abs(dx) >= 0.01 || Math.abs(dy) >= 0.01) {
              const [[p, q]] = xrAvatarPose;
              localQuaternion.fromArray(q);
              localVector.set(dx, 0, dy)
                .applyQuaternion(localQuaternion);

              /* camera.matrix
                // .premultiply(localMatrix2.makeTranslation(-xrCamera.position.x, -xrCamera.position.y, -xrCamera.position.z))
                .premultiply(localMatrix3.makeTranslation(localVector.x, localVector.y, localVector.z))
                // .premultiply(localMatrix2.copy(localMatrix2).invert())
                .decompose(camera.position, camera.quaternion, camera.scale); */
              localDirection.add(localVector);
              this.currentWalked = true;
            }

            this.currentWeaponGrabs[1] = buttons[1] > 0.5;
          } else if (handedness === 'right') {
            const _applyRotation = r => {
              // console.log('rotate', r);

              /* camera.matrix
                .premultiply(localMatrix2.makeTranslation(-xrCamera.position.x, -xrCamera.position.y, -xrCamera.position.z))
                .premultiply(localMatrix3.makeRotationFromQuaternion(localQuaternion.setFromAxisAngle(localVector.set(0, 1, 0), r)))
                .premultiply(localMatrix2.copy(localMatrix2).invert())
                .decompose(camera.position, camera.quaternion, camera.scale); */
            };
            if (
              (axes[0] < -0.75 && !(this.lastAxes[index][0] < -0.75)) ||
              (axes[2] < -0.75 && !(this.lastAxes[index][2] < -0.75))
            ) {
              _applyRotation(Math.PI * 0.2);
            } else if (
              (axes[0] > 0.75 && !(this.lastAxes[index][0] > 0.75)) ||
              (axes[2] > 0.75 && !(this.lastAxes[index][2] > 0.75))
            ) {
              _applyRotation(-Math.PI * 0.2);
            }
            this.currentTeleport = (axes[1] < -0.75 || axes[3] < -0.75);
            this.currentMenuDown = (axes[1] > 0.75 || axes[3] > 0.75);

            this.currentWeaponDown = buttonsSrc[0].pressed;
            this.currentWeaponValue = buttons[0];
            this.currentWeaponGrabs[0] = buttonsSrc[1].pressed;

            if (
              buttons[3] >= 0.5 && this.lastButtons[index][3] < 0.5 &&
              !(Math.abs(axes[0]) > 0.5 || Math.abs(axes[1]) > 0.5 || Math.abs(axes[2]) > 0.5 || Math.abs(axes[3]) > 0.5) // &&
              // !this.engine.game.isJumping() &&
              // !this.engine.game.isSitting()
            ) {
              // this.engine.game.jump();
              localJumpButton = true;
            }
          }

          this.lastAxes[index][0] = axes[0];
          this.lastAxes[index][1] = axes[1];
          this.lastAxes[index][2] = axes[2];
          this.lastAxes[index][3] = axes[3];

          this.lastButtons[index][0] = buttons[0];
          this.lastButtons[index][1] = buttons[1];
          this.lastButtons[index][2] = buttons[2];
          this.lastButtons[index][3] = buttons[3];
          this.lastButtons[index][4] = buttons[4];
        }
      }
      _updateHorizontal = (direction) => {
        direction.add(localDirection);
      };
      _updateVertical = (direction) => {
        if (localJumpButton) {
          direction.y += 1;
        }
      };
    } else {
      _updateHorizontal = direction => {
        if (this.keys.left) {
          direction.x -= 1;
        }
        if (this.keys.right) {
          direction.x += 1;
        }
        if (this.keys.up) {
          direction.z -= 1;
        }
        if (this.keys.down) {
          direction.z += 1;
        }
      };
      _updateVertical = direction => {
        if (this.keys.space) {
          direction.y += 1;
        }
        if (this.keys.ctrl) {
          direction.y -= 1;
        }
      };
    }

    // perform the update
    const _performUpdate = () => {
      this.keysDirection.set(0, 0, 0);

      const localPlayer = this.playersManager.getLocalPlayer();

      // if touchDirection is not zero vector, set keysDirection to it
      if (isMobile && !this.touchMovementDirection.equals(zeroVector)) {
        this.keysDirection.copy(this.touchMovementDirection);
      }

      _updateHorizontal(this.keysDirection);

      const controllerFn = this.cameraManager.getControllerFn();
      if (!controllerFn?.isControlCaptured) {
        if (this.keysDirection.equals(zeroVector)) {
          if (localPlayer.actionManager.hasActionType('narutoRun')) {
            this.keysDirection.copy(this.cameraManager.lastNonzeroDirectionVector);
          }
        } else {
          this.cameraManager.lastNonzeroDirectionVector.copy(this.keysDirection);
        }

        if (localPlayer.actionManager.hasActionType('fly') || localPlayer.actionManager.hasActionType('swim')) {
          this.keysDirection.applyQuaternion(xrCamera.quaternion);
          _updateVertical(this.keysDirection);
        } else {
          const _applyCameraRelativeKeys = () => {
            const transformCameraForwardDirection = localVector.set(0, 0, -1)
              .applyQuaternion(xrCamera.quaternion);
            transformCameraForwardDirection.y = 0;
            if (transformCameraForwardDirection.x === 0 && transformCameraForwardDirection.z === 0) {
              transformCameraForwardDirection.z = -1;
            }
            transformCameraForwardDirection.normalize();
            const backQuaternion = localQuaternion2.setFromRotationMatrix(
              localMatrix.lookAt(zeroVector, transformCameraForwardDirection, upVector)
            );

            this.keysDirection.applyQuaternion(backQuaternion);
          };
          _applyCameraRelativeKeys();

          const _updateCrouch = () => {
            if (this.keys.ctrl && !this.lastCtrlKey && !this.engine.game.isInAir()) {
              this.engine.game.toggleCrouch();
            }
            this.lastCtrlKey = this.keys.ctrl;
          };
          _updateCrouch();
        }
        const physicsScene = physicsManager.getScene();
        if (physicsScene.getPhysicsEnabled() && this.movementEnabled) {
          if (xrAvatarPose && localPlayer.xrRoot.equals(zeroVector)) {
            localPlayer.xrRoot.copy(localPlayer.position);
            // localPlayer.xrRoot.y -= localPlayer.avatar.height;
          }
          if (xrAvatarPose && !this.keysDirection.equals(zeroVector)) {
            const [[p, q]] = xrAvatarPose;

            const lastXrRoot = localVector.copy(localPlayer.xrRoot);
            localPlayer.xrRoot.fromArray(p);
            const xrRootDelta = localVector2.copy(localPlayer.xrRoot)
              .sub(lastXrRoot);

            localPlayer.position.add(xrRootDelta);
            localPlayer.updateMatrixWorld();

            localPlayer.characterPhysics.setPosition(localPlayer.position);
          }

          const speed = this.engine.game.getSpeed();
          const velocity = this.keysDirection.normalize()
            .multiplyScalar(speed);
          localPlayer.characterPhysics.applyWasd(velocity, xrCamera, timeDiff);
        }
      }
    };
    _performUpdate();
  };

  updatePost() {
    this.lastTeleport = this.currentTeleport;
    this.lastMenuDown = this.currentMenuDown;
    this.lastWeaponDown = this.currentWeaponDown;
    this.lastWeaponValue = this.currentWeaponValue;
    this.lastMenuExpanded = this.menuExpanded;
    for (let i = 0; i < 2; i++) {
      this.lastWeaponGrabs[i] = this.currentWeaponGrabs[i];
    }
  };

  setMovementEnabled(newMovementEnabled) {
    const {camera} = this.engineRenderer;

    this.movementEnabled = newMovementEnabled;
    if (!this.movementEnabled) {
      const localPlayer = metaversefile.useLocalPlayer();
      localPlayer.characterPhysics.applyWasd(zeroVector, camera, 0);
    }
  };

  resetKeys() {
    for (const k in this.keys) {
      this.keys[k] = false;
    }
  };

  keydown(e) {
    if (this.inputFocused() || e.repeat) {
      return;
    }
    if (this.handleCustomEvent(e)) {
      return;
    }
    if (e.keyCode === 18) { // alt
      return;
    }

    switch (e.which) {
      case 9: { // tab
        break;
      }
      /* case 49: // 1
      case 50: // 2
      case 51: // 3
      case 52: // 4
      case 53: // 5
      case 54: // 6
      case 55: // 7
      case 56: // 8
      {
        this.engine.game.selectLoadout(e.which - 49);
        break;
      } */
      case 49: // 1
      case 50: // 2
      case 51: // 3
      case 52: // 4
      case 53: // 5
      case 54: // 6
      case 55: // 7
      case 56: // 8
      {
        if (e.shiftKey) {
          const index = e.which - 49;
          this.cameraManager.setVirtualCameraIndex(index);
        }
        break;
      }
      case 13: { // enter
        // if (this.storyManager.getConversation()) {
        //   this.storyManager.progressConversation();
        // }
        break;
      }
      /* case 191: { // /
        if (this.pointerLockManager.pointerLockElement) {
          this.pointerLockManager.exitPointerLock();
        }
        break;
      } */
      case 87: // W
      case 38: // arrow up
      {
        this.keys.up = true;
        this.engine.game.setMovements();

        const now = performance.now();
        const timeDiff = now - this.lastKeysDownTime.keyW;
        if (timeDiff < doubleTapTime && this.keys.shift) {
          this.keys.doubleTap = true;
          this.engine.game.menuDoubleTap();
        }
        this.lastKeysDownTime.keyW = now;
        this.lastKeysDownTime.keyS = 0;
        break;
      }
      case 65: // A
      case 37: // arrow left
      {
        this.keys.left = true;
        this.engine.game.setMovements();

        const now = performance.now();
        const timeDiff = now - this.lastKeysDownTime.keyA;
        if (timeDiff < doubleTapTime && this.keys.shift) {
          this.keys.doubleTap = true;
          this.engine.game.menuDoubleTap();
        }
        this.lastKeysDownTime.keyA = now;
        this.lastKeysDownTime.keyD = 0;
        break;
      }
      case 83: // S
      case 40: // arrow down
      {
        if (e.ctrlKey) {
          // e.preventDefault();
          // e.stopPropagation();

          this.engine.game.saveScene();
        } else {
          this.keys.down = true;
          this.engine.game.setMovements();

          const now = performance.now();
          const timeDiff = now - this.lastKeysDownTime.keyS;
          if (timeDiff < doubleTapTime && this.keys.shift) {
            this.keys.doubleTap = true;
            this.engine.game.menuDoubleTap();
          }
          this.lastKeysDownTime.keyS = now;
          this.lastKeysDownTime.keyW = 0;
        }
        break;
      }
      case 68: // D
      case 39: // arrow right
      {
        this.keys.right = true;
        this.engine.game.setMovements();

        const now = performance.now();
        const timeDiff = now - this.lastKeysDownTime.keyD;
        if (timeDiff < doubleTapTime && this.keys.shift) {
          this.keys.doubleTap = true;
          this.engine.game.menuDoubleTap();
        }
        this.lastKeysDownTime.keyD = now;
        this.lastKeysDownTime.keyA = 0;
        break;
      }
      case 90: { // Z
        if(!debug) {
          return console.warn('Z targeting skipped - debug mode')
        }
        const {camera} = this.engine.engineRenderer;
        const {cameraManager} = this.engine;
        const mode = cameraManager.getMode();
        if (mode === 'firstperson') {
          localRaycaster.setFromCamera(localVector2D, camera);

          localObject.position.copy(localRaycaster.ray.origin);
          localObject.quaternion.setFromRotationMatrix(
            localMatrix.lookAt(
              localVector.set(0, 0, 0),
              localRaycaster.ray.direction,
              localVector2.set(0, 1, 0)
            )
          );
          this.zTargetingManager.handleRayFocus(localObject);
        } else if (mode === 'isometric') {
          this.zTargetingManager.toggle();
        }
        break;
      }
      case 70: { // F
        // e.preventDefault();
        // e.stopPropagation();

        if (this.engine.interactionManager.canPush()) {
          this.keys.forward = true;
        } else {
          // shift f is noclip fly, f is fly
          const isFlying = this.engine.playersManager.getLocalPlayer().actionManager.hasActionType('fly');
          const noclipEnabled = this.engine.game.noclipEnabled;
          if (this.keys.shift) {
            // if the character is flying and noclip is enabled, disable flying and noclip
            if (isFlying){
              if(noclipEnabled){
                this.engine.game.toggleNoclip();
              }
            } else {
              if(!noclipEnabled){
                this.engine.game.toggleNoclip();
              }
            }
          } else {
            if(noclipEnabled){
              this.engine.game.toggleNoclip();
            }
          }
          this.engine.game.toggleFly();
        }
        break;
      }
      case 71: { // G
        if (!e.ctrlKey) {
          this.engine.game.menuInteract();
        }

        this.keys.keyG = true;
        this.lastKeysDownTime.keyG = performance.now();
        break;
      }
      case 67: { // C
        if (!e.ctrlKey && !e.metaKey) {
          if (this.engine.interactionManager.canPush()) {
            this.keys.backward = true;
          } else {
            this.keys.ctrl = true;
          }
        }
        break;
      }
      /* case 71: { // G
        this.engine.game.menuSwitchCharacter();
        break;
      }
      case 86: { // V
        // e.preventDefault();
        // e.stopPropagation();
        this.engine.game.menuVDown(e);
        break;
      }
      case 85: { // U
        // e.preventDefault();
        // e.stopPropagation();
        this.engine.game.worldClear();
        break;
      }
      case 73: { // I
        // e.preventDefault();
        // e.stopPropagation();
        this.engine.game.worldOpen();
        break;
      } */
      /* case 79: { // O
        this.engine.game.equipTest();
        break;
      } */
      /* case 80: { // P
        this.engine.game.dropTest();
        break;
      } */
      /* case 66: { // B
        this.engine.game.menuBDown(e);
        break;
      } */
      case 69: { // E
        this.engine.game.menuMiddleRelease();

        const canRotate = this.engine.interactionManager.canRotate();
        if (canRotate) {
          this.engine.interactionManager.menuRotate(-1);
        } else {
          this.engine.game.menuActivateDown();
        }
        this.keys.keyE = true;
        break;
      }
      case 84: { // T
        this.engine.game.toggleMic(e);
        break;
      }
      case 89: { // Y
        this.engine.game.toggleSpeech(e);
        break;
      }
      case 82: { // R
        if (this.engine.transformControlsManager.isEnabled()) {
          this.engine.transformControlsManager.toggleMode();
        } else if (!e.ctrlKey) {
          this.engine.game.dropSelectedApp();
        }
        break;
      }
      case 80: { // P
        const controllerFns = this.cameraManager.getControllerFns();
        const freeCameraManagerControllerFns = controllerFns.filter(controllerFn => controllerFn.isFreeCameraControllerFn);
        if (freeCameraManagerControllerFns.length === 0) {
          const {camera} = this.engine.engineRenderer;
          const freeCameraManagerControllerFn = this.cameraManager.createFreeCameraControllerFn({
            position: camera.position,
            quaternion: camera.quaternion,
          });
          this.cameraManager.setControllerFn(freeCameraManagerControllerFn);
        } else {
          for (const controllerFn of freeCameraManagerControllerFns) {
            this.cameraManager.unsetControllerFn(controllerFn);
          }
        }
        break;
      }
      case 16: { // shift
        this.keys.shift = true;
        this.engine.game.setSprint(true);
        break;
      }
      case 32: { // space
        if (!e.ctrlKey) {
          this.keys.space = true;

          const controllerFn = this.cameraManager.getControllerFn();
          if (!controllerFn?.isControlCaptured) {
            if (this.engine.game.isGlidering()) {
              this.engine.game.unglider();
            } else if (this.engine.game.isSkydiving()) {
              this.engine.game.glider();
            } else if (!this.engine.game.isJumping()) {
              this.engine.game.jump('jump');
            } else if (!this.engine.game.isDoubleJumping()) {
              this.engine.game.doubleJump();
            }
          }
        }
        break;
      }
      case 81: { // Q
        if (e.ctrlKey) {
          if (this.pointerLockManager.pointerLockElement) {
            this.pointerLockManager.exitPointerLock();
          } else {
            this.pointerLockManager.requestPointerLock();
          }
        } else {
          if (this.engine.game.canToggleAxis()) {
            this.engine.game.toggleAxis();
          } else {
            // clear conflicting aim with quick menu
            this.engine.game.menuUnaim();
          }
        }
        break;
      }
      case 74: { // J
        this.engine.game.inventoryHack = !this.engine.game.inventoryHack;
        break;
      }
      case 27: { // esc
        this.engine.game.setContextMenu(false);
        break;
      }
      /* case 72: { // H
        const debug = metaversefile.useDebug();
        debug.toggle();
        break;
      } */
      case 192: { // tilde
        if (e.shiftKey) {
          this.cameraManager.setVirtualCameraIndex(-1);
        } else {
          // this.engine.interactionManager.toggleEditMode();
        }
        break;
      }
      /* case 77: { // M
        if (e.ctrlKey) {
          // e.preventDefault();
          // e.stopPropagation();
          this.realmManager.enterMultiplayer();
        }
        break;
      } */
      /* case 221: { // }
        if (e.shiftKey) {
          // e.preventDefault();
          // e.stopPropagation();

          console.debug('>>>>>>> game');
          console.debug('>>>>... world apps:', [...this.realmManager.getRootRealm().appManager.apps.keys()],
            this.realmManager.getRootRealm().appManager);
          const localPlayer = this.engine.playersManager.getLocalPlayer();
          console.debug('>>>>... local player:', localPlayer.playerId, [...localPlayer.appManager.apps.keys()], localPlayer);
          const actions = localPlayer.actionManager.getActionsArray();
          console.debug('>>>>... local player actions:', actions);
          const remotePlayers = this.engine.playersManager.getRemotePlayers();
          for (const remotePlayer of remotePlayers) {
            console.debug('>>>>... remote player:', remotePlayer.playerId, [...remotePlayer.appManager.apps.keys()],
              remotePlayer);
            const actions = remotePlayer.actionManager.getActionsArray();
            console.debug('>>>>... remote player actions:', actions);
          }

          const realms = this.realmManager.getRootRealm().realms;
          if (realms) {
            console.debug('>>>>>>> realms');
            console.debug('>>>>... apps:', realms.world.worldApps.getKeys(), realms.world.worldApps);
          }
        }
        break;
      } */
    }
  }

  keypress = e => {
    if (this.handleCustomEvent(e)) return;

    // XXX
  };

  wheel = e => {
    if (this.handleCustomEvent(e)) return;

    if (isMobile) return;
    // const physicsScene = physicsManager.getScene();
    // if (physicsScene.getPhysicsEnabled()) {
      this.cameraManager.handleWheelEvent(e);
    // }
  }

  keyup = e => {
    if (this.inputFocused() || e.repeat) {
      return;
    }
    if (this.handleCustomEvent(e)) return;

    if (e.keyCode === 18) { // alt
      // e.preventDefault();
      // e.stopPropagation();
      return;
    }

    switch (e.which) {
      case 87: // W
      case 38: // arrow up
      {
        this.keys.up = false;
        const controllerFn = this.cameraManager.getControllerFn();
        if (!controllerFn?.isControlCaptured) {
          this.engine.game.setMovements();
        }
        break;
      }
      case 65: // A
      case 37: // arrow left
      {
        this.keys.left = false;
        const controllerFn = this.cameraManager.getControllerFn();
        if (!controllerFn?.isControlCaptured) {
          this.engine.game.setMovements();
        }
        break;
      }
      case 83: // S
      case 40: // arrow down
      {
        this.keys.down = false;
        const controllerFn = this.cameraManager.getControllerFn();
        if (!controllerFn?.isControlCaptured) {
          this.engine.game.setMovements();
        }
        break;
      }
      case 68: // D
      case 39: // arrow right
      {
        this.keys.right = false;
        const controllerFn = this.cameraManager.getControllerFn();
        if (!controllerFn?.isControlCaptured) {
          this.engine.game.setMovements();
        }
        break;
      }
      case 32: { // space
        this.keys.space = false;
        break;
      }
      case 69: { // E
        if (this.pointerLockManager.pointerLockElement) {
          this.engine.game.menuActivateUp();
        }
        this.keys.keyE = false;
        break;
      }
      case 71: { // G
        this.keys.keyG = false;
      }
      case 70: { // F
        this.keys.forward = false;
        break;
      }
      case 67: { // C
        this.keys.backward = false;
        this.keys.ctrl = false;
        break;
      }
      /* case 86: { // V
        // e.preventDefault();
        // e.stopPropagation();
        this.engine.game.menuVUp();
        break;
      } */
      /* case 66: { // B
        // e.preventDefault();
        // e.stopPropagation();
        this.engine.game.menuBUp();
        break;
      } */
      case 16: { // shift
        const oldShift = this.keys.shift;
        const oldDoubleTap = this.keys.doubleTap;

        this.keys.shift = false;
        this.keys.doubleTap = false;

        oldShift && this.engine.game.setSprint(false);
        oldDoubleTap && this.engine.game.menuUnDoubleTap();
        break;
      }
      /* case 46: { // delete
        const object = this.engine.game.getMouseSelectedObject();
        if (object) {
          this.engine.game.setMouseHoverObject(null);
          this.engine.game.setMouseSelectedObject(null);
          world.removeObject(object.instanceId);
        } else if (!e.ctrlKey) {
          this.engine.game.deleteSelectedApp();
        }
        break;
      } */
      case 27: {
        this.engine.game.setMouseSelectedObject(null);
        break;
      }
    }
  };

  touchMovementDirection = new THREE.Vector3();
  touchRotationDirection = new THREE.Vector2();
  leftTouchPosStart = new THREE.Vector2();
  rightTouchPosStart = new THREE.Vector2();
  leftTouchLastPos = new THREE.Vector2();
  rightTouchLastPos = new THREE.Vector2();
  activeTouches = {}; // Key: touch identifier, Value: 'left' or 'right'

  touchmove = e => {
    return;
    const { touches } = e;
    // Instead of resetting the entire direction, you might want to reset only the relevant parts

    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const side = this.activeTouches[touch.identifier] || 'left';

      if (side === 'right') {
        // Calculate rotation direction based on right-side touch movement
        const rotationDelta = new THREE.Vector2(
          touch.clientX - this.rightTouchLastPos.x,
          touch.clientY - this.rightTouchLastPos.y
        );

        // Apply rotation
        this.cameraManager.handleTouchMove(rotationDelta);

        this.rightTouchLastPos.x = touch.clientX;
        this.rightTouchLastPos.y = touch.clientY;
      } else {
        // Calculate movement direction based on left-side touch movement
        this.touchMovementDirection.x = touch.clientX - this.leftTouchPosStart.x;
        this.touchMovementDirection.z = touch.clientY - this.leftTouchPosStart.y;

        this.leftTouchLastPos.x = touch.clientX;
        this.leftTouchLastPos.y = touch.clientY;
      }
    }
  }

  touchstart = e => {
    return;

    const { touches } = e;
    const splitPoint = this.engine.getCanvas().width / 2;

    for (let i = 0; i < touches.length; i++) { // Use proper indexing for the touches array
      const touch = touches[i];
      const side = touch.clientX > splitPoint ? 'right' : 'left';
      this.activeTouches[touch.identifier] = side;

      if (side === 'right') {
        this.rightTouchLastPos.x = this.rightTouchPosStart.x = touch.clientX;
        this.rightTouchLastPos.y = this.rightTouchPosStart.y = touch.clientY;
      } else {
        this.leftTouchLastPos.x = this.leftTouchPosStart.x = touch.clientX;
        this.leftTouchLastPos.y = this.leftTouchPosStart.y = touch.clientY;
      }
    }
  }


  touchend = e => {
    return;

    const { changedTouches } = e;
    for (let i = 0; i < changedTouches.length; i++) { // Use proper indexing for the changedTouches array
      const touch = changedTouches[i];
      const side = this.activeTouches[touch.identifier];

      if (side === 'right') {
        // rotation touch end
      } else {
        this.touchMovementDirection.set(0, 0, 0);
      }
      delete this.activeTouches[touch.identifier];
    }
  }

  mousemove = e => {
    if (this.handleCustomEvent(e)) return;

    const controllerFn = this.cameraManager.getControllerFn();
    if (!controllerFn) {
      if (
        this.pointerLockManager.pointerLockElement ||
        (this.cameraManager.mouseDown && !this.engine.transformControlsManager.isHovered())
      ) {
        this.cameraManager.handleMouseMove(e);
      } else {
        if (this.engine.game.dragging) {
          this.engine.game.menuDrag(e);
          this.engine.game.menuDragRight(e);
        }
      }
      this.raycastManager.setLastMouseEvent(e);
    } else {
      controllerFn.mousemove && controllerFn.mousemove(e);
    }
  };

  mouseenter = e => {
    if (this.handleCustomEvent(e)) return;

    // XXX
  };
  mouseleave = e => {
    if (this.handleCustomEvent(e)) return;

    // this.controlsManager.handleMouseLeave(e);
  };

  click = e => {
    if (e.defaultPrevented) return;
    if (this.handleCustomEvent(e)) return;

    // if (!this.controlsManager.handleClick(e)) {
      if (this.pointerLockManager.pointerLockElement) {
        if (this.storyManager.getConversation()) {
          this.storyManager.progressConversation();
        } else if (this.zTargetingManager.hasSelectedApp()) {
          this.zTargetingManager.click();
        } else {
          this.engine.interactionManager.menuClick(e);
        }
      } else /*if (!this.engine.game.hoverEnabled)*/ {
        // this.pointerLockManager.requestPointerLock();
      }

      this.raycastManager.setLastMouseEvent(e);
    // }
  };

  dblclick = e => {
    if (this.handleCustomEvent(e)) return;
  };

  mousedown = e => {
    if (e.defaultPrevented) return;
    if (this.handleCustomEvent(e)) return;

    const changedButtons = this.lastMouseButtons ^ e.buttons;
    if (this.pointerLockManager.pointerLockElement) {
      if ((changedButtons & 1) && (e.buttons & 1)) { // left
        this.engine.game.menuMouseDown();
      }
      if ((changedButtons & 2) && (e.buttons & 2)) { // right
        this.engine.game.menuAim();
      }
    } else {
      if ((changedButtons & 1) && (e.buttons & 1)) { // left
        this.cameraManager.handleMouseDown(e);
      }

      // if ((changedButtons & 1) && (e.buttons & 2)) { // right
      //   this.engine.game.menuDragdownRight();
      //   this.engine.game.setContextMenu(false);
      // }
    }
    if ((changedButtons & 4) && (e.buttons & 4)) { // middle
      if (!this.pointerLockManager.pointerLockElement) {
        this.pointerLockManager.requestPointerLock();
      }
    }
    this.lastMouseButtons = e.buttons;
    this.raycastManager.setLastMouseEvent(e);
  };

  mouseup = e => {
    if (e.defaultPrevented) return;
    if (this.handleCustomEvent(e)) return;

    const changedButtons = this.lastMouseButtons ^ e.buttons;
    if (this.pointerLockManager.pointerLockElement) {
      if ((changedButtons & 1) && !(e.buttons & 1)) { // left
        this.engine.game.menuMouseUp();
      }
      if ((changedButtons & 2) && !(e.buttons & 2)) { // right
        this.engine.game.menuUnaim();
      }
    } else {
      // if ((changedButtons & 2) && !(e.buttons & 2)) { // right
      //   this.engine.game.menuDragupRight();
      // }
    }
    // if ((changedButtons & 4) && !(e.buttons & 4)) { // middle
    //   // this.engine.game.menuMiddleUp();
    // }

    if ((changedButtons & 1) && !(e.buttons & 1)) { // left
      this.cameraManager.handleMouseUp(e);
    }

    this.lastMouseButtons = e.buttons;
    this.raycastManager.setLastMouseEvent(e);
  };

  pointerdown = e => {
    if (e.defaultPrevented) return;
    if (this.handleCustomEvent(e)) return;
    this.engine.transformControlsManager.pointerDown(e);
  };
  pointerup = e => {
    if (e.defaultPrevented) return;
    if (this.handleCustomEvent(e)) return;
    // console.log('pointer up default prevented', e.defaultPrevented);

    if(!isMobile) {
      if (!this.engine.transformControlsManager.pointerUp(e)) {
        if (!this.engine.cameraManager.lastMouseDownDragged()) {
          this.pointerLockManager.requestPointerLock();
        }
      }
    }
  };
  pointermove = e => {
    if (e.defaultPrevented) return;
    if (this.handleCustomEvent(e)) return;
    // console.log('pointer up default prevented', e.defaultPrevented);
    this.engine.transformControlsManager.pointerMove(e);
    this.engine.domRenderer.pointerMove(e);
  };
  // pointerhover = e => {
  //   if (this.handleCustomEvent(e)) return;
  //   // console.log('pointer up default prevented', e.defaultPrevented);
  //   this.engine.transformControlsManager.pointerHover(e);
  // };

  /*pointerDown(e) {
    for (const transformControls of this.transformControls) {
      transformControls._onPointerDown(e);
    }
  }
  pointerUp(e) {
    for (const transformControls of this.transformControls) {
      transformControls._onPointerUp(e);
    }
  }
  pointerMove(e) {
    for (const transformControls of this.transformControls) {
      transformControls._onPointerMove(e);
    }
  }
  pointerHover(e) {
    for (const transformControls of this.transformControls) {
      transformControls._onPointerHover(e);
    }
  } */

  //

  buttonJump = e => {
    const {direction} = e;
    this.keys.space = direction === 'down';
    if (direction !== 'down') {
      if (!this.freeCamera) {
        if (this.engine.game.isGlidering()) {
          this.engine.game.unglider();
        } else if (this.engine.game.isSkydiving()) {
          this.engine.game.glider();
        } else if (!this.engine.game.isJumping()) {
          this.engine.game.jump('jump');
        } else if (!this.engine.game.isDoubleJumping()) {
          this.engine.game.doubleJump();
        }
      }
    }
  }

  buttonCrouch = e => {
    const {direction} = e;
    if(this.engine.game.isFlying()) {
        this.keys.ctrl = direction === 'down';
    } else if (this.engine.interactionManager.canPush()) {
      if(direction === 'down') {
        this.keys.backward = true;
      }
    } else {
      if(direction === 'down') {
        console.log('toggle crouch')
        this.engine.game.toggleCrouch();
      }
    }
  }

  buttonFly = e => {
    this.engine.game.toggleFly();
    this.engine.game.toggleNoclip();
  }

  buttonRun = e => {
    this.keys.shift = !this.keys.shift;
    this.engine.game.setSprint(this.keys.shift);
  }

  //

  dragover(e) {
    if (this.handleCustomEvent(e)) return;

    // XXX
  }
  dragenter(e) {
    if (this.handleCustomEvent(e)) return;

    // XXX
  }
  dragleave(e) {
    if (this.handleCustomEvent(e)) return;

    // XXX
  }
  async drop(e) {
    if (this.handleCustomEvent(e)) return;

    // console.log('got drop', e);
    // const [file] = e.files;
    // await file.uint8
    // debugger;
    document.dispatchEvent(new MessageEvent('drop', {
      data: e,
    }));
  }
  dragstart(e) {
    if (this.handleCustomEvent(e)) return;

    // XXX
  }
  drag(e) {
    if (this.handleCustomEvent(e)) return;

    // XXX
  }
  dragend(e) {
    if (this.handleCustomEvent(e)) return;

    // XXX
  }

  //

  paste = e => {
    if (this.handleCustomEvent(e)) return;

    if (!globalThis.document.activeElement) {
      const items = Array.from(e.clipboardData.items);
      if (items.length > 0) {
        // e.preventDefault();
        console.log('paste items', items);
      }
    }
  };
}
