import * as THREE from 'three';

import { sweatDropMarkVertexShader, sweatDropMarkFragmentShader } from "../../material/sweat-drop/shader.js";

export const getSweatDropMesh = () => {
  const geometry = new THREE.PlaneGeometry(0.19, 0.19);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      sweatDropTexture: {
        value: null
      }
    },
    vertexShader:sweatDropMarkVertexShader,
    fragmentShader: sweatDropMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const sweatDropMesh = new THREE.Mesh( geometry, material );
  sweatDropMesh.velocity = 0;
  sweatDropMesh.acc = 0.00006;
  return sweatDropMesh;
}