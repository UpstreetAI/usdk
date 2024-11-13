import * as THREE from 'three';
import alea from 'alea';
import weighted from 'weighted';

import easing from '../../easing.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localVector5 = new THREE.Vector3();
const localVector6 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localQuaternion3 = new THREE.Quaternion();
const localQuaternion4 = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

//

// const cubicBezier = easing(0, 1, 0, 1);
// const ease = easing(0.25, 0.1, 0.25, 1.0);
// const easeIn = easing(0.42, 0, 1.0, 1.0);
// const easeOut = easing(0, 0, 0.58, 1.0);
const easeInOut = easing(0.42, 0, 0.58, 1.0);
// const lerpEasings = [
//   // cubicBezier,
//   // ease,
//   // easeIn,
//   // easeOut,
//   easeInOut,
// ];

const upVector = new THREE.Vector3(0, 1, 0);

const intervalPreMin = 0;
const intervalPreMax = 1000;

const animationTimeMin = 2000;
const animationTimeMax = 5000;

const intervalDelayMin = 0;
const intervalDelayMax = 2000;

// const offsetDistanceMin = 0.5;
// const offsetDistanceMax = 3.0;

//

// find a binding spec in reverse order
const findBindings = (bindingCandidates, {
  bindingSpecs = [],
  required = Array(bindingSpecs.length).fill(true),
} = {}) => {
  const {
    locationTargets,
    characterTargets,
    propTargets,
    bindingsList,
  } = bindingCandidates;

  const _computeFingerprint = (results) => results.map(r => r?.value?.id ?? null).join(':');
  const _bindToMessage = () => {
    // try to bind to a message
    for (let i = bindingsList.length - 1; i >= 0; i--) {
      let bindings = bindingsList[i];
      bindings = bindings.getBindings().slice();

      // for each binding spec, try to find a binding with a matching type
      const result = [];
      let j;
      for (j = 0; j < bindingSpecs.length; j++) {
        const typesNeeded = bindingSpecs[j];
        const bindingIndex = bindings.findIndex(b => typesNeeded.includes(b.type));
        if (bindingIndex !== -1) {
          const binding = bindings.splice(bindingIndex, 1)[0];
          result.push(binding);
        } else {
          break;
        }
      }
      // if we found all the bindings
      if (j === bindingSpecs.length) {
        result.fingerprint = _computeFingerprint(result);
        return result;
      // otherwise, continue with the next message
      } else {
        continue;
      }
    }

    // no message bindings found
    return null;
  };
  const _bindToState = () => {
    const locationTargetsLocal = locationTargets.slice();
    const characterTargetsLocal = characterTargets.slice();
    const propTargetsLocal = propTargets.slice();

    // for each binding spec, try to find a state binding with a matching type
    const result = [];
    let i;
    for (i = 0; i < bindingSpecs.length; i++) {
      const typesNeeded = bindingSpecs[i];
      const requiredValue = !!required[i];

      const bindingsSrc = (() => {
        for (const typeNeeded of typesNeeded) {
          if (typeNeeded === 'location' && locationTargetsLocal.length > 0) {
            const index = Math.floor(Math.random() * locationTargetsLocal.length);
            const value = locationTargetsLocal.splice(index, 1)[0];
            return {
              type: 'location',
              value,
            };
          } else if (typeNeeded === 'character' && characterTargetsLocal.length > 0) {
            const index = Math.floor(Math.random() * characterTargetsLocal.length);
            const value = characterTargetsLocal.splice(index, 1)[0];
            return {
              type: 'character',
              value,
            };
          } else if (typeNeeded === 'prop' && propTargetsLocal.length > 0) {
            const index = Math.floor(Math.random() * propTargetsLocal.length);
            const value = propTargetsLocal.splice(index, 1)[0];
            return {
              type: 'prop',
              value,
            };
          }
        }
      })();
      // console.log('type needed', typesNeeded, bindingsSrc, locationTargetsLocal.length, characterTargetsLocal.length, propTargetsLocal.length);
      if (bindingsSrc) {
        result.push(bindingsSrc);
      } else {
        if (requiredValue) {
          return null;
        } else {
          result.push(null);
        }
      }
    }
    // if we found all the bindings
    if (i === bindingSpecs.length) {
      result.fingerprint = _computeFingerprint(result);
      return result;
    } else {
      return null;
    }
  };

  const result = _bindToMessage() ?? _bindToState() ?? null;
  // console.log('find bindings', {
  //   result,
  // });
  return result;
};

