import * as THREE from 'three';

import { angryMarkVertexShader, angryMarkFragmentShader } from "../../material/angry/shader.js";

export const getAngryMesh = () => {
  const geometry = new THREE.PlaneGeometry(0.1, 0.1);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      angryTexture: {
        value: null
      }
    },
    vertexShader:angryMarkVertexShader,
    fragmentShader: angryMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const angryMesh = new THREE.Mesh( geometry, material );
  return angryMesh;
}