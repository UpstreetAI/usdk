import * as THREE from 'three';
import {Vector3, MathUtils} from 'three';
import {walkSpeed, runSpeed} from './constants.js';
// import {randomIdleAnimations} from './avatars/animationHelpers.js';
// import {randomSittingIdleAnimations} from './avatars/animationHelpers.js';

//

const localVector = new Vector3();
const localVector2 = new Vector3();
const localVector3 = new Vector3();
const localVector4 = new Vector3();
const localVector5 = new Vector3();
const localMatrix = new THREE.Matrix4();
const localCamera = new THREE.PerspectiveCamera();

//

const zeroVector = new Vector3(0, 0, 0);
const upVector = new Vector3(0, 1, 0);

//

/* const getRandomIdleInterval = () => {
  return MathUtils.randInt(10, 40);
}; */

const waypointRange = 10;
const waypointTouchDistance = 1;
export class CharacterBehavior {
  constructor({
    character,
  }) {
    // members
    /* if (!character) {
      debugger;
    } */
    this.character = character;

    // locals
    // this.lastBehaviorTime = 0;

    // for random idle animations
    // this.randomIdleStartTimeS = 0;
    // this.randomIdleEndTimeS = 0;
    // this.randomIdleIntervalTimeS = getRandomIdleInterval(); 
    // this.randomIdleDuration = 0;
    // this.randomIdleAnimations = [];
    // for (const key in randomIdleAnimations) {
    //   if (Object.hasOwnProperty.call(randomIdleAnimations, key)) {
    //     const { duration } = randomIdleAnimations[key];
    //     this.randomIdleAnimations.push({
    //       name: key,
    //       duration,
    //       nonce: 0
    //     });
    //   }
    // }

    // for random sitting idle animations
    // this.randomSittingIdleIndex = -1;
    // this.randomSittingIdleStartTimeS = 0;
    // this.randomSittingIdleEndTimeS = 0;
    // this.randomSittingIdleIntervalTimeS = 15;
    // this.randomSittingIdleDuration = 0;
  }

  addIdleAction(timestamp) {
    this.character.actionManager.addAction({
      type: 'behavior',
      behaviorType: 'idle',
      timeout: 1000 + Math.random() * 1000,
    });
    // this.lastBehaviorTime = timestamp;
  }
  addTalkToAction(targetName, timestamp, {
    timeout = 10 * 1000,
  } = {}) {
    this.character.actionManager.addAction({
      type: 'behavior',
      behaviorType: 'talkTo',
      // targetPosition: position.toArray(),
      targetName,
      startTimestamp: timestamp,
      timeout,
    });
    // this.lastBehaviorTime = timestamp;
  }
  addFaceTowardAction(position, timestamp, {
    timeout = 5 * 1000,
  } = {}) {
    this.character.actionManager.addAction({
      type: 'behavior',
      behaviorType: 'faceToward',
      targetPosition: position.toArray(),
      startTimestamp: timestamp,
      timeout,
    });
    // this.lastBehaviorTime = timestamp;
  }
  addWaypointAction(position, timestamp, {
    speed,
    boundingBox = null,
    timeout = 10 * 1000,
  } = {}) {
    this.character.actionManager.addAction({
      type: 'behavior',
      behaviorType: 'waypoint',
      targetPosition: position.toArray(),
      boundingBox: boundingBox ? {
        min: boundingBox.min.toArray(),
        max: boundingBox.max.toArray(),
      } : null,
      speed,
      startTimestamp: timestamp,
      timeout,
    });
    // this.lastBehaviorTime = timestamp;
  }
  clearWaypointActions() {
    let action;
    while (action = this.character.actionManager.findAction(action =>
      action.type === 'behavior' &&
      action.behaviorType === 'waypoint'
    )) {
      this.character.actionManager.removeAction(action);
    }
  }
  addRandomWaypointAction(timestamp) {
    this.addWaypointAction(
      this.character.position.clone()
        .add(
          localVector.set(
            (Math.random() - 0.5) * 2 * waypointRange,
            0,
            (Math.random() - 0.5) * 2 * waypointRange
          )
        ),
      timestamp
    );
  }
  addBehaviorAction(timestamp) {
    if (Math.random() < 0.5) {
      this.addIdleAction(timestamp);
    } else {
      this.addWaypointAction(timestamp);
    }
  }

