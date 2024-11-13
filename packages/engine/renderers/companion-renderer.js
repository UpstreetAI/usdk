import * as THREE from 'three';
import {
  minFov,
} from '../../../packages/engine/constants.js';
import { defaultCameraUvw } from '../constants/companion-constants.js';

import CompanionEmoteManager from '../managers/companion-emote/companion-emote-manager.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
// const localVector4D = new THREE.Vector4();
const localEuler = new THREE.Euler();

const zeroVector = new THREE.Vector3(0, 0, 0);

//

const getCameraOffsetFromUvw = (cameraUvw, target) => {
  return target.set(0, 0, 1)
    .applyEuler(
      localEuler.set(
        cameraUvw[1] * Math.PI / 2 * 0.99,
        cameraUvw[0] * Math.PI / 2 * 0.99,
        0,
        'YXZ'
      )
    )
    .multiplyScalar(0.2 + ((1 - cameraUvw[2]) ** 2) * 30);
}
const _addSceneLights = scene => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight.position.set(-1, 1.2, 1.5);
  directionalLight.updateMatrixWorld();
  scene.add(directionalLight);
};

//

const _setCameraToNpcPlayer = ({
  camera,
  npcPlayer,
  cameraOffset,
  cameraFov,
  cameraTargetOffset,
}) => {
  const {
    avatar,
  } = npcPlayer;
  const head = avatar.modelBones.Head;

  camera.position.set(0, avatar.height, 0)
    .add(cameraOffset);
  head.matrixWorld.decompose(localVector, localQuaternion, localVector2);
  const lookPosition = localVector.add(cameraTargetOffset);
  camera.lookAt(lookPosition);
  camera.updateMatrixWorld();

  if (camera.fov !== cameraFov) {
    camera.fov = cameraFov;
    camera.updateProjectionMatrix();
  }
};

//

export class CompanionRenderSpec {
  constructor({
    npcPlayer,
    companionRenderer,
    canvasContext,
    cameraUvw = defaultCameraUvw,
    cameraFov = minFov,
  }) {
    this.npcPlayer = npcPlayer;
    this.canvasContext = canvasContext;
    this.cameraUvw = cameraUvw.slice();
    this.cameraFov = cameraFov;
    this.scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.y = 1;
    camera.updateMatrixWorld();
    camera.aspect = companionRenderer.width / companionRenderer.height;
    camera.updateProjectionMatrix();
    this.camera = camera;
    _addSceneLights(this.scene);
    this.emoteManager = new CompanionEmoteManager(this.camera, companionRenderer.renderer, this.scene, this.npcPlayer);

    const {canvas} = canvasContext;
    const needSetPixelRatio = canvas.originalWidth === undefined || canvas.originalHeight === undefined;
    if (canvas.originalWidth === undefined) {
      canvas.originalWidth = canvas.width;
    }
    if (canvas.originalHeight === undefined) {
      canvas.originalHeight = canvas.height;
    }
    if (needSetPixelRatio) {
			canvas.width = Math.floor(canvas.originalWidth * window.devicePixelRatio);
			canvas.height = Math.floor(canvas.originalHeight * window.devicePixelRatio);
    }
  }
  
  setCameraUvw(cameraUvw) {
    this.cameraUvw = cameraUvw.slice();
  }

  setCameraFov(cameraFov) {
    this.cameraFov = cameraFov;
  }
}

export class CompanionRenderer {
  constructor({
    width,
    height,
  }) {

    this.companionRenderSpecs = [];
    this.width = width;
    this.height = height;

    // const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    // camera.position.y = 1;
    // camera.updateMatrixWorld();
    // camera.aspect = width / height;
    // camera.updateProjectionMatrix();
    // this.camera = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      // canvas: canvasEl,
      // width: canvasEl.width,
      // height: canvasEl.height,
      desynchronized: true,
      powerPreference: 'low-power',
    });
    renderer.autoClear = false;
    renderer.sortObjects = false;
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer = renderer;

    this.npcPlayer = null;
    this.lastRenderTimestamp = performance.now();

    this.start();
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;

    this.renderer.setSize(width, height, false);

    for (const companionRenderSpec of this.companionRenderSpecs) {
      const {canvasContext, camera} = companionRenderSpec;
      const {canvas} = canvasContext;

      canvas.width = Math.floor(width * window.devicePixelRatio);
      canvas.height = Math.floor(height * window.devicePixelRatio);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  // sets the npc player for this renderer
  addCompanionRenderSpec(companionRenderSpec) {
    this.companionRenderSpecs.push(companionRenderSpec);
  }

  removeCompanionRenderSpec(companionRenderSpec) {
    this.companionRenderSpecs.splice(this.companionRenderSpecs.indexOf(companionRenderSpec), 1);
  }

  start() {
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  stop() {
    this.renderer.setAnimationLoop(null);
  }

  render() {
    const now = performance.now();
    const timeDiff = now - this.lastRenderTimestamp;
    this.lastRenderTimestamp = now;

    for (const companionRenderSpec of this.companionRenderSpecs) {
      const {
        renderer,
      } = this;

      const {
        npcPlayer,
        canvasContext,
        cameraUvw,
        cameraFov,
        emoteManager,
        scene,
        camera,
      } = companionRenderSpec;

      const oldParent = npcPlayer.avatar.avatarQuality.scene.parent;
      scene.add(npcPlayer.avatar.avatarQuality.scene);

      emoteManager.update(now, timeDiff);
      
      const cameraOffset = getCameraOffsetFromUvw(
        cameraUvw,
        localVector,
      );
      const cameraTargetOffset = zeroVector;
      _setCameraToNpcPlayer({
        camera,
        npcPlayer,
        cameraOffset,
        cameraFov,
        cameraTargetOffset,
      });

      npcPlayer.updateAvatar(now, timeDiff, null, null);

      renderer.clear();
      renderer.render(scene, camera);
      canvasContext.clearRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
      canvasContext.drawImage(renderer.domElement, 0, 0, canvasContext.canvas.width, canvasContext.canvas.height);

      if (oldParent) {
        oldParent.add(npcPlayer.avatar.avatarQuality.scene);
      } else {
        scene.remove(npcPlayer.avatar.avatarQuality.scene);
      }
    }
  }

  destroy() {
    this.renderer.dispose();
  }
}