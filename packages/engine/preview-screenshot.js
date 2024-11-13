import * as THREE from 'three';
import loaders from './loaders.js';
import Avatar from './avatars/avatars.js';
import {
  blob2img,
} from '../gen/src/utils/convert-utils.js';
import {
  EnvironmentManager,
} from './environment/environment-manager.js';
import {
  emoteAnimations,
} from './avatars/animationHelpers.js';
import {
  Skybox360Mesh,
} from './meshes/skybox360/Skybox360Mesh.js';
import {
  getExt,
  addDefaultLights,
} from './util.js';
import {
  resizeImage,
} from './utils/canvas-utils.js';

//

const screenshotSize = 256;
const heroImageSize = 1024;


// const size = 8192;
// const texSize = 1024;
// const numSlots = size / texSize;
const numFrames = 7;
// const numAngles = 8;
// const worldSize = 2;
// // const distance = 2.2; // render distance
const distance = 1.7; // render distance
const frameTimeDiff = 1000 / 60; // 60 FPS

// const cameraHeightFactor = 0.7; // the height of the camera in avatar space
const cameraHeightFactor = 0.5; // the height of the camera in avatar space
// const spriteScaleFactor = 1.2; // scale up the final sprite by this much in world space
// const spriteFootFactor = 0.07; // offset down this factor in world space

const spriteAnimationSpeed = 0.45;

// opacity factor for sprites
// const alphaTest = 0.9;

// const planeSpriteMeshes = [];
// const spriteAvatarMeshes = [];

//