  applyBehaviorAction(timestamp, timeDiff, behaviorAction) {
    const {
      behaviorType,
    } = behaviorAction;

    switch (behaviorType) {
      case 'idle': {
        const {
          startTimestamp,
          timeout,
        } = behaviorAction;

        const directionCamera = localCamera;
        directionCamera.position.set(0, 0, 0);
        directionCamera.quaternion.identity();
        directionCamera.updateMatrixWorld();
        this.character.characterPhysics.applyWasd(zeroVector, directionCamera, timeDiff);

        // check finish
        if ((timestamp - startTimestamp) > timeout) {
          this.character.actionManager.removeAction(behaviorAction);
        }
        break;
      }
      case 'talkTo': {
        // const directionCamera = localCamera;
        // directionCamera.position.set(0, 0, 0);
        // directionCamera.quaternion.identity();
        // directionCamera.updateMatrixWorld();
        // this.character.characterPhysics.applyWasd(zeroVector, directionCamera, timeDiff);

        console.log('talk to', behaviorAction);

        // check finish
        this.character.actionManager.removeAction(behaviorAction);
        break;
      }
      case 'faceToward': {
        const {
          startTimestamp,
          timeout,
        } = behaviorAction;

        const targetPosition = localVector.fromArray(behaviorAction.targetPosition);
      
        // face character towards the target
        const delta = localVector2.copy(targetPosition)
          .sub(this.character.position);
        delta.y = 0;
        delta.normalize();
        
        this.character.characterPhysics.targetCameraQuaternion.setFromRotationMatrix(
          localMatrix.lookAt(
            zeroVector,
            delta,
            upVector,
          ),
        );

        // check finish
        if ((timestamp - startTimestamp) > timeout) {
          this.character.actionManager.removeAction(behaviorAction);       
        }
        break;
      }
      case 'waypoint': {
        const targetPosition = localVector.fromArray(behaviorAction.targetPosition);
        const delta = localVector2.copy(targetPosition)
          .sub(this.character.position);
        delta.y = 0;
        const v = localVector3.copy(delta);
        const distance = v.length();
        const boundingBox = (() => {
          if (behaviorAction.boundingBox) {
            const boundingBox = new THREE.Box3(
              new THREE.Vector3().fromArray(behaviorAction.boundingBox.min),
              new THREE.Vector3().fromArray(behaviorAction.boundingBox.max),
            );
            boundingBox.min.y = -10000;
            boundingBox.max.y = 10000;
            return boundingBox;
          } else {
            return null;
          }
        })();

        // velocity
        const speed = behaviorAction.speed ?? MathUtils.clamp(
          MathUtils.mapLinear(
            distance,
            0, 5,
            walkSpeed / 4, runSpeed,
          ),
          0, runSpeed,
        );
        const velocity = v.normalize()
          .multiplyScalar(speed);

        // direction camera
        const directionCamera = localCamera;
        directionCamera.position.copy(this.character.position)
          .sub(delta);
        directionCamera.quaternion.copy(this.character.quaternion);
        directionCamera.updateMatrixWorld();

        // apply wasd
        this.character.characterPhysics.applyWasd(velocity, directionCamera, timeDiff);

        // check finish
        const positionXZ = localVector4.copy(this.character.position);
        positionXZ.y = 0;
        const targetPositionXZ = localVector5.copy(targetPosition);
        targetPositionXZ.y = 0;
        const distanceToBoundingBox = boundingBox ?
          boundingBox.distanceToPoint(positionXZ)
        :
          Infinity;
        if (
          (positionXZ.distanceTo(targetPositionXZ) < waypointTouchDistance) ||
          (distanceToBoundingBox < waypointTouchDistance) ||
          (timestamp - behaviorAction.startTimestamp > behaviorAction.timeout)
        ) {
          this.character.actionManager.removeAction(behaviorAction);

          const directionCamera = localCamera;
          directionCamera.position.set(0, 0, 0);
          directionCamera.quaternion.identity();
          directionCamera.updateMatrixWorld();
          this.character.characterPhysics.applyWasd(zeroVector, directionCamera, timeDiff);
        }
        break;
      }
      default: {
        throw new Error('unknown behavior type: ' + behaviorType);
      }
    }
  }

