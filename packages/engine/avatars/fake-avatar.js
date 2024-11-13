import * as THREE from 'three';

import {
  // getClosest2AnimationAngles,
  // getFirstPersonCurves,
  // _findArmature,
  // animations,
  // animationStepIndices,
  // waitForLoad as animationHelpersWaitForLoad,
  _createAnimation,
  // _updateAnimation,
} from './animationHelpers.js';

import {
  ActionManager,
} from '../action-manager.js';

import {
  AvatarBase,
} from './avatar-base.js';

// import {animationMappingConfig} from './AnimationMapping.js';
// import Blinker from './Blinker.js';
// import Emoter from './Emoter.js';
// import Looker from './Looker.js';
// import Nodder from './Nodder.js';

// // import * as wind from './simulation/wind.js';

// const localVector = new THREE.Vector3();
// const localVector2 = new THREE.Vector3();
// const localVector3 = new THREE.Vector3();
// const localVector4 = new THREE.Vector3();
// const localQuaternion = new THREE.Quaternion();
// const localQuaternion2 = new THREE.Quaternion();
// const localQuaternion3 = new THREE.Quaternion();
// const localQuaternion4 = new THREE.Quaternion();
// const localEuler = new THREE.Euler(0, 0, 0, 'YXZ');
// const localEuler2 = new THREE.Euler(0, 0, 0, 'YXZ');
// const localMatrix = new THREE.Matrix4();
// const localMatrix2 = new THREE.Matrix4();

// // const textEncoder = new TextEncoder();

// const maxIdleVelocity = 0.01;
// const maxHeadTargetTime = 2000;
// const lookAnimationAngleLimit = Math.PI * 0.45;
// const cubicBezier = easing(0.2, 1, 0.2, 1);

// const upRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI*0.5);
// // const downRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);
// const leftRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI*0.5);
// const rightRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI*0.5);

// const upVector = new THREE.Vector3(0, 1, 0);

//

const localEuler = new THREE.Euler();

// const y180Quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

//

class FakeLooker {
  constructor() {
  }
  setLookAction(action) {
  }
}

//

export const fakeAvatarHeight = 1.5;
// const neckToHeadHeight = 0.1;
// const hipsToNeckHeight = fakeAvatarHeight - neckToHeadHeight;

//

class FakeAvatar extends AvatarBase {
	constructor(app) {
    super();

    this.avatarQuality = app;

    this.shoulderWidth = 0.3;
    this.height = fakeAvatarHeight;

    ///

    this.direction = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    //

    _createAnimation(this);

    //

    const _makeInput = () => {
      const result = new THREE.Object3D();
      result.pointer = 0;
      result.grip = 0;
      result.enabled = false;
      return result;
    };
    this.inputs = {
      hmd: _makeInput(),
			leftGamepad: _makeInput(),
			rightGamepad: _makeInput(),
		};

    //

    this.useAnimationCombo = [];
    this.useAnimationEnvelope = [];
    this.vowels = Float32Array.from([1, 0, 0, 0, 0]);
    this.faceposes = [];

    //

    const o = (parent = null) => {
      const bone = new THREE.Object3D();
      if (parent) {
        parent.add(bone);
      }
      return bone;
    };
    const Root = o();
    const Hips = o(Root);
    Hips.rotation.y = Math.PI;
    const Spine = o(Hips);
    const Chest = o(Spine);
    const UpperChest = o(Chest);
    const Neck = o(UpperChest);
    // Neck.position.y = hipsToNeckHeight;
    const Head = o(Neck);
    // Head.position.y = neckToHeadHeight;
    const Eye_L = o(Head);
    const Eye_R = o(Head);
    Root.updateMatrixWorld();

    const foundModelBones = {
      Root,
  
      Hips,
      Spine,
      Chest,
      UpperChest,
      Neck,
      Head,
      Eye_L,
      Eye_R,
  
      Left_shoulder: o(),
      Left_arm: o(),
      Left_elbow: o(),
      Left_wrist: o(),
      Left_thumb2: o(),
      Left_thumb1: o(),
      Left_thumb0: o(),
      Left_indexFinger3: o(),
      Left_indexFinger2: o(),
      Left_indexFinger1: o(),
      Left_middleFinger3: o(),
      Left_middleFinger2: o(),
      Left_middleFinger1: o(),
      Left_ringFinger3: o(),
      Left_ringFinger2: o(),
      Left_ringFinger1: o(),
      Left_littleFinger3: o(),
      Left_littleFinger2: o(),
      Left_littleFinger1: o(),
      Left_leg: o(),
      Left_knee: o(),
      Left_ankle: o(),
  
      Right_shoulder: o(),
      Right_arm: o(),
      Right_elbow: o(),
      Right_wrist: o(),
      Right_thumb2: o(),
      Right_thumb1: o(),
      Right_thumb0: o(),
      Right_indexFinger3: o(),
      Right_indexFinger2: o(),
      Right_indexFinger1: o(),
      Right_middleFinger3: o(),
      Right_middleFinger2: o(),
      Right_middleFinger1: o(),
      Right_ringFinger3: o(),
      Right_ringFinger2: o(),
      Right_ringFinger1: o(),
      Right_littleFinger3: o(),
      Right_littleFinger2: o(),
      Right_littleFinger1: o(),
      Right_leg: o(),
      Right_knee: o(),
      Right_ankle: o(),
      Left_toe: o(),
      Right_toe: o(),
    };
    this.foundModelBones = foundModelBones;
    this.modelBones = foundModelBones;

    this.actionManager = new ActionManager();

    this.looker = new FakeLooker();
  }
  