const makeRenderContext = () => {
  const canvas = document.createElement('canvas');
  canvas.width = screenshotSize;
  canvas.height = screenshotSize;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
  });

  const scene = new THREE.Scene();
  // scene.background = new THREE.Color(0xEEEEEE);
  scene.autoUpdate = false;

  const fov = 75;
  const near = 0.1;
  const far = 1000;
  const camera = new THREE.PerspectiveCamera(fov, canvas.width / canvas.height, near, far);

  return {
    renderer,
    scene,
    camera,
  };
}
const screenhotRenderers = {
  vrm: async (f) => {
    const {
      renderer,
      scene,
      camera,
    } = makeRenderContext();

    const srcUrl = URL.createObjectURL(f);
    const res = await fetch(srcUrl);
    const arrayBuffer = await res.arrayBuffer();
    URL.revokeObjectURL(srcUrl);

    const {
      gltfLoader,
    } = loaders;

    const gltf = await new Promise((accept, reject) => {
      gltfLoader.parse(arrayBuffer, srcUrl, accept, reject);
    });
  
    const headBone = gltf.userData.vrm.humanoid.humanBones.head.node;
    const position = new THREE.Vector3().setFromMatrixPosition(headBone.matrixWorld);
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(headBone.matrixWorld);
  
    camera.position.copy(position)
      .add(
        new THREE.Vector3(0, 0, -0.4)
          .applyQuaternion(quaternion)
      );
    camera.lookAt(position);
    camera.updateMatrixWorld();
  
    addDefaultLights(scene);
    scene.add(gltf.scene);
    scene.updateMatrixWorld();
  
    //
  
    renderer.render(scene, camera);

    //

    const blob = await new Promise((accept, reject) => {
      renderer.domElement.toBlob(accept, 'image/png');
    });
    return blob;
  },
  glb: async (f) => {
    const {
      renderer,
      scene,
      camera,
    } = makeRenderContext();

    const srcUrl = URL.createObjectURL(f);
    const res = await fetch(srcUrl);
    const arrayBuffer = await res.arrayBuffer();
    URL.revokeObjectURL(srcUrl);

    const {
      gltfLoader,
    } = loaders;

    const gltf = await new Promise((accept, reject) => {
      gltfLoader.parse(arrayBuffer, srcUrl, accept, reject);
    });

    // Get bounding box
    scene.add(gltf.scene);
    gltf.scene.updateMatrixWorld();
    const bbox = new THREE.Box3().setFromObject(gltf.scene);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    // console.log('got bbox', bbox, gltf.scene);
    
    // Get dimensions
    const size = new THREE.Vector3();
    bbox.getSize(size);
    
    // Calculate distance
    const sides = ['x', 'y', 'z'];
    const sortedSides = sides.slice().map(side => {
      return {
        side,
        size: size[side],
      };
    }).sort((a, b) => {
      return b.size - a.size;
    }).map(side => side.side);
    const sortedSides2 = sortedSides.slice(0, 2);

    const largestSide = sortedSides[0];
    const largestSideValue = size[largestSide];
    if (
      sortedSides2.includes('x') && sortedSides2.includes('y')
    ) {
      camera.position.set(center.x, center.y, center.z + 1);
      camera.lookAt(center);
    }
    if (
      sortedSides2.includes('x') && sortedSides2.includes('z')
    ) {
      camera.position.set(center.x, center.y + 1, center.z);
      camera.lookAt(center);
    }
    if (
      sortedSides2.includes('y') && sortedSides2.includes('z')
    ) {
      camera.position.set(center.x + 1, center.y, center.z);
      camera.lookAt(center);
    }

    // move the camera back to see the whole bounding box
    // Calculate distance
    const fov = camera.fov; // in degrees

    // Use similar triangles to find the distance the camera needs to be
    let distance = (0.5 * largestSideValue) / Math.tan((fov / 2) * (Math.PI / 180));
    distance *= 1.1;

    // Calculate the new camera position
    const newPosition = new THREE.Vector3();
    newPosition.copy(center); // start at the center of the bounding box
    newPosition.addScaledVector(camera.position.clone().sub(center).normalize(), distance); // move back along the line between the center and the camera

    // Update camera position
    camera.position.copy(newPosition);

    // set up the scene
    addDefaultLights(scene);
    camera.updateMatrixWorld();
    // camera.updateProjectionMatrix();
    scene.updateMatrixWorld();
  
    //
  
    renderer.render(scene, camera);

    //

    const canvas = renderer.domElement;
    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, 'image/png');
    });
    return blob;
  },
  item360: async (f) => {
    const u = URL.createObjectURL(f);
    const res = await fetch(u);
    const j = await res.json();
    URL.revokeObjectURL(u);
    const {
      imageUrl,
    } = j;

    const imageBlob = await (async () => {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      return blob;
    })();

    const previewImgBlob = await resizeImage(imageBlob, screenshotSize, screenshotSize, '#00000000');
    return previewImgBlob;
  },
  character360: async (f) => {
    console.log('render character360 1', {
      f,
    });
    const u = URL.createObjectURL(f);
    const res = await fetch(u);
    const j = await res.json();
    URL.revokeObjectURL(u);
    const {
      characterImageUrl,
    } = j;

    console.log('render character360 2', {
      j,
      characterImageUrl,
    });

    const res2 = await fetch(characterImageUrl);
    const blob = await res2.blob();
    // get the top 1/3 face (square of size 1/3 x 1/3 at the top of the image)
    const blob2 = await (async () => {
      const img = await createImageBitmap(blob);
      const canvas = document.createElement('canvas');
      canvas.width = img.width / 3;
      canvas.height = img.height / 3;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        canvas.width, 0, canvas.width, canvas.height,
        0, 0, canvas.width, canvas.height,
      );
      const blob2 = await new Promise((accept, reject) => {
        canvas.toBlob(accept, 'image/png');
      });
      return blob2;
    })();
    const u2 = URL.createObjectURL(blob2);
    console.log('render character360 3', {
      u2,
    });
    return blob2;
  },
  skybox3d: async (f) => {
    const imageBitmap = await (async () => {
      const srcUrl = URL.createObjectURL(f);
      const res = await fetch(srcUrl);
      const json = await res.json();
      URL.revokeObjectURL(srcUrl);

      const {
        fileUrl,
      } = json;

      const res2 = await fetch(fileUrl);
      const blob2 = await res2.blob();
      const imageBitmap = await createImageBitmap(blob2, {
        imageOrientation: 'flipY',
      });
      return imageBitmap;
    })();

    //

    const {
      renderer,
      scene,
      camera,
    } = makeRenderContext();

    //

    const mesh = new Skybox360Mesh();
    mesh.setGeometry();
    mesh.material.uniforms.map.value.image = imageBitmap;
    mesh.material.uniforms.map.value.needsUpdate = true;
    scene.add(mesh);
    mesh.updateMatrixWorld();

    //
  
    renderer.render(scene, camera);
    
    //

    const canvas = renderer.domElement;
    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, 'image/png');
    });
    return blob;
  },
  image: async (f) => {
    const imageBitmap = await createImageBitmap(f);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = screenshotSize;
    canvas.height = screenshotSize;

    // contain the image, without clipping. this may add whitespace at the top/bottom or left/right
    const scale = Math.min(
      canvas.width / imageBitmap.width,
      canvas.height / imageBitmap.height,
    );
    const scaledWidth = imageBitmap.width * scale;
    const scaledHeight = imageBitmap.height * scale;
    const scaledX = (canvas.width - scaledWidth) / 2;
    const scaledY = (canvas.height - scaledHeight) / 2;
    ctx.drawImage(imageBitmap, scaledX, scaledY, scaledWidth, scaledHeight);

    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, 'image/png');
    });
    return blob;
  },
  audio: async (renderer, scene, camera, f) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = screenshotSize;
    canvas.height = screenshotSize;

    const img = new Image();
    img.src = '/images/audio-inv.svg';
    img.crossOrigin = 'Anonymous';
    await new Promise((accept, reject) => {
      img.addEventListener('load', accept);
      img.addEventListener('error', reject);
    });

    const scale = Math.min(
      canvas.width / img.width,
      canvas.height / img.height,
    );
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const scaledX = (canvas.width - scaledWidth) / 2;
    const scaledY = (canvas.height - scaledHeight) / 2;
    ctx.drawImage(img, scaledX, scaledY, scaledWidth, scaledHeight);

    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, 'image/png');
    });
    return blob;
  },
  video: async (f) => {
    // read the first frame
    const video = document.createElement('video');
    video.src = URL.createObjectURL(f);
    video.crossOrigin = 'Anonymous';
    video.muted = true;
    // video.loop = true;
    // wait for first frame
    await new Promise((accept, reject) => {
      video.addEventListener('canplay', accept);
      video.addEventListener('error', reject);
    });
    video.play();

    // wait for first frame
    await new Promise((accept, reject) => {
      video.requestVideoFrameCallback(accept);
      video.addEventListener('error', reject);
    });
    video.pause();

    const canvas = document.createElement('canvas');
    canvas.width = screenshotSize;
    canvas.height = screenshotSize;
    const ctx = canvas.getContext('2d');

    const scale = Math.min(
      canvas.width / video.videoWidth,
      canvas.height / video.videoHeight,
    );
    const scaledWidth = video.videoWidth * scale;
    const scaledHeight = video.videoHeight * scale;
    const scaledX = (canvas.width - scaledWidth) / 2;
    const scaledY = (canvas.height - scaledHeight) / 2;
    ctx.drawImage(video, scaledX, scaledY, scaledWidth, scaledHeight);

    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, 'image/png');
    });
    return blob;
  },
};
export const hasScreenshotRenderer = (ext) => !!screenhotRenderers[ext];
export const getScreenshotBlob = async (f, ext) => {
  const screenshotRendererFn = screenhotRenderers[ext];
  if (screenshotRendererFn) {
    return await screenshotRendererFn(f);
  } else {
    throw new Error('unknown screenshot renderer: ' + ext);
  }
};
globalThis.getScreenshotBlob = getScreenshotBlob;
globalThis.testScreenshotBlob = async () => {
  const u = `https://friddlbqibjnxjoxeocc.supabase.co/storage/v1/object/public/public/skybox3D/66485b38-7843-4d1e-a0f9-44e448d7eac3/skybox.skybox3d`;
  const res = await fetch(u);
  const blob = await res.blob();

  const previewImgBlob = await getScreenshotBlob(blob, 'skybox3d');
  const img = new Image();
  img.src = URL.createObjectURL(previewImgBlob);
  img.crossOrigin = 'Anonymous';
  img.style.cssText = `\
    position: absolute;
    top: 0;
    left: 0;
    width: 256px;
    height: 256px;
    object-fit: contain;
    z-index: 100;
  `;
  document.body.appendChild(img);
};

