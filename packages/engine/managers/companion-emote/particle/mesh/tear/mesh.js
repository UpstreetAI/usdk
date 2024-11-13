import * as THREE from 'three';

import { tearMarkVertexShader, tearMarkFragmentShader } from "../../material/tear/shader.js";
import { _getGeometry } from '../utils.js';

export const getTearMesh = () => {
  const particleCount = 10;
  const attributeSpecs = [];
  attributeSpecs.push({name: 'textureRotation', itemSize: 1});
  attributeSpecs.push({name: 'scales', itemSize: 1});
  const geometry2 = new THREE.PlaneGeometry(0.043, 0.043);
  const geometry = _getGeometry(geometry2, attributeSpecs, particleCount);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      cameraBillboardQuaternion: {
        value: new THREE.Quaternion(),
      },
      tearTexture: {
        value: null
      },
    },
    vertexShader:tearMarkVertexShader,
    fragmentShader: tearMarkFragmentShader,
    // side: THREE.DoubleSide,
    transparent: true,
  });

  const tearMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  tearMesh.info = {
    particleCount: particleCount,
    life: [particleCount],
    startTime: [particleCount],
  }

  return tearMesh;
}