  /* HandleRandomIdleAction(timestamp) {
    const nowS = timestamp / 1000;
    const randomIdleAction = this.character.actionManager.getActionType('randomIdle');
    if (randomIdleAction) {
      const timeS = nowS - this.randomIdleStartTimeS;
      const emoteAction = this.character.actionManager.getActionType('emote');
      if (timeS >= this.randomIdleDuration || emoteAction) {
        this.character.actionManager.removeActionType('randomIdle')
        this.randomIdleEndTimeS = nowS;
      }
      else {
        this.character.avatar.looker.setLookAction('random');
      }
    } else {
      const isSpeaking = this.character.avatar.volume > 0;
      const emoteAction = !!this.character.actionManager.getActionType('emote');
      if (isSpeaking || emoteAction) {
        this.randomIdleEndTimeS = nowS;
      }
      else if (nowS - this.randomIdleEndTimeS > this.randomIdleIntervalTimeS) {
        const weightedRandom = (weights) => {
          let totalWeight = 0;
          for (let i = 0; i < weights.length; i++) {
            totalWeight += weights[i];
          }
      
          let random = Math.random() * totalWeight;
          for (let i = 0; i < weights.length; i++) {
            if (random < weights[i]) {
              return i;
            }
            random -= weights[i];
          }
      
          return -1;
        };
        const maxNonce = this.randomIdleAnimations.reduce((max, randomIdleAnimation) => Math.max(max, randomIdleAnimation.nonce), 0);
        const weights = this.randomIdleAnimations.map(({nonce}) => {
          return 1 - nonce / (maxNonce + 1);
        });
        const selectionIndex = weightedRandom(weights);
        const randomIdleAnimationSpec = this.randomIdleAnimations[selectionIndex];
        if (!randomIdleAnimationSpec) {
          debugger;
        }
        randomIdleAnimationSpec.nonce++;
        while (this.randomIdleAnimations.every((randomIdleAnimation) => randomIdleAnimation.nonce > 0)) {
          for (const randomIdleAnimationSpec of this.randomIdleAnimations) {
            randomIdleAnimationSpec.nonce--;
          }
        }
        this.randomIdleStartTimeS = nowS;
        this.randomIdleIntervalTimeS = getRandomIdleInterval();
        const speed = MathUtils.randFloat(0.25, 1); // 0.25 ~ 1
        const animationKeyName = randomIdleAnimationSpec.name;
        const leastDuration = Math.max(2, randomIdleAnimationSpec.duration);
        this.randomIdleDuration = leastDuration / speed;

        const newRandomIdleAction = {
          type: 'randomIdle',
          animation: animationKeyName,
          speed: speed,
          duration: this.randomIdleDuration,
          transition: 0.5
        }
        this.character.actionManager.addAction(newRandomIdleAction);
      }
    }
  }

  HandleRandomSittingIdleAction(timestamp) {
    const nowS = timestamp / 1000;
    const randomSittingIdleAction = this.character.actionManager.getActionType('randomSittingIdle');
    if (randomSittingIdleAction) {
      const timeS = nowS - this.randomSittingIdleStartTimeS;
      if (timeS >= this.randomSittingIdleDuration) {
        this.character.actionManager.removeActionType('randomSittingIdle')
        this.randomSittingIdleEndTimeS = nowS;
      }
    } else {
      if (nowS - this.randomSittingIdleEndTimeS > this.randomSittingIdleIntervalTimeS) {
        const keyNames = Object.keys(randomSittingIdleAnimations);

        // random indexes
        this.randomSittingIdleIndex = MathUtils.randInt(0, keyNames.length - 1);

        // // sequential indexes
        // this.randomSittingIdleIndex++;
        // if (this.randomSittingIdleIndex >= keyNames.length) {
        //   this.randomSittingIdleIndex = 0;
        // }

        this.randomSittingIdleStartTimeS = nowS;
        this.randomSittingIdleIntervalTimeS = MathUtils.randInt(3, 15); // 3 ~ 15
        const speed = MathUtils.randFloat(0.25, 1); // 0.25 ~ 1
        const animationKeyName = keyNames[this.randomSittingIdleIndex];
        const leastDuration = Math.max(2, randomSittingIdleAnimations[animationKeyName].duration);
        this.randomSittingIdleDuration = leastDuration / speed;

        const newRandomSittingIdleAction = {
          type: 'randomSittingIdle',
          animation: animationKeyName,
          speed: speed,
          duration: this.randomSittingIdleDuration,
        }
        this.character.actionManager.addAction(newRandomSittingIdleAction);
      }
    }
  } */

  update(timestamp, timeDiff) {
    /* const sitAction = this.character.actionManager.getActionType('sit');
    if (sitAction && sitAction.animation === 'ergonomicChair') {
      this.HandleRandomIdleAction(timestamp);
    }
    else {
      this.HandleRandomIdleAction(timestamp);
    } */
    // if (!this.character.actionManager.hasActionType('behavior')) {
    //   this.addBehaviorAction(timestamp);
    // }

    let behaviorAction = this.character.actionManager.getActionType('behavior');
    if (behaviorAction) {
      this.applyBehaviorAction(timestamp, timeDiff, behaviorAction);
    }
  }
}