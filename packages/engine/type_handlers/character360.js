import * as THREE from 'three';
import {
  Frame360Mesh,
} from '../meshes/frame360/Frame360Mesh.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

//

const planeHeight = 2.3;
const heightOffset = planeHeight * (0.5 - 0.13);

//

export default srcUrl => ctx => {
  const {
    useApp,
  } = ctx;

  const app = useApp();

  app.appType = 'character360';

  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    const json = await res.json();

    let {
      // id,
      // characterImageUrl,
      character360ImageUrl,
      characterEmotionUrl,
    } = json;

    let baseUrl = srcUrl;
    if (/^\//.test(baseUrl)) {
      baseUrl = new URL(baseUrl, location.href).href;
    }
    character360ImageUrl = new URL(character360ImageUrl, baseUrl).href;
    characterEmotionUrl = characterEmotionUrl && new URL(characterEmotionUrl, baseUrl).href;

    const mesh = new Frame360Mesh();
    mesh.position.y = heightOffset;
    mesh.scale.setScalar(planeHeight);
    app.setVolume = v => mesh.setVolume(v);
    app.setEmotion = e => mesh.setEmotion(e);

    const headBone = new THREE.Object3D();
    headBone.position.y = heightOffset;
    app.add(headBone);
    headBone.updateMatrixWorld();
    app.headBone = headBone;

    await mesh.load({
      frame360ImageUrl: character360ImageUrl,
      frameAnimationImageUrl: characterEmotionUrl,
    });

    app.add(mesh);
    mesh.updateMatrixWorld();

    // physics
    {
      const height = 1.6;
      const width = 0.6;

      const widthPadding = 0; // Padding around the avatar since the base width is computed from shoulder distance

      const capsuleRadius = (width / 2) + widthPadding;

      const halfAvatarCapsuleHeight = (height + width) / 2; // (full world height of the capsule) / 2

      localMatrix.compose(
        localVector.set(0, heightOffset, 0), // start position
        localQuaternion.setFromAxisAngle(localVector2.set(0, 0, 1), Math.PI / 2), // rotate 90 degrees
        localVector2.set(capsuleRadius, halfAvatarCapsuleHeight, capsuleRadius)
      )
        .premultiply(app.matrixWorld)
        .decompose(localVector, localQuaternion, localVector2);
    }
  })());

  return app;
};
