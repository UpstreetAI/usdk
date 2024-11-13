import * as THREE from 'three';

import { keyboardMarkVertexShader, keyboardMarkFragmentShader } from "../../material/keyboard/shader.js";

export const getKeyboardMesh = () => {
  const geometry = new THREE.PlaneGeometry(0.4, 0.12);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      keyboardTexture: {
        value: null
      },
      textureOffset: {
        value: new THREE.Vector2()
      },
    },
    vertexShader:keyboardMarkVertexShader,
    fragmentShader: keyboardMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const keyboardMesh = new THREE.Mesh( geometry, material );
  keyboardMesh.index = 0;
  return keyboardMesh;
}