//

const makeOffsetAnimation = ({
  object,
  distance,
  startTime,
  animationEndTime,
  seed = (Math.floor(Math.random() * 0xFFFFFFFF)).toString(16),
}) => {
  const rng = alea(seed);
  const animationTime = animationEndTime - startTime;

  const allowedOffsetSpecs = [
    {
      offset: [0, 0, 0],
      weight: 2,
    },
    {
      offset: [-1, 0, 0],
      weight: 0.5,
    },
    {
      offset: [1, 0, 0],
      weight: 0.5,
    },
    {
      offset: [0, -0.25, 0],
      weight: 0.25,
    },
    {
      offset: [0, 0.25, 0],
      weight: 0.25,
    },
    {
      offset: [0, 0, -0.25],
      weight: 0.1,
    },
  ];
  const allowedOffsets = allowedOffsetSpecs.map(s => s.offset);
  const allowedOffsetWeights = allowedOffsetSpecs.map(s => s.weight);
  const offset = weighted.select(
    allowedOffsets,
    allowedOffsetWeights,
    {
      rand: () => rng(),
      normal: false,
    },
  );
  // console.log('got offset', offset);

  // const offsetIndex = Math.floor(rng() * allowedOffsets.length);
  // const offset = allowedOffsets[offsetIndex];
  // const offsetDistance = offsetDistanceMin + (offsetDistanceMax - offsetDistanceMin) * rng();
  // const offsetDistance = distance * (0.5 + rng() * 1.5);
  const offsetDistance = distance * (1 + rng() * 2);
  const offsetVector = new THREE.Vector3().fromArray(offset)
    .applyQuaternion(object.quaternion)
    .multiplyScalar(offsetDistance);

  // XXX cast the camera ray back and to the sides to clamp the range
  let endPosition = object.position.clone();
  let startPosition = endPosition.clone()
    .add(offsetVector);

  // small chance to not animate
  const staticAnimation = rng() < 0.2;
  // small chance to swap direction
  // flip the pan direction if we're offseting in z to account for characters being flipped
  const f = rng();
  let reverse = !staticAnimation && ((f < 0.1) ^ (offset[2] !== 0));
  if (reverse) {
    [startPosition, endPosition] = [endPosition, startPosition];
  }

  return {
    update(now) {
      const timeDiff = now - startTime;
      let factor;
      if (staticAnimation) {
        // console.log('static animation');
        factor = 0;
      } else {
        factor = timeDiff / animationTime;
        factor = Math.min(Math.max(factor, 0), 1);
        factor = easeInOut(factor);
      }

      // const offset = new THREE.Vector3()
        // .lerpVectors(startPosition, endPosition, factor);

      object.position.lerpVectors(startPosition, endPosition, factor);
      // console.log('lerp', factor, endPosition.clone().sub(startPosition).toArray());
      object.updateMatrixWorld();

      // return factor < 1;
    },
  };
};
const oneTargetCamera = {
  bind(bindingCandidates) {
    return findBindings(bindingCandidates, {
      bindingSpecs: [
        ['character', 'prop'],
      ],
    });
  },
  *generator({
    camera,
    postProcessing,

    bindings,

    // seed,
    animate,

    closeupDistance,

    now,
  }) {
    const [
      characterBinding,
    ] = bindings;

    const actor = characterBinding.value;
    const player = actor.object;
    var height = player.avatar.height;
    const headBone = player;

    const startTime = now;
    const preEndTime = startTime + this.prePhaseTime;
    const animationEndTime = preEndTime + this.animationPhaseTime;
    let offsetAnimation = null;
    const raycaster = new THREE.Raycaster();
    const intersectionObjects = []; 
    intersectionObjects.push(player.avatarApp);
    for (; now < animationEndTime; now = yield) {
      headBone.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      localVector2.setY(height/2);

      const cameraTargetPosition = camera.position.copy(localVector)
        .add(
          localVector2.set(0, 0, -closeupDistance)
            .applyQuaternion(localQuaternion)
        );
        raycaster.set(headBone.position, cameraTargetPosition.clone().sub(headBone.position).normalize());
        const intersections = raycaster.intersectObjects(intersectionObjects);
        let intersection = null;
        let nearestDistance = Infinity;
        if (intersections.length > 0) {
          for(let i = 0; i < intersections.length;i++) {
            if (intersections[i].distance > 0.2 && intersections[i].distance < nearestDistance) {
              nearestDistance = intersections[i];
              intersection = intersections[i];
            }
          }
        }
        if (intersection) {
          const distanceToIntersection = intersections[0].distance;
          camera.position.copy(headBone.position)
            .add(localVector2.set(0, 0, -distanceToIntersection).applyQuaternion(localQuaternion));
        } else {
          camera.position.copy(cameraTargetPosition);
        }

      camera.quaternion.setFromRotationMatrix(
        localMatrix.lookAt(
          camera.position,
          localVector,
          upVector,
        )
      );
      clearQuaternionXZ(camera.quaternion);
      camera.updateMatrixWorld();

      // animate
      if (animate) {
        if (offsetAnimation === null) {
          offsetAnimation = makeOffsetAnimation({
            object: camera,
            distance: closeupDistance,
            // seed,
            startTime: preEndTime,
            animationEndTime,
          });
        }
        // console.log('tick one');
        offsetAnimation.update(now);
      }

      // update focus
      postProcessing.setFocusZ(closeupDistance);
    }

    const waitEndTime = animationEndTime + this.waitPhaseTime;
    for (; now < waitEndTime; now = yield) {
      // nothing
    }
  },
};
const twoTargetCamera = {
  bind(bindingCandidates) {
    return findBindings(bindingCandidates, {
      bindingSpecs: [
        ['location'],
        ['character', 'prop'],
        ['character', 'prop']
      ],
    });
  },
  *generator({
    camera,
    postProcessing,

    bindings,

    // seed,
    animate,

    xOffset,
    zOffset,

    now,
  }) {
    const [
      locationBinding,
      characterBinding,
      objectBinding,
    ] = bindings;

    const centerTarget = locationBinding.value;

    // over the shoulder of lastTarget2, looking toward lastTarget
    const actor = characterBinding.value;
    const player = actor.object;
    const headBone = player//.avatar.modelBones.Head;

    const actor2 = objectBinding.value;
    const player2 = actor2.object;
    const headBone2 = player2//objectBinding.type === 'character' ? player2.avatar.modelBones.Head : player2;

    const startTime = now;
    const preEndTime = startTime + this.prePhaseTime;
    const animationEndTime = preEndTime + this.animationPhaseTime;
    let offsetAnimation = null;
    for (; now < animationEndTime; now = yield) {
      headBone.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      headBone2.matrixWorld.decompose(localVector3, localQuaternion2, localVector4);

      const vectorFromCurrentToLast = localVector2.copy(localVector3)
        .sub(localVector);
      const quaternionFromLastToCurrent = localQuaternion3.setFromRotationMatrix(
        localMatrix.lookAt(
          localVector3,
          localVector,
          upVector
        )
      );
      const candidatePositions = [
        -xOffset,
        xOffset,
      ].map(xOffset => {
        const sideDelta = new THREE.Vector3(xOffset, 0, zOffset)
          .applyQuaternion(quaternionFromLastToCurrent);
        return localVector.clone()
          .add(
            vectorFromCurrentToLast
          )
          .add(
            sideDelta
          );
      });

      centerTarget.matrixWorld.decompose(
        localVector5,
        localQuaternion4,
        localVector6,
      );
      const centerTargetPosition = localVector5;

      const candidatePositionDistanceSpecs = candidatePositions.map(candidatePosition => {
        const distance = candidatePosition.distanceTo(centerTargetPosition);
        return {
          candidatePosition,
          distance,
        };
      });
      const closestPositionToCenter = candidatePositionDistanceSpecs
        .sort((a, b) => a.distance - b.distance)[0].candidatePosition

      camera.position.copy(closestPositionToCenter);
      camera.quaternion.setFromRotationMatrix(
        localMatrix.lookAt(
          camera.position,
          localVector,
          upVector,
        )
      );
      camera.updateMatrixWorld();

      // animate
      if (animate) {
        if (offsetAnimation === null) {
          offsetAnimation = makeOffsetAnimation({
            object: camera,
            distance: zOffset,
            // seed,
            startTime: preEndTime,
            animationEndTime,
          });
        }
        // console.log('tick two');
        offsetAnimation.update(now);
      }

      // update focus
      const cameraDistance = camera.position.distanceTo(localVector);
      postProcessing.setFocusZ(cameraDistance);
    }

    const waitEndTime = animationEndTime + this.waitPhaseTime;
    for (; now < waitEndTime; now = yield) {
      // nothing
    }
  },
};

