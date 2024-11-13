import * as THREE from 'three';

import faceposes from '../../emote/faceposes.json';
import emotes from '../emotes.json';

import { getAngryMesh } from './mesh/angry/mesh.js';
import { getSorrowMesh } from './mesh/sorrow/mesh.js';
import { getFunMesh } from './mesh/fun/mesh.js';
import { getMessMesh } from './mesh/mess/mesh';
import { getSweatDropMesh } from './mesh/sweat-drop/mesh';
import { getKeyboardMesh } from './mesh/keyboard/mesh';
import { getShockMesh } from './mesh/shock/mesh';
import { getTearMesh } from './mesh/tear/mesh';
import { getQuestionMesh } from './mesh/question/mesh';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();

const rotY = new THREE.Quaternion();
rotY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

//

const initEmotesObject = (o, n) => {
  for (const emote of emotes) {
    o[emote.name] = n;
  }
  return o;
};

//

export default class ParticleManager {
  constructor(camera, renderer, scene, player) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.player = player;

    this.#initParticleMeshes();
  }
  
  #initParticleMeshes() {
    this.initAngry();
    this.initSorrow();
    this.initFun();
    this.initMess();
    this.initSweatDrop();
    this.initKeyboard();
    this.initShock();
    this.initTear();
    this.initQuestion();

    this.emotionMeshes = initEmotesObject({}, null);
    this.emotionMeshes.angry = this.angryMesh;
    this.emotionMeshes.irritated = this.angryMesh;
    this.emotionMeshes.sad = this.sorrowMesh;
    this.emotionMeshes.surprise = this.shockMesh;
    this.emotionMeshes.shocked = this.shockMesh;
    this.emotionMeshes.excited = this.funMesh;
    this.emotionMeshes.embarrassed = this.sweatDropMesh;
    this.emotionMeshes.searching = this.keyboardMesh;
    this.emotionMeshes.typing = this.keyboardMesh;
    this.emotionMeshes.confused = this.messMesh;
    this.emotionMeshes.cry = this.tearMesh;
    this.emotionMeshes.curious = this.questionMesh;

    this.counts = initEmotesObject({}, 0);
  }

  setPlayer(player) {
    this.player = player;
    this.avatar = this.player.avatar;
  }

  addEmotion(emotion) {
    if (this.counts[emotion] === undefined) {
      debugger;
    }

    const startEmotion = emotion => {
      if (this.currentMesh) {
        this.currentMesh.visible = false;
        this.currentMesh = null;
      }

      switch (emotion) {
        case 'agree': {
          console.log(emotion)
          break;
        }
        case 'irritated':
        case 'angry': {
          this.emitAngry();
          break;
        }
        case 'apologetic': {
          console.log(emotion)
          break;
        }
        case 'confused': {
          this.emitMess();
          break;
        }
        case 'cry': {
          this.emitTear();
          break;
        }
        case 'curious': {
          this.emitQuestion();
          break;
        }
        case 'disagree': {
          console.log(emotion)
          break;
        }
        case 'embarrassed': {
          this.emitSweatDrop();
          break;
        }
        case 'excited': {
          this.emitFun();
          break;
        }
        case 'typing': {
          this.emitKeyboard(0.2);
          break;
        }
        case 'searching': {
          this.emitKeyboard(0.3);
          break;
        }
        case 'sad': {
          this.emitSorrow();
          break;
        }
        case 'shocked':
        case 'surprise': {
          this.emitShock();
          break;
        }
        case 'victory': {
          console.log(emotion)
          break;
        }
        default: {
          break;
        }
      }


      const mesh = this.emotionMeshes[emotion];
      if (mesh) {
        this.currentMesh = mesh;
        this.currentMesh.visible = true;
      }
    };
    if (++this.counts[emotion] === 1) {
      startEmotion(emotion);
    }
  }

  removeEmotion(emotion) {
    if (this.counts[emotion] === undefined) {
      debugger;
    }

    const stopEmotion = emotion => {
      const mesh = this.emotionMeshes[emotion];
      if (mesh) {
        if (this.currentMesh === mesh) {
          this.currentMesh.visible = false;
          this.currentMesh = null;
        }
      }
    };
    if (--this.counts[emotion] === 0) {
      stopEmotion(emotion);
    }
  }

  update(timestamp, timeDiff) {
    if (!this.player) {
      return;
    }
    this.timestamp = timestamp;

    const head = this.player.avatar.modelBones.Head;
    const headOffset = 0.05;
    this.headHeight = head.matrixWorld.elements[13] + headOffset;

    localVector2.set(0, 0, -1);
    this.currentDir = localVector2.applyQuaternion(this.player.quaternion);
    this.currentDir.normalize();

    this.angryMesh.visible && this.updateAngry(timestamp);
    this.sorrowMesh.visible && this.updateSorrow(timestamp);
    this.funMesh.visible && this.updateFun(timestamp);
    this.messMesh.visible && this.updateMess(timestamp);
    this.sweatDropMesh.visible && this.updateSweatDrop(timestamp);
    this.keyboardMesh.visible && this.updateKeyboard(timestamp);
    this.shockMesh.visible && this.updateShock(timestamp);
    this.tearMesh.visible && this.updateTear(timestamp);
    this.questionMesh.visible && this.updateQuestion(timestamp);
  }

  setUpManager(camera, renderer, scene, player) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;
    this.player = player;

    this.scene.add(this.angryMesh);
    this.scene.add(this.sorrowMesh);
    this.scene.add(this.funMesh);
    this.scene.add(this.messMesh);
    this.scene.add(this.sweatDropMesh);
    this.scene.add(this.keyboardMesh);
    this.scene.add(this.shockMesh);
    this.scene.add(this.tearMesh);
    this.scene.add(this.questionMesh);
  }

  //################################################################ angry #################################################################
  initAngry() {
    this.angryMesh = getAngryMesh();
    // this.scene.add(this.angryMesh);
    this.angryMesh.visible = false;
  }

  emitAngry() {
    // this.angryMesh.visible = true;
  }

  updateAngry(timestamp) {
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    localVector3.set(this.currentDir.x, this.currentDir.y, this.currentDir.z).applyQuaternion(rotY);
    
    this.angryMesh.position.set(
      this.player.position.x + localVector.x * 0.2 + localVector3.x * 0.04, 
      this.headHeight + localVector.y * 0.2 + localVector3.y * 0.04 + 0.05, 
      this.player.position.z + localVector.z * 0.2 + localVector3.z * 0.04
    );
    
    this.angryMesh.quaternion.copy(this.camera.quaternion);

    const textureType = Math.cos(timestamp / 30);
    if (textureType > 0)
      this.angryMesh.material.uniforms.angryTexture.value = ParticleManager.angryTexture1;
    else 
      this.angryMesh.material.uniforms.angryTexture.value = ParticleManager.angryTexture2;
  
  }

  //################################################################ sorrow #################################################################
  initSorrow() {
    this.sorrowMesh = getSorrowMesh();
    // this.scene.add(this.sorrowMesh);
    this.sorrowMesh.material.uniforms.sorrowTexture1.value = ParticleManager.sorrowTexture1;
    this.sorrowMesh.material.uniforms.sorrowTexture2.value = ParticleManager.sorrowTexture2;
    this.sorrowMesh.visible = false;
  }

  emitSorrow() {
    // this.sorrowMesh.visible = true;
    const positionsAttribute = this.sorrowMesh.geometry.getAttribute('positions');
    const scalesAttribute = this.sorrowMesh.geometry.getAttribute('scales');
    const indexAttribute = this.sorrowMesh.geometry.getAttribute('index');
    
    const particleCount = this.sorrowMesh.info.particleCount;
    for (let i = 0; i < particleCount; i ++) {
      const radius = 0.25;
      positionsAttribute.setXYZ(
        i,
        this.player.position.x + (i - particleCount * 0.5) * radius + (Math.random() - 0.5) * radius, 
        i * 0.1 - this.headHeight * 0.5 + (Math.random() - 0.5) * radius,
        0
      )
      const index = Math.random() > 0.5 ? 1 : 0;
      indexAttribute.setX(i, index);
      this.sorrowMesh.info.index[i] = index;

      scalesAttribute.setX(i, 0.8 + Math.random() * 0.2);

    }

    positionsAttribute.needsUpdate = true;
    scalesAttribute.needsUpdate = true;
    indexAttribute.needsUpdate = true;
  }

  updateSorrow(timestamp) {
    
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    
    this.sorrowMesh.position.set(
      this.player.position.x - localVector.x * 0.2, 
      this.headHeight,  
      this.player.position.z - localVector.z * 0.2 
    );

    const positionsAttribute = this.sorrowMesh.geometry.getAttribute('positions');
    const indexAttribute = this.sorrowMesh.geometry.getAttribute('index');
    const particleCount = this.sorrowMesh.info.particleCount;
    const updateTexture = Math.cos(timestamp / 100) > 0;
    for (let i = 0; i < particleCount; i ++) {
      positionsAttribute.setXYZ(
        i,
        positionsAttribute.getX(i), 
        positionsAttribute.getY(i) + this.sorrowMesh.info.acc,
        positionsAttribute.getZ(i)
      )
      if (updateTexture) {
        const index = this.sorrowMesh.info.index[i] === 0 ? 1 : 0;
        indexAttribute.setX(i, index);
      }
      else {
        const index = this.sorrowMesh.info.index[i];
        indexAttribute.setX(i, index);
      }
    }

    positionsAttribute.needsUpdate = true;
    indexAttribute.needsUpdate = true;
   
    this.sorrowMesh.quaternion.copy(this.camera.quaternion);
  }

  //################################################################ fun #################################################################
  initFun() {
    this.funMesh = getFunMesh();
    // this.scene.add(this.funMesh);
    this.funMesh.material.uniforms.sparkleTexture.value = ParticleManager.sparkleTexture;
    this.funMesh.visible = false;
    
  }

  emitFun() {
    // this.funMesh.visible = true;
    const positionsAttribute = this.funMesh.geometry.getAttribute('positions');
    const scalesAttribute = this.funMesh.geometry.getAttribute('scales');
    
    const particleCount = this.funMesh.info.particleCount;
    for (let i = 0; i < particleCount; i ++) {
      const radius = 0.2;
      positionsAttribute.setXYZ(
        i,
        Math.cos(i) * radius, 
        (Math.random() - 0.5) * radius,
        Math.sin(i) * radius
      )
      scalesAttribute.setX(i, 0.8 + Math.random() * 0.1);
      this.funMesh.info.fadeIn[i] = true;
      this.funMesh.info.speed[i] = 0.05 + Math.random() * 0.05;
    }

    positionsAttribute.needsUpdate = true;
    scalesAttribute.needsUpdate = true;
  }

  updateFun(timestamp) {
    
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    this.funMesh.position.set(
      this.player.position.x - localVector.x * 0.1, 
      this.headHeight - localVector.y * 0.1, 
      this.player.position.z - localVector.z * 0.1
    );

    const scalesAttribute = this.funMesh.geometry.getAttribute('scales');
    const positionsAttribute = this.funMesh.geometry.getAttribute('positions');
    const particleCount = this.funMesh.info.particleCount;
    for (let i = 0; i < particleCount; i ++) {
      if (scalesAttribute.getX(i) > 1) {
        this.funMesh.info.fadeIn[i] = false;
      }
      else if (scalesAttribute.getX(i) < 0) {
        this.funMesh.info.fadeIn[i] = true;
        const radius = 0.2;
        positionsAttribute.setXYZ(
          i,
          Math.cos(i) * radius, 
          (Math.random() - 0.5) * radius,
          Math.sin(i) * radius
        )
      }

      if (this.funMesh.info.fadeIn[i]) {
        scalesAttribute.setX(i, scalesAttribute.getX(i) + this.funMesh.info.speed[i]);
      }
      else {
        scalesAttribute.setX(i, scalesAttribute.getX(i) - this.funMesh.info.speed[i]);
      }
    }

    scalesAttribute.needsUpdate = true;
    positionsAttribute.needsUpdate = true;
    
    this.funMesh.quaternion.copy(this.camera.quaternion);
  }

  //################################################################ mess #################################################################
  initMess() {
    this.messMesh = getMessMesh();
    // this.scene.add(this.messMesh);
    this.messMesh.material.uniforms.messTexture.value = ParticleManager.messTexture;
    this.messMesh.visible = false;
  }

  emitMess() {
    this.messMesh.index = 0;
    this.messMesh.lastEmitTime = 0;
  }

  updateMess(timestamp) {
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    
    this.messMesh.position.set(
      this.player.position.x + localVector.x * 0.21, 
      this.headHeight + localVector.y * 0.21 + 0.12, 
      this.player.position.z + localVector.z * 0.21
    );
    
    this.messMesh.quaternion.copy(this.camera.quaternion);

    const index = this.messMesh.index;
    this.messMesh.material.uniforms.textureOffset.value.set(
      (index % 2) * (1. / 2), 
      ((2 - 1) / 2) - Math.floor(index / 2) * (1 / 2)
    );
    this.messMesh.lastEmitTime ++;
    if (this.messMesh.lastEmitTime % 5 === 0) {
      this.messMesh.index ++;
    }
    if (this.messMesh.index >= 4) {
      this.messMesh.index = 0;
    }

    
  }

  //################################################################ sweat drop #################################################################
  initSweatDrop() {
    this.sweatDropMesh = getSweatDropMesh();
    // this.scene.add(this.sweatDropMesh);
    this.sweatDropMesh.material.uniforms.sweatDropTexture.value = ParticleManager.sweatDropTexture;
    this.sweatDropMesh.visible = false;
  }

  emitSweatDrop() {
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    localVector3.set(this.currentDir.x, this.currentDir.y, this.currentDir.z).applyQuaternion(rotY);
    
    this.sweatDropMesh.position.set(
      this.player.position.x + localVector.x * 0.2 - localVector3.x * 0.065, 
      this.headHeight + localVector.y * 0.2 + localVector3.y * 0.065 + 0.065, 
      this.player.position.z + localVector.z * 0.2 - localVector3.z * 0.065
    );
    this.sweatDropMesh.velocity = -0.0026;

    this.sweatDropMesh.scale.set(0.1, 0.1, 0.1);
  }

  updateSweatDrop(timestamp) {
    if (this.sweatDropMesh.velocity < 0) {
      this.sweatDropMesh.position.y += this.sweatDropMesh.velocity;
      this.sweatDropMesh.velocity += this.sweatDropMesh.acc;
      this.sweatDropMesh.quaternion.copy(this.camera.quaternion);
      if (this.sweatDropMesh.scale.x < 1) {
        this.sweatDropMesh.scale.set(
          this.sweatDropMesh.scale.x + 0.1,
          this.sweatDropMesh.scale.y + 0.1,
          this.sweatDropMesh.scale.z + 0.1
        )
      }
      
    }
    else {
      this.sweatDropMesh.visible = false;
    }
    

  }

  //################################################################ keyboard #################################################################
  initKeyboard() {
    this.keyboardMesh = getKeyboardMesh();
    // this.scene.add(this.keyboardMesh);
    this.keyboardMesh.material.uniforms.keyboardTexture.value = ParticleManager.keyboardTexture;
    this.keyboardMesh.rotation.x = -Math.PI / 1.15;
    this.keyboardMesh.visible = false;
  }

  emitKeyboard(distance) {
    this.keyboardMesh.index = 0;
    this.keyboardMesh.distance = distance;
  }

  updateKeyboard(timestamp) {
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    this.keyboardMesh.position.set(
      this.player.position.x + this.currentDir.x * this.keyboardMesh.distance, 
      this.headHeight + this.currentDir.y * this.keyboardMesh.distance - 0.25, 
      this.player.position.z + this.currentDir.z * this.keyboardMesh.distance
    );

    const index = this.keyboardMesh.index;
    this.keyboardMesh.material.uniforms.textureOffset.value.set(
      (index % 15) * (1. / 15), 
      ((20 - 1) / 20) - Math.floor(index / 15) * (1 / 20)
    );
   
    this.keyboardMesh.index ++;
    
    if (this.keyboardMesh.index >= 300) {
      this.keyboardMesh.visible = false;
    }
  }

  //################################################################ shock #################################################################
  initShock() {
    this.shockMesh = getShockMesh();
    // this.scene.add(this.shockMesh);
    this.shockMesh.material.uniforms.shockTexture.value = ParticleManager.shockTexture;
    this.shockMesh.visible = false;
  }

  emitShock() {
    this.shockMesh.index = 0;
  }

  updateShock(timestamp) {
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    localVector3.set(this.currentDir.x, this.currentDir.y, this.currentDir.z).applyQuaternion(rotY);
    
    this.shockMesh.position.set(
      this.player.position.x + localVector.x * 0.2 + localVector3.x * 0.05, 
      this.headHeight + localVector.y * 0.2 + localVector3.y * 0.05 + 0.07, 
      this.player.position.z + localVector.z * 0.2 + localVector3.z * 0.05
    );
    
    this.shockMesh.quaternion.copy(this.camera.quaternion);

    const index = this.shockMesh.index;
    this.shockMesh.material.uniforms.textureOffset.value.set(
      (index % 5) * (1. / 5), 
      ((3 - 1) / 3) - Math.floor(index / 5) * (1 / 3)
    );
   
    this.shockMesh.index ++;
    
    if (this.shockMesh.index >= 43) {
      this.shockMesh.visible = false;
    }
  }

  //################################################################ tear #################################################################
  initTear() {
    this.tearMesh = getTearMesh();
    // this.scene.add(this.tearMesh);
    this.tearMesh.material.uniforms.tearTexture.value = ParticleManager.tearTexture;
    this.tearMesh.visible = false;
  }

  emitTear() {
    this.emitTearTime = this.timestamp;
    const positionsAttribute = this.tearMesh.geometry.getAttribute('positions');
    const scalesAttribute = this.tearMesh.geometry.getAttribute('scales');
    const textureRotationAttribute = this.tearMesh.geometry.getAttribute('textureRotation');
    
    const particleCount = this.tearMesh.info.particleCount;

    localVector3.set(this.currentDir.x, this.currentDir.y, this.currentDir.z).applyQuaternion(rotY);

    for (let i = 0; i < particleCount; i ++) {
      const isRightSide = i < particleCount / 2 ? 1 : -1;
      const radius = 0.15;
      positionsAttribute.setXYZ(
        i,
        this.player.position.x + localVector3.x * 0.12 * isRightSide + (Math.random() - 0.5) * radius, 
        this.headHeight + (Math.random() - 0.5) * radius,
        this.player.position.z + localVector3.z * 0.12 * isRightSide + (Math.random() - 0.5) * radius, 
      )
      const textureRotation = Math.random() * 2;
      textureRotationAttribute.setX(i, textureRotation);
      
      scalesAttribute.setX(i, Math.random());
      this.tearMesh.info.life[i] = Math.random() * 10;
      this.tearMesh.info.startTime[i] = 0;
    }

    positionsAttribute.needsUpdate = true;
    scalesAttribute.needsUpdate = true;
    textureRotationAttribute.needsUpdate = true;
  }

  updateTear(timestamp) {
    if (timestamp - this.emitTearTime > 800) {
      this.tearMesh.visible = false;
    }
    else {
      const positionsAttribute = this.tearMesh.geometry.getAttribute('positions');
      const scalesAttribute = this.tearMesh.geometry.getAttribute('scales');
      const textureRotationAttribute = this.tearMesh.geometry.getAttribute('textureRotation');
      
      const particleCount = this.tearMesh.info.particleCount;
  
      localVector3.set(this.currentDir.x, this.currentDir.y, this.currentDir.z).applyQuaternion(rotY);
  
      for (let i = 0; i < particleCount; i ++) {
        this.tearMesh.info.startTime[i] ++;
        if (this.tearMesh.info.startTime[i] > this.tearMesh.info.life[i]) {
          const isRightSide = i < particleCount / 2 ? 1 : -1;
          const radius = 0.15;
          positionsAttribute.setXYZ(
            i,
            this.player.position.x + localVector3.x * 0.12 * isRightSide + (Math.random() - 0.5) * radius, 
            this.headHeight + (Math.random() - 0.5) * radius,
            this.player.position.z + localVector3.z * 0.12 * isRightSide + (Math.random() - 0.5) * radius, 
          )
          const textureRotation = Math.random() * 2;
          textureRotationAttribute.setX(i, textureRotation);
          
          scalesAttribute.setX(i, Math.random());
          this.tearMesh.info.life[i] = Math.random() * 10;
          this.tearMesh.info.startTime[i] = 0;
        }
      }
  
      positionsAttribute.needsUpdate = true;
      scalesAttribute.needsUpdate = true;
      textureRotationAttribute.needsUpdate = true;

      this.tearMesh.material.uniforms.cameraBillboardQuaternion.value.copy(this.camera.quaternion);
     
      // this.tearMesh.quaternion.copy(this.camera.quaternion);
    }
    
    
  }

  //################################################################ question #################################################################
  initQuestion() {
    this.questionMesh = getQuestionMesh();
    this.questionMesh.material.uniforms.questionTexture.value = ParticleManager.questionTexture;
    this.questionMesh.material.uniforms.textureInfo.value.set(7, 10, 70);
    this.questionMesh.visible = false;
  }

  emitQuestion() {
    this.questionMesh.index = 0;
  }

  updateQuestion(timestamp) {
    localVector.x = this.camera.position.x - this.player.position.x;
    localVector.y = this.camera.position.y - this.headHeight;
    localVector.z = this.camera.position.z - this.player.position.z;
    localVector.normalize();

    localVector3.set(this.currentDir.x, this.currentDir.y, this.currentDir.z).applyQuaternion(rotY);
    
    this.questionMesh.position.set(
      this.player.position.x + localVector.x * 0.2 + localVector3.x * 0.05, 
      this.headHeight + localVector.y * 0.2 + localVector3.y * 0.05 + 0.07, 
      this.player.position.z + localVector.z * 0.2 + localVector3.z * 0.05
    );
    
    this.questionMesh.quaternion.copy(this.camera.quaternion);

    const index = this.questionMesh.index;
    const width = this.questionMesh.material.uniforms.textureInfo.value.x;
    const height = this.questionMesh.material.uniforms.textureInfo.value.y;
    const frames = this.questionMesh.material.uniforms.textureInfo.value.z;
    this.questionMesh.material.uniforms.textureOffset.value.set(
      (index % width) * (1. / width), 
      ((height - 1) / height) - Math.floor(index / width) * (1 / height)
    );
   
    this.questionMesh.index ++;
    
    if (this.questionMesh.index >= frames) {
      this.questionMesh.visible = false;
    }
  }

  static async waitForLoad() {
    const textureLoader = new THREE.TextureLoader();

    ParticleManager.angryTexture1 = textureLoader.load(`/textures/emote-particle/angry1.png`);
    ParticleManager.angryTexture2 = textureLoader.load(`/textures/emote-particle/angry2.png`);

    ParticleManager.sorrowTexture1 = textureLoader.load(`/textures/emote-particle/sorrow1.png`);
    ParticleManager.sorrowTexture2 = textureLoader.load(`/textures/emote-particle/sorrow2.png`);

    ParticleManager.sparkleTexture = textureLoader.load(`/textures/emote-particle/sparkle.png`);

    ParticleManager.messTexture = textureLoader.load(`/textures/emote-particle/mess.png`);

    ParticleManager.sweatDropTexture = textureLoader.load(`/textures/emote-particle/sweat-drop3.png`);
    
    ParticleManager.keyboardTexture = textureLoader.load(`/textures/emote-particle/keyboard.png`);

    ParticleManager.shockTexture = textureLoader.load(`/textures/emote-particle/shock.png`);

    ParticleManager.tearTexture = textureLoader.load(`/textures/emote-particle/tear3.png`);

    ParticleManager.questionTexture = textureLoader.load(`/textures/emote-particle/question3.png`);
  }
}