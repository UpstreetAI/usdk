import * as THREE from 'three';

import { questionMarkVertexShader, questionMarkFragmentShader } from "../../material/question/shader.js";

export const getQuestionMesh = () => {
  const geometry = new THREE.PlaneGeometry(0.2, 0.2);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      questionTexture: {
        value: null
      },
      textureOffset: {
        value: new THREE.Vector2()
      },
      textureInfo: {
        value: new THREE.Vector3()
      }
    },
    vertexShader:questionMarkVertexShader,
    fragmentShader: questionMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const questionMesh = new THREE.Mesh( geometry, material );
  questionMesh.index = 0;
  return questionMesh;
}