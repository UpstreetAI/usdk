import * as THREE from 'three';
import {
  makeDefaultPerspectiveCamera,
} from '../../renderer-utils.js';

//

const upVector = new THREE.Vector3(0, 1, 0);

//

export class PictureInPictureManager {
  constructor({
    engineRenderer,
    tempManager,
  }) {
    if (!engineRenderer || !tempManager) {
      throw new Error('missing args', {
        engineRenderer,
        tempManager,
      });
    }

    this.engineRenderer = engineRenderer;
    this.tempManager = tempManager;

    this.targets = [];

    this.camera = makeDefaultPerspectiveCamera();
  }
  addCanvas(target) {
    this.targets.push(target);
  }
  removeCanvas(target) {
    const index = this.targets.indexOf(target);
    if (index !== -1) {
      this.targets.splice(index, 1);
    } else {
      console.warn('target not found', target, new Error().stack);
    }
  }
  render() {
    for (const target of this.targets) {
      const {
        canvas,
        targetPlayer,
      } = target;

      const {
        renderer,
        rootScene,
      } = this.engineRenderer;
      const {
        camera,
      } = this;

      const headBone = targetPlayer.avatar?.modelBones?.Head;

      if (headBone) {
        const headBonePosition = this.tempManager.get(THREE.Vector3);
        const headBoneQuaternion = this.tempManager.get(THREE.Quaternion);
        const headBoneScale = this.tempManager.get(THREE.Vector3);
        headBone.matrixWorld.decompose(
          headBonePosition,
          headBoneQuaternion,
          headBoneScale
        );

        //

        camera.position.copy(headBonePosition)
          .add(
            this.tempManager.get(THREE.Vector3)
              .set(0, 0, -0.5)
              .applyQuaternion(targetPlayer.quaternion)
          );
        camera.lookAt(headBonePosition);
        camera.rotation.x = 0;
        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();

        const oldViewport = renderer.getViewport(
          this.tempManager.get(THREE.Vector4)
        );
        const oldRenderTarget = renderer.getRenderTarget();
        const pixelRatio = renderer.getPixelRatio();

        const dy = (renderer.domElement.height - canvas.height) / pixelRatio;
        renderer.setViewport(
          0,
          dy,
          canvas.width / pixelRatio,
          canvas.height / pixelRatio,
        );
        renderer.setRenderTarget(null);
        renderer.clear();
        renderer.render(rootScene, camera);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
          renderer.domElement,
          0, 0,
          canvas.width, canvas.height,
          0, 0,
          canvas.width, canvas.height
        );

        renderer.setViewport(oldViewport);
        renderer.setRenderTarget(oldRenderTarget);
      }
    }
  }
}
