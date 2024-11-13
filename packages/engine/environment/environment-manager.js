import * as THREE from 'three';
import {Winds} from './simulation/wind.js';

//

class SkyboxMesh extends THREE.Mesh {
  constructor() {
    const geometry = new THREE.SphereGeometry(5000);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: {
          value: new THREE.Color(0xFFFFFF),
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;
        void main() {
          vUv = uv;
          // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `\
        uniform vec3 uColor;
        void main() {
          gl_FragColor = vec4(uColor, 1.);
        }
      `,
      // transparent: true,
      // depthWrite: false,
      // depthTest: false,
      side: THREE.BackSide,
    });
    super(geometry, material);

    this.name = 'SkyboxMesh';
    this.frustumCulled = false;
  }
}


//

export class EnvironmentManager {
  constructor({
    engineRenderer = null,
  } = {}) {
    this.engineRenderer = engineRenderer;
  }

  #backgrounds = new Set();
  #winds = new Set();
  #mirrors = new Set();

  wind = new Winds(this.#winds);
  backgroundMesh = new SkyboxMesh();

  addBackground(background) {
    if (this.engineRenderer) {
      this.#backgrounds.add(background);

      this.#updateBackground();
    } else {
      throw new Error('had no engine renderer');
    }
  }
  removeBackground(background) {
    if (this.engineRenderer) {
      this.#backgrounds.delete(background);

      this.#updateBackground();
    } else {
      throw new Error('had no engine renderer');
    }
  }
  #updateBackground() {
    const {sceneHighPriority} = this.engineRenderer;
    const firstBackground = this.#backgrounds.values().next().value;
    const color = firstBackground?.color;
    if (typeof color === 'number') {
      this.backgroundMesh.material.uniforms.uColor.value.setHex(color);
      this.backgroundMesh.material.uniforms.uColor.needsUpdate = true;
      sceneHighPriority.add(this.backgroundMesh);
    } else if (Array.isArray(color) && color.length === 3 && color.every(n => typeof n === 'number')) {
      this.backgroundMesh.material.uniforms.uColor.value.fromArray(color).divideScalar(255);
      this.backgroundMesh.material.uniforms.uColor.needsUpdate = true;
      sceneHighPriority.add(this.backgroundMesh);
    } else {
      this.backgroundMesh.parent && this.backgroundMesh.parent.remove(this.backgroundMesh);
    }
  }

  getWinds() {
    return this.#winds;
  }
  addWind(wind) {
    this.#winds.add(wind);
  }
  removeWind(wind) {
    this.#winds.delete(wind);
  }

  getMirrors() {
    return this.#mirrors;
  }
}