//

const clearQuaternionXZ = (() => {
  const localEuler = new THREE.Euler();
  return q => {
    localEuler.setFromQuaternion(q, 'YXZ');
    localEuler.x = 0;
    localEuler.z = 0;
    q.setFromEuler(localEuler);
  };
})();

//

class AnimationState extends EventTarget {
  constructor({
    camera,
    postProcessing,

    bindings = {},
    fingerprint = '',
    valid = true,

    seed = (Math.floor(Math.random() * 0xFFFFFFFF)).toString(16),
    animate = true,
    prePhaseTime = Math.random() < 0.5 ?
      (intervalPreMin + (intervalPreMax - intervalPreMin) * Math.random())
    :
      0,
    animationPhaseTime = animationTimeMin + (animationTimeMax - animationTimeMin) * Math.random(),
    waitPhaseTime = intervalDelayMin + (intervalDelayMax - intervalDelayMin) * Math.random(),
  }) {
    super();

    this.camera = camera;
    this.postProcessing = postProcessing;

    // identifying hash of this animation
    this.fingerprint = fingerprint;
    // world object bindings for the animation
    this.bindings = bindings;
    // valid flag
    this.valid = valid;
    // seed value for animation rngs
    this.seed = seed;
    // whether to run animaton
    this.animate = animate;
    // time to wait before starting animation
    this.prePhaseTime = prePhaseTime;
    // time for the animation to complete
    this.animationPhaseTime = animationPhaseTime;
    // time to wait after animation completes
    this.waitPhaseTime = waitPhaseTime;

    // internal state
    this.generator = null;
    this.doneTimestamp = Infinity;
  }
  isValid() {
    return !!this.valid;
  }
  getFingerprint() {
    return this.fingerprint;
  }
  update(now) {
    if (!this.generator) {
      this.generator = this.generatorFn(now);
    }

    const {
      done,
      // value,
    } = this.generator.next(now);
    if (done) {
      this.doneTimestamp = now;
      this.dispatchEvent(new MessageEvent('end'));
    }
    return !done;
  }
}
class EstablishingAnimation extends AnimationState {
  constructor(opts) {
    const {
      bindingCandidates,
    } = opts;
    const bindings = findBindings(bindingCandidates, {
      bindingSpecs: [
        ['location'],
        ['character', 'prop'],
      ],
      required: [
        false,
        false,
      ],
    });
    const fingerprint = `establishing:${bindings?.fingerprint ?? null}`;
    const valid = !!bindings;

    super({
      ...opts,
      bindings,
      fingerprint,
      valid,
    });
  }
  *generatorFn(now) {
    const {
      camera,
      postProcessing,

      bindings,
  
      fingerprint,
      valid,
      // seed,
      animate,
    } = this;

    const [
      locationBinding,
      targetBinding,
    ] = bindings;
    const locationTarget = locationBinding?.value ?? null;
    const targetActor = targetBinding?.value ?? null;

    const lookFromLocationToTarget = (locationTarget, target) => {
      locationTarget.matrixWorld.decompose(
        camera.position,
        localQuaternion,
        localVector2,
      );
      target.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      camera.position.y = localVector.y;
      camera.quaternion.setFromRotationMatrix(
        localMatrix.lookAt(
          camera.position,
          localVector,
          upVector,
        )
      );
    };

    const startTime = now;
    const preEndTime = startTime + this.prePhaseTime;
    const animationEndTime = preEndTime + this.animationPhaseTime;
    let offsetAnimation = null;
    for (; now < animationEndTime; now = yield) {
      // animate
      if (locationTarget && targetActor) {
        let target;
        if (targetActor.type === 'character') {
          const player = targetActor.object;
          const headBone = player//.avatar.modelBones.Head;
          target = headBone;
        } else if (targetActor.type === 'prop') {
          const object = targetActor.object;
          target = object?.center ?? object;
        } else {
          throw new Error('invalid target type: ' + targetActor.type);
        }
        lookFromLocationToTarget(locationTarget, target);
        camera.updateMatrixWorld();
      } else if (locationTarget) {
        locationTarget.matrixWorld.decompose(
          camera.position,
          camera.quaternion,
          localVector2,
        );
        camera.updateMatrixWorld();
      } else {
        // nothing
      }

      // animate
      if (animate) {
        if (offsetAnimation === null) {
          offsetAnimation = makeOffsetAnimation({
            object: camera,
            distance: 2,
            // seed,
            startTime: preEndTime,
            animationEndTime,
          });
        }
        // console.log('tick establish');
        offsetAnimation.update(now);
      }

      // focus
      const cameraDistance = camera.position.distanceTo(localVector);
      postProcessing.setFocusZ(cameraDistance);
    }

    const waitEndTime = animationEndTime + this.waitPhaseTime;
    for (; now < waitEndTime; now = yield) {
      // nothing
    }
  }
}
class SimpleAnimation extends AnimationState {
  constructor(opts) {
    const {
      camera,
      postProcessing,

      bindingCandidates,
    } = opts;

    const bindings = findBindings(bindingCandidates, {
      bindingSpecs: [
        ['character', 'prop'],
      ],
    });
    const fingerprint = `simple:${bindings?.fingerprint ?? null}`;
    const valid = !!bindings;

    super({
      ...opts,
      bindings,
      fingerprint,
      valid,
    });
  }
  *generatorFn(now) {
    const {
      camera,
      postProcessing,

      bindings,

      fingerprint,
      valid,
      // seed,
      animate,
    } = this;

    const [
      simpleBinding,
    ] = bindings;

    let simpleTarget = simpleBinding.value;
    if (simpleTarget.isActor) {
      simpleTarget = simpleTarget.object;
    }

    const startTime = now;
    // const preEndTime = startTime + this.prePhaseTime;
    const animationEndTime = startTime + this.animationPhaseTime;
    for (; now < animationEndTime; now = yield) {
      // animate
      const simpleDistance = 0.5;
      simpleTarget.matrixWorld.decompose(localVector, localQuaternion, localVector2);
      clearQuaternionXZ(localQuaternion);
      camera.position.copy(localVector)
        .add(
          localVector2.set(0, 0, -simpleDistance)
            .applyQuaternion(localQuaternion)
        );
      camera.quaternion.setFromRotationMatrix(
        localMatrix.lookAt(
          camera.position,
          localVector,
          upVector,
        )
      );
      camera.updateMatrixWorld();

      // update focus
      postProcessing.setFocusZ(simpleDistance);
    }

    // const waitEndTime = animationEndTime + this.waitPhaseTime;
    // for (; now < waitEndTime; now = yield) {
    //   // nothing
    // }
  }
}
class CloseUpAnimation extends AnimationState {
  constructor(opts) {
    const {
      bindingCandidates,
    } = opts;

    const bindings = findBindings(bindingCandidates, {
      bindingSpecs: [
        ['character', 'prop'],
      ],
    });
    const fingerprint = `closeUp:${bindings?.fingerprint ?? null}`;
    const valid = !!bindings;

    super({
      ...opts,
      bindings,
      fingerprint,
      valid,
    });
  }
  generatorFn(now) {
    const {
      camera,
      postProcessing,
      // bindingsList,
      bindings,

      // seed,
      cameraState,
      animate,
    } = this;
    return oneTargetCamera.generator.call(this, {
      camera,
      postProcessing,
      // bindingsList,
      bindings,

      // seed,
      cameraState,
      animate,

      closeupDistance: 0.8,

      now,
    });
  }
}
class MediumCloseUpAnimation extends AnimationState {
  constructor(opts) {
    const {
      bindingCandidates,
    } = opts;

    const bindings = findBindings(bindingCandidates, {
      bindingSpecs: [
        ['character', 'prop'],
      ],
    });
    const fingerprint = `mediumCloseUp:${bindings?.fingerprint ?? null}`;
    const valid = !!bindings;

    super({
      ...opts,
      bindings,
      fingerprint,
      valid,
    });
  }
  generatorFn(now) {
    const {
      camera,
      postProcessing,

      // bindingsList,
      bindings,

      // seed,
      cameraState,
      animate,
    } = this;
    return oneTargetCamera.generator.call(this, {
      camera,
      postProcessing,

      // bindingsList,
      bindings,

      // seed,
      cameraState,
      animate,

      closeupDistance: 1.6,

      now,
    });

    // const result = findBindings(
    //   bindingsList,
    //   binding => binding.type === 'character'
    // );
    // if (result) {
    //   const {
    //     bindings,
    //     binding: characterBinding,
    //   } = result;

    //   if (characterBinding) {
    //     const actor = characterBinding.value;
    //     const player = actor.object;
    //     const headBone = player//.avatar.modelBones.Head;
    //     headBone.matrixWorld.decompose(localVector, localQuaternion, localVector2);

    //     const closeupDistance = 1.5;

    //     camera.position.copy(localVector)
    //       .add(
    //         localVector2.set(0, 0, -closeupDistance)
    //           .applyQuaternion(localQuaternion)
    //       );
    //     camera.quaternion.setFromRotationMatrix(
    //       localMatrix.lookAt(
    //         camera.position,
    //         localVector,
    //         upVector,
    //       )
    //     );
    //     clearQuaternionXZ(camera.quaternion);
    //     camera.updateMatrixWorld();

    //     postProcessing.setFocusZ(closeupDistance);

    //     return true;
    //   } else {
    //     return false;
    //   }
    // } else {
    //   return false;
    // }
  }
}
class OverTheShoulderAnimation extends AnimationState {
  constructor(opts) {
    const {
      bindingCandidates,
    } = opts;
    const bindings = twoTargetCamera.bind(bindingCandidates);
    const fingerprint = `overTheShoulder:${bindings?.fingerprint ?? null}`;
    const valid = !!bindings;

    super({
      ...opts,
      bindings,
      fingerprint,
      valid,
    });
  }
  generatorFn(now) {
    const {
      camera,
      postProcessing,

      bindings,

      // seed,
      animate,
    } = this;
    return twoTargetCamera.generator.call(this, {
      camera,
      postProcessing,

      bindings,

      // seed,
      animate,

      xOffset: 0.5,
      zOffset: 0.5,

      now,
    });
  }
}
class MediumWideAnimation extends AnimationState {
  constructor(opts) {
    const {
      bindingCandidates,
    } = opts;

    const bindings = twoTargetCamera.bind(bindingCandidates);
    const fingerprint = `mediumWide:${bindings?.fingerprint ?? null}`;
    const valid = !!bindings;

    super({
      ...opts,
      bindings,
      fingerprint,
      valid,
    });
  }
  generatorFn(now) {
    const {
      camera,
      postProcessing,

      bindings,
  
      // seed,
      animate,
    } = this;
    return twoTargetCamera.generator.call(this, {
      camera,
      postProcessing,

      bindings,

      // seed,
      animate,

      xOffset: 1.5,
      zOffset: 1.5,

      now,
    });
  }
}
class FullShotAnimation extends AnimationState {
  constructor(opts) {
    const {
      bindingCandidates,
    } = opts;

    const bindings = twoTargetCamera.bind(bindingCandidates);
    const fingerprint = `fullShot:${bindings?.fingerprint ?? null}`;
    const valid = !!bindings;

    super({
      ...opts,
      bindings,
      fingerprint,
      valid,
    });
  }
  generatorFn(now) {
    const {
      camera,
      postProcessing,

      bindings,
      // bindingsList,
  
      // seed,
      // cameraState,
      animate,
    } = this;
    return twoTargetCamera.generator.call(this, {
      camera,
      postProcessing,

      bindings,
      // bindingsList,

      // seed,
      // cameraState,
      animate,

      xOffset: 3.0,
      zOffset: 3.0,

      now,
    });
  }
}

//

export const cameraTypeFns = {
  establishing: {
    name: 'establishing',
    constructor: EstablishingAnimation,
    weight: 1,
  },
  simple: {
    name: 'simple',
    constructor: SimpleAnimation,
    weight: 0,
  },
  closeUp: {
    name: 'close-up',
    constructor: CloseUpAnimation,
    weight: 3,
  },
  mediumCloseUp: {
    name: 'medium close-up',
    constructor: MediumCloseUpAnimation,
    weight: 3,
  },
  overTheShoulder: {
    name: 'over the shoulder',
    constructor: OverTheShoulderAnimation,
    weight: 5,
  },
  mediumWide: {
    name: 'medium wide',
    constructor: MediumWideAnimation,
    weight: 3,
  },
  fullShot: {
    name: 'full shot',
    constructor: FullShotAnimation,
    weight: 3,
  },
};
export const cameraTypes = Object.keys(cameraTypeFns);