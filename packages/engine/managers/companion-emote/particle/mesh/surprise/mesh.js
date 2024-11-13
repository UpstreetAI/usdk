import * as THREE from 'three';

import { surpriseMarkVertexShader, surpriseMarkFragmentShader } from "../../material/surprise/shader.js";

export const getSurpriseMesh = () => {
  const geometry = new THREE.PlaneGeometry(0.13, 0.13);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      surpriseTexture: {
        value: null
      }
    },
    vertexShader:surpriseMarkVertexShader,
    fragmentShader: surpriseMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const surpriseMesh = new THREE.Mesh( geometry, material );
  return surpriseMesh;
}