import * as THREE from 'three';

import { shockMarkVertexShader, shockMarkFragmentShader } from "../../material/shock/shader.js";

export const getShockMesh = () => {
  const geometry = new THREE.PlaneGeometry(0.2, 0.2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      shockTexture: {
        value: null
      },
      textureOffset: {
        value: new THREE.Vector2()
      },
    },
    vertexShader:shockMarkVertexShader,
    fragmentShader: shockMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const shockMesh = new THREE.Mesh( geometry, material );
  shockMesh.index = 0;
  return shockMesh;
}