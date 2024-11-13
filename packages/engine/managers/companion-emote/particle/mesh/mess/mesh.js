import * as THREE from 'three';

import { messMarkVertexShader, messMarkFragmentShader } from "../../material/mess/shader.js";

export const getMessMesh = () => {
  const geometry = new THREE.PlaneGeometry(0.8, 0.8);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      messTexture: {
        value: null
      },
      textureOffset: {
        value: new THREE.Vector2()
      },
    },
    vertexShader:messMarkVertexShader,
    fragmentShader: messMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const messMesh = new THREE.Mesh( geometry, material );
  messMesh.index = 0;
  messMesh.lastEmitTime = 0;
  return messMesh;
}