  setHandEnabled(i, enabled) {
    // this.shoulderTransforms.handsEnabled[i] = enabled;
  }
  getHandEnabled(i) {
    // return this.shoulderTransforms.handsEnabled[i];
    return false;
  }

  setTopEnabled(enabled) {
    // this.shoulderTransforms.enabled = enabled;
  }
  getTopEnabled() {
    // return this.shoulderTransforms.enabled;
    return false;
  }

  setBottomEnabled(enabled) {
    // this.legsManager.enabled = enabled;
  }
  getBottomEnabled() {
    // return this.legsManager.enabled;
    return false;
  }

  decapitate() {
  }
  undecapitate() {
  }

  getAngle() {
    return 0;
  }

  update(timestamp, timeDiff, session) {
    // console.log('got input position',
    //   this.inputs.hmd.position.toArray().join(','),
    //   this.inputs.hmd.quaternion.toArray().join(','),
    // );

    this.foundModelBones.Root.position.copy(this.inputs.hmd.position);
    this.foundModelBones.Root.y -= fakeAvatarHeight;

    localEuler.setFromQuaternion(this.inputs.hmd.quaternion, 'YXZ');
    localEuler.x = 0;
    localEuler.z = 0;
    this.foundModelBones.Root.quaternion.setFromEuler(localEuler);

    this.foundModelBones.Root.updateMatrixWorld();

    //

    // animate

    const _updateVisemes = () => {
      const volumeValue = Math.min(this.volume * 15, 1);
      this.avatarQuality.setVolume(volumeValue);

      if (this.faceposes.length > 0) {
        const {
          emotion,
        } = this.faceposes[0];
        this.avatarQuality.setEmotion(emotion);
      } else {
        this.avatarQuality.setEmotion(null);
      }
    };
    _updateVisemes();

    //

    this.avatarQuality.position.copy(this.foundModelBones.Root.position);
    this.avatarQuality.position.y -= fakeAvatarHeight;
    this.avatarQuality.quaternion.copy(this.foundModelBones.Root.quaternion)
      // .premultiply(y180Quaternion);
    this.avatarQuality.updateMatrixWorld();

    // this.avatarQuality.position.copy(
    //   this.foundModelBones.Root.position
    // );
    // this.avatarQuality.quaternion.copy(
    //   this.foundModelBones.Root.quaternion
    // );
  }

  destroy() {
    // this.avatarQuality.destroy();
    // this.avatarQuality.scene.parent && this.avatarQuality.scene.parent.remove(this.avatarQuality.scene);

    // this.#cleanupAudio();
  }
}
// FakeAvatar.waitForLoad = async () => {
//   debugger;
// //   await Promise.all([
// //     avatarsWasmManager.waitForLoad(),
// //     animationHelpersWaitForLoad(),
// //   ]);
// };
// FakeAvatar.getAnimations = () => animations;
// FakeAvatar.getAnimationStepIndices = () => animationStepIndices;
// FakeAvatar.getAnimationMappingConfig = () => animationMappingConfig;

// FakeAvatar.getClosest2AnimationAngles = getClosest2AnimationAngles;
export default FakeAvatar;