//

let _spriteSpecs = null;
const getSpriteSpecs = () => {
  if (_spriteSpecs === null) {
    const animations = Avatar.getAnimations();
    const walkAnimation = animations.find((a) => a.name === 'walking.fbx');
    const walkBackwardAnimation = animations.find((a) => a.name === 'walking backwards.fbx');
    const runAnimation = animations.find((a) => a.name === 'Fast Run.fbx');
    const runBackwardAnimation = animations.find((a) => a.name === 'running backwards.fbx');
    const leftStrafeRunAnimation = animations.find((a) => a.name === 'left strafe.fbx');
    const rightStrafeRunAnimation = animations.find((a) => a.name === 'right strafe.fbx');
    const idleAnimation = animations.find((a) => a.name === 'idle.fbx');
    const crouchIdleAnimation = animations.find((a) => a.name === 'Crouch Idle.fbx');
    const crouchWalkAnimation = animations.find((a) => a.name === 'Sneaking Forward.fbx');
    const crouchWalkBackwardAnimation = animations.find(
      (a) => a.name === 'Sneaking Forward reverse.fbx'
    );
    const narutoRunAnimation = animations.find((a) => a.name === 'naruto run.fbx');
    const jumpAnimation = animations.find((a) => a.name === 'jump.fbx');
    const leftStrafeWalkingAnimation = animations.find((a) => a.name === 'left strafe walking.fbx');
    const rightStrafeWalkingAnimation = animations.find(
      (a) => a.name === 'right strafe walking.fbx'
    );
    const crouchWalkLeftAnimation = animations.find((a) => a.name === 'Crouched Sneaking Left.fbx');
    const crouchWalkRightAnimation = animations.find(
      (a) => a.name === 'Crouched Sneaking Right.fbx'
    );

    _spriteSpecs = [
      {
        name: 'idle',
        duration: idleAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity.set(0, 0, 0).divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'walk',
        duration: walkAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (-walkSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              // console.log('update walk position offset', positionOffset, camera2.position.toArray().join(','));

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(0, 0, moveDistancePerFrame)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);

              // globalThis.localRig = localRig;
            },
          };
        },
      },
      {
        name: 'walk left',
        duration: leftStrafeWalkingAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (-walkSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(positionOffset, localRig.height * cameraHeightFactor, 0)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(positionOffset, localRig.height * cameraHeightFactor, 0)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(positionOffset, localRig.height, 0);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(moveDistancePerFrame, 0, 0)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'walk right',
        duration: rightStrafeWalkingAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (walkSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(positionOffset, localRig.height * cameraHeightFactor, 0)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(positionOffset, localRig.height * cameraHeightFactor, 0)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(positionOffset, localRig.height, 0);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(moveDistancePerFrame, 0, 0)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'walk backward',
        duration: walkBackwardAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (walkSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(0, 0, moveDistancePerFrame)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'run',
        duration: runAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (-runSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(0, 0, moveDistancePerFrame)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'run left',
        duration: leftStrafeRunAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (-runSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(positionOffset, localRig.height * cameraHeightFactor, 0)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(positionOffset, localRig.height * cameraHeightFactor, 0)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(positionOffset, localRig.height, 0);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(moveDistancePerFrame, 0, 0)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'run right',
        duration: rightStrafeRunAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (runSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(positionOffset, localRig.height * cameraHeightFactor, 0)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(positionOffset, localRig.height * cameraHeightFactor, 0)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(positionOffset, localRig.height, 0);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(moveDistancePerFrame, 0, 0)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'run backward',
        duration: runBackwardAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (runSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(0, 0, moveDistancePerFrame)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.update(timestamp, timeDiffMs);
            },
          };
        },
      },
      {
        name: 'crouch idle',
        duration: crouchIdleAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              // positionOffset -= crouchSpeed/1000 * timeDiffMs;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity.set(0, 0, 0).divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.crouchTime = 0;

              localRig.update(timestamp, timeDiffMs);
            },
            cleanup() {
              localRig.crouchTime = crouchMaxTime;
            },
          };
        },
      },
      {
        name: 'crouch walk',
        duration: crouchWalkAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (-crouchSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(0, 0, moveDistancePerFrame)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.crouchTime = 0;

              localRig.update(timestamp, timeDiffMs);
            },
            cleanup() {
              localRig.crouchTime = crouchMaxTime;
            },
          };
        },
      },
      {
        name: 'crouch walk left',
        duration: crouchWalkLeftAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (-crouchSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(positionOffset, localRig.height * cameraHeightFactor, 0)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(positionOffset, localRig.height * cameraHeightFactor, 0)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(positionOffset, localRig.height, 0);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(moveDistancePerFrame, 0, 0)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.crouchTime = 0;

              localRig.update(timestamp, timeDiffMs);
            },
            cleanup() {
              localRig.crouchTime = crouchMaxTime;
            },
          };
        },
      },
      {
        name: 'crouch walk right',
        duration: crouchWalkRightAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (crouchSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(positionOffset, localRig.height * cameraHeightFactor, 0)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(positionOffset, localRig.height * cameraHeightFactor, 0)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(positionOffset, localRig.height, 0);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(moveDistancePerFrame, 0, 0)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.crouchTime = 0;

              localRig.update(timestamp, timeDiffMs);
            },
            cleanup() {
              localRig.crouchTime = crouchMaxTime;
            },
          };
        },
      },
      {
        name: 'crouch walk backward',
        duration: crouchWalkBackwardAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (crouchSpeed / 1000) * timeDiffMs;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(0, 0, moveDistancePerFrame)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.crouchTime = 0;

              localRig.update(timestamp, timeDiffMs);
            },
            cleanup() {
              localRig.crouchTime = crouchMaxTime;
            },
          };
        },
      },
      {
        name: 'naruto run',
        duration: narutoRunAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          let narutoRunTime = 0;
          // const narutoRunIncrementSpeed = 1000 * 4;

          return {
            update(timestamp, timeDiffMs) {
              const moveDistancePerFrame = (-narutoRunSpeed / 1000) * timeDiffMs * 10;
              positionOffset += moveDistancePerFrame;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity
                .set(0, 0, moveDistancePerFrame)
                .divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.narutoRunState = true;
              localRig.narutoRunTime = narutoRunTime;

              narutoRunTime += timeDiffMs;

              localRig.update(timestamp, timeDiffMs);
            },
            reset() {
              narutoRunTime = 0;
            },
            cleanup() {
              localRig.narutoRunState = false;
            },
          };
        },
      },
      {
        name: 'jump',
        duration: jumpAnimation.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;

          let jumpTime = 0;
          // const jumpIncrementSpeed = 400;

          return {
            update(timestamp, timeDiffMs) {
              // const timeDiffMs = timeDiff/1000;
              // positionOffset -= walkSpeed/1000 * timeDiffMs;

              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();

              localRig.inputs.hmd.position.set(0, localRig.height, positionOffset);
              localRig.inputs.hmd.updateMatrixWorld();

              localRig.velocity.set(0, 0, 0).divideScalar(Math.max(timeDiffMs / 1000, 0.001));

              localRig.jumpState = true;
              localRig.jumpTime = jumpTime;

              jumpTime += timeDiffMs;

              // console.log('got jump time', jumpTime, timeDiffMs, jumpIncrementSpeed);

              // console.log('local rig update', timeDiffMs);
              localRig.update(timestamp, timeDiffMs);
            },
            reset() {
              jumpTime = 0;
            },
            cleanup() {
              localRig.jumpState = false;
            },
          };
        },
      },
      {
        name: 'angry',
        duration: emoteAnimations.angry.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'angry',
            value: 1,
          });
          localRig.emoteAnimation = 'angry';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
      {
        name: 'alert',
        duration: emoteAnimations.alert.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'surprise',
            value: 1,
          });
          localRig.emoteAnimation = 'alert';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
      {
        name: 'victory',
        duration: emoteAnimations.victory.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'joy',
            value: 1,
          });
          localRig.emoteAnimation = 'victory';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
      {
        name: 'surprise',
        duration: emoteAnimations.surprise.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'surprise',
            value: 1,
          });
          localRig.emoteAnimation = 'surprise';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
      {
        name: 'sad',
        duration: emoteAnimations.sad.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'sorrow',
            value: 1,
          });
          localRig.emoteAnimation = 'sad';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
      {
        name: 'headShake',
        duration: emoteAnimations.headShake.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'sorrow',
            value: 1,
          });
          localRig.emoteAnimation = 'headShake';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
      {
        name: 'headNod',
        duration: emoteAnimations.headNod.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'fun',
            value: 1,
          });
          localRig.emoteAnimation = 'headNod';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
      {
        name: 'embarrassed',
        duration: emoteAnimations.embarrassed.duration,
        init({angle, avatar: localRig, camera2}) {
          let positionOffset = 0;
          localRig.faceposes.length = 0;
          localRig.faceposes.push({
            emotion: 'sorrow',
            value: 1,
          });
          localRig.emoteAnimation = 'embarrassed';
          localRig.emoteFactor = crouchMaxTime;
          localRig.update(0, 0);
          let _timestamp = 0;
          return {
            update(timestamp, timeDiffMs) {
              const euler = new THREE.Euler(0, angle, 0, 'YXZ');
              camera2.position
                .set(0, localRig.height * cameraHeightFactor, positionOffset)
                .add(new THREE.Vector3(0, 0, -distance).applyEuler(euler));
              camera2.lookAt(
                new THREE.Vector3(0, localRig.height * cameraHeightFactor, positionOffset)
              );
              camera2.updateMatrixWorld();
              localRig.update(_timestamp, timeDiffMs);
              _timestamp += timeDiffMs * spriteAnimationSpeed;
            },
          };
        },
      },
    ];
  }
  return _spriteSpecs;
};
export const heroImageNpcRenderers = {
  vrm: async (srcUrl, opts) => {
    const res2 = await fetch(srcUrl);
    const arrayBuffer = await res2.arrayBuffer();

    //

    const {gltfLoader} = loaders;
    const vrm = await new Promise((accept, reject) => {
      gltfLoader.parse(arrayBuffer, srcUrl, accept, reject);
    });
    // const avatarQuality = AvatarManager.makeQuality(gltf);

    const environmentManager = new EnvironmentManager();
    const localRig = new Avatar(vrm, {
      fingers: true,
      hair: true,
      visemes: true,
      debug: false,
      environmentManager,
    });

    for (let h = 0; h < 2; h++) {
      localRig.setHandEnabled(h, false);
    }
    localRig.setTopEnabled(false);
    localRig.setBottomEnabled(false);

    // if (preview) {
    //   _ensureScheduleGlobalUpdate();
    // }

    const canvas = document.createElement('canvas');
    canvas.width = heroImageSize;
    canvas.height = heroImageSize;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.autoClear = false;
    renderer.sortObjects = false;
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.premultipliedAlpha = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //

    const scene2 = new THREE.Scene();
    scene2.autoUpdate = false;
    addDefaultLights(scene2);
    scene2.add(vrm.scene);

    //

    const camera2 = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);

    //

    const _renderSpriteFrame = () => {
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene2, camera2);
    };

    const spriteSpecs = getSpriteSpecs();
    // const spriteImages = [];
    /* for (let i = 0; i < spriteSpecs.length; i++) */ {
      const i = 0;
      const spriteSpec = spriteSpecs[i];
      const {name, duration} = spriteSpec;

      // let angleIndex = 0;
      /* for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / numAngles) */ {
        const angle = 0;
        const durationS = duration * 1000;
        const _getCurrentFrame = (timestamp) => {
          const result = Math.min(Math.floor((timestamp / durationS) * numFrames), numFrames);
          // console.log('current frame', name, timestamp, result, numFrames);
          return result;
        };

        // initialize sprite generator animation
        const spriteGenerator = spriteSpec.init({
          angle,
          avatar: localRig,
          camera2,
        });

        // pre-run the animation one cycle first, to stabilize the hair physics
        let now = 0;
        // const startAngleIndex = angleIndex;
        {
          const startNow = now;
          for (let j = 0; j < numFrames; j++) {
            while (_getCurrentFrame(now - startNow) < j) {
              spriteGenerator.update(now, frameTimeDiff);
              now += frameTimeDiff;
            }
          }
        }
        // const initialPositionOffset = localRig.inputs.hmd.position.z;

        spriteGenerator.reset && spriteGenerator.reset();

        // now perform the real capture
        const startNow = now;
        /* for (let j = 0; j < numFrames; j++, angleIndex++) */ {
          const j = 0;
          while (_getCurrentFrame(now - startNow) < j) {
            spriteGenerator.update(now, frameTimeDiff);
            now += frameTimeDiff;
          }

          scene2.updateMatrixWorld();

          _renderSpriteFrame();

          /* console.log('camera position', {
            position: camera2.position.toArray(),
            quaternion: camera2.quaternion.toArray(),
            scale: camera2.scale.toArray(),
          }); */

          // ctx2.drawImage(renderer.domElement, 0, 0);

          /* const [x, y] = getFrameOffsetCoords(angleIndex);
          ctx2.drawImage(
            renderer.domElement,
            0,
            renderer.domElement.height - texSize,
            texSize,
            texSize,
            x,
            y,
            texSize,
            texSize
          ); */
        }

        spriteGenerator.cleanup && spriteGenerator.cleanup();
      }

      // spriteImages.push(canvas);
    }

    scene2.remove(vrm.scene);

    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, opts?.type, opts?.quality);
    });
    return blob;
  },
  character360: async (srcUrl, opts) => {
    console.log('render character360 1', {
      srcUrl,
    });
    const res = await fetch(srcUrl);
    const j = await res.json();
    const {
      characterImageUrl,
    } = j;

    console.log('render character360 1', {
      srcUrl,
      characterImageUrl,
    });

    const res2 = await fetch(characterImageUrl);
    const blob = await res2.blob();
    const blob2 = await resizeImage(
      blob,
      heroImageSize,
      heroImageSize,
      '#00000000',
      opts?.type,
      opts?.quality,
    );
    const u2 = URL.createObjectURL(blob2);
    console.log('render character360 2', {
      srcUrl,
      characterImageUrl,
      blob2,
      u2,
    });
    return blob2;
  },
  image: async (srcUrl, opts) => {
    console.log('render image 1', {
      srcUrl,
    });
    const res = await fetch(srcUrl);
    const blob = await res.blob();
    const blob2 = await resizeImage(
      blob,
      heroImageSize,
      heroImageSize,
      '#00000000',
      opts?.type,
      opts?.quality,
    );
    const u2 = URL.createObjectURL(blob2);
    console.log('render image 2', {
      srcUrl,
      blob2,
    });
    return blob2;
  },
  png() {
    return this.image.apply(this, arguments);
  },
  gif() {
    return this.image.apply(this, arguments);
  },
  jpg() {
    return this.image.apply(this, arguments);
  },
  jpeg() {
    return this.image.apply(this, arguments);
  },
};
const heroImageRenderers = {
  npc: async (f, opts) => {
    const s = await f.text();
    const j = JSON.parse(s);
    const {
      avatarUrl: srcUrl,
    } = j;
    const ext = getExt(srcUrl);

    const heroImageNpcRendererFn = heroImageNpcRenderers[ext];
    if (heroImageNpcRendererFn) {
      return await heroImageNpcRendererFn.call(heroImageNpcRenderers, srcUrl, opts);
    } else {
      throw new Error('unknown hero image renderer: ' + ext);
    }
  },
};
export const hasHeroImageRenderer = (ext) => !!heroImageRenderers[ext];
export const getHeroImageBlob = async (f, ext, opts) => {
  const heroImageRendererFn = heroImageRenderers[ext];
  if (heroImageRendererFn) {
    return await heroImageRendererFn(f, opts);
  } else {
    throw new Error('unknown hero image renderer: ' + ext);
  }
};