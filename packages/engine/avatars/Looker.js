import * as THREE from 'three';
import {
  getEyePosition,
} from './util.mjs';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localPlane = new THREE.Plane();
export default class Looker {
  constructor(avatar) {
    this.avatar = avatar;

    this.mode = 'ready';
    this.startTarget = new THREE.Vector3();
    this.endTarget = new THREE.Vector3();
    this.waitTime = 0;
    this.lastTimestamp = 0;

    this.lookTargetWaitTime = 10000;
    this.lookTargetlastTimestamp = 0;
    
    this.lookAction = 'random'; // random, mouse, camera

    this.mousePos = null;
    this.mouseOffset = {x:0,y:0}
    this.camera = null;

    this._target = new THREE.Vector3();
  }

  updateMouse(mousePos){
    this.mousePos = mousePos; 
  }
  setMouseOffset(xOffset, yOffset){
    this.mouseOffset = {x:xOffset, y:yOffset};
  }

  setCamera(camera){
    this.camera = camera;
  }

  _getUsableOptions(){
    const options = ['random', 'forward']
    if (this.camera != null){
      options.push ('camera');
    }
    if (this.mousePos != null){
      options.push('mouse');
    }
    return options;
  }

  setLookAction(option){
    const options = this._getUsableOptions();
    if (options.includes(option)){
      this.lookAction = option;
      this.lookTargetlastTimestamp = this.timestamp;
    }
  }
  
  update(now) {
    this.timestamp = now;
    const _randomizeLookAction = () => {
      const options = this._getUsableOptions();
      this.lookAction = options[Math.floor(Math.random() * options.length)];
    }
    const timeDiff = now - this.lookTargetlastTimestamp;
    if (timeDiff > this.lookTargetWaitTime) {
      this.lookTargetlastTimestamp = now;
      _randomizeLookAction();
    }
    // set lookAction randomly
    const _getEndTarget = (target, output) =>{
      const head = this.avatar.modelBoneOutputs.Head;
      const eyePosition = getEyePosition(this.avatar.modelBones);
      
      switch(output){
        case 'random':
          return target.copy(eyePosition)
            .add(
              localVector.set(0, 0, 1.5 + 3 * Math.random())
                .applyQuaternion(localQuaternion.setFromRotationMatrix(head.matrixWorld)),
            )
            .add(
              localVector.set(-0.5 + Math.random(), (-0.5 + Math.random()) * 0.3, -0.5 + Math.random())
                .normalize(),
              // .multiplyScalar(1)
            );
        case 'mouse':
          if (this.mousePos == null) {
            return target.copy(eyePosition);
          }
          return target.set(
            Math.max(Math.min(-window.screen.width + this.mousePos.x + this.mouseOffset.x, 60),-60),
            Math.max(Math.min(window.screen.height - this.mousePos.y + this.mouseOffset.y-110, 50),-100),
            100) // Take the scene origin + canvas position
        case 'camera':
          if (this.camera == null) {
            return target.copy(eyePosition)
            .add(
              localVector.set(0, 0, 2)
                .applyQuaternion(localQuaternion.setFromRotationMatrix(head.matrixWorld)),
            );
          }
          return target.copy(this.camera.position)
        case 'forward':
          return target.copy(eyePosition)
            .add(
              localVector.set(0, 0, 2)
                .applyQuaternion(localQuaternion.setFromRotationMatrix(head.matrixWorld)),
            );
          }
    }
    const _startMove = () => {
      this.mode = 'moving';
      // const head = this.avatar.modelBoneOutputs['Head'];
      // const root = this.avatar.modelBoneOutputs['Root'];
      this.startTarget.copy(this.endTarget);
      _getEndTarget(this.endTarget, this.lookAction);
      this.waitTime = 100;
      this.lastTimestamp = now;
    };
    const _startDelay = () => {
      this.mode = 'delay';
      this.waitTime = Math.random() * 2000;
      this.lastTimestamp = now;
    };
    const _startWaiting = () => {
      this.mode = 'waiting';
      this.lookAction === 'random' ? this.waitTime = Math.random() * 3000 :  this.waitTime = 30 ;
      this.lastTimestamp = now;
    };
    const _isSpeedTooFast = () => this.avatar.velocity.length() > 0.5;
    const _isPointTooClose = () => {
      const root = this.avatar.modelBoneOutputs.Root;
      // const head = this.avatar.modelBoneOutputs['Head'];
      localVector.set(0, 0, 1)
        .applyQuaternion(localQuaternion.setFromRotationMatrix(root.matrixWorld));
      localVector2.setFromMatrixPosition(root.matrixWorld);
      localPlane.setFromNormalAndCoplanarPoint(
        localVector,
        localVector2,
      );
      const distance = localPlane.distanceToPoint(this.endTarget);
      return distance < 1;
    };

    // console.log('got mode', this.mode, this.waitTime);
    if (_isSpeedTooFast()) {
      _getEndTarget(this.endTarget, 'forward');
      // this.startTarget.copy(this.endTarget);
      _startDelay();
      return null;
    } else if (_isPointTooClose() && this.lookAction == 'random') {  
      _getEndTarget(this.endTarget, 'forward');
      this.startTarget.copy(this.endTarget);
      _startDelay();
      return null;
    } else {
      switch (this.mode) {
        case 'ready': {
          _startMove();
          return this.startTarget;
        }
        case 'delay': {
          const timeDiff = now - this.lastTimestamp;
          if (timeDiff > this.waitTime) {
            _startMove();
            return this.startTarget;
          } else {
            return null;
          }
        }
        case 'moving': {
          const timeDiff = now - this.lastTimestamp;
          const f = Math.min(Math.max(timeDiff / this.waitTime, 0), 1);
          // console.log('got time diff', timeDiff, this.waitTime, f);
          const target = this._target.copy(this.startTarget)
            .lerp(this.endTarget, f);
          // _setTarget(target);

          if (f >= 1) {
            _startWaiting();
          }

          return target;
        }
        case 'waiting': {
          const f = Math.min(Math.max((now - this.lastTimestamp) / this.waitTime, 0), 1);
          // console.log(f)
          if (f >= 1) {
            _startMove();
            return this.startTarget;
          } else {
            return this.endTarget;
          }
        }
      }
    }
  }
}