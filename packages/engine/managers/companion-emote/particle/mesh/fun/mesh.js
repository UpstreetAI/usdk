import * as THREE from 'three';

import { funMarkVertexShader, funMarkFragmentShader } from "../../material/fun/shader.js";
import { _getGeometry } from '../utils.js';

export const getFunMesh = () => {
  const particleCount = 8;
  const attributeSpecs = [];
  attributeSpecs.push({name: 'scales', itemSize: 1});
  const geometry2 = new THREE.PlaneGeometry(0.13, 0.13);
  const geometry = _getGeometry(geometry2, attributeSpecs, particleCount);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      sparkleTexture: {
        value: null
      }
    },
    vertexShader:funMarkVertexShader,
    fragmentShader: funMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    // blending: THREE.AdditiveBlending
  });

  const funMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  funMesh.info = {
    particleCount: particleCount,
    fadeIn: [particleCount],
    speed: [particleCount],
  }

  return funMesh;
}