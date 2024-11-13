import * as THREE from 'three';

import { sorrowMarkVertexShader, sorrowMarkFragmentShader } from "../../material/sorrow/shader.js";
import { _getGeometry } from '../utils.js';

export const getSorrowMesh = () => {
  const particleCount = 5;
  const attributeSpecs = [];
  attributeSpecs.push({name: 'index', itemSize: 1});
  attributeSpecs.push({name: 'scales', itemSize: 1});
  const geometry2 = new THREE.PlaneGeometry(0.9, 0.9);
  const geometry = _getGeometry(geometry2, attributeSpecs, particleCount);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      sorrowTexture1: {
        value: null
      },
      sorrowTexture2: {
        value: null
      }
    },
    vertexShader:sorrowMarkVertexShader,
    fragmentShader: sorrowMarkFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });

  const sorrowMesh = new THREE.InstancedMesh(geometry, material, particleCount);
  sorrowMesh.info = {
    particleCount: particleCount,
    acc: 0.003,
    index: [particleCount]
  }

  return sorrowMesh;
}