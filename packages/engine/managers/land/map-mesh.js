import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import {
  chunkSize,
  chunkRange,
  // segments,
  gridHeight,
} from './constants.js';

//

const localVector = new THREE.Vector3();
const localVector2D = new THREE.Vector2();
const localColor = new THREE.Color();

//

class ParcelBoxMesh extends THREE.Mesh {
  constructor({
    color = 0x000000,
    // alpha = 0.3,
  } = {}) {
    const geometry = (() => {
      const geometries = [];
    
      // Create edge geometries
      const edgeLength = chunkSize;
    
      // Top edge
      const topGeo = new THREE.BoxGeometry(edgeLength, 1, 1);
      topGeo.translate( edgeLength / 2, edgeLength, 0 );
      geometries.push(topGeo);
    
      // Bottom edge
      const bottomGeo = new THREE.BoxGeometry(edgeLength, 1, 1);
      bottomGeo.translate( edgeLength / 2, 0, 0 );
      geometries.push(bottomGeo);
    
      // Left edge
      const leftGeo = new THREE.BoxGeometry(1, edgeLength, 1);
      leftGeo.translate( 0, edgeLength / 2, 0 );
      geometries.push(leftGeo);
    
      // Right edge
      const rightGeo = new THREE.BoxGeometry(1, edgeLength, 1);
      rightGeo.translate( edgeLength, edgeLength / 2, 0 );
      geometries.push(rightGeo);
    
      // Merge geometries
      const mergedGeo = BufferGeometryUtils.mergeBufferGeometries(geometries)
        .rotateX(Math.PI / 2)
      return mergedGeo;
    })();

    // use uv colors
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(color),
          needsUpdate: true,
        },
        alpha: {
          // value: alpha,
          value: 1,
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `\
        uniform vec3 color;
        uniform float alpha;
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });

    super(geometry, material);
    this.frustrumCulled = false;
  }
}

class TargetMesh extends THREE.Mesh {
  constructor({
    color = 0x000000,
    // alpha = 0.5,
    alpha = 1,
  } = {}) {
    const geometry = (() => {
      const length = 6;
      const width = 4;
      const xSide = new THREE.BoxGeometry(
        length,
        width,
        width,
      ).translate(length / 2, 0, -width / 2);
      const zSide = new THREE.BoxGeometry(
        width,
        width,
        length,
      ).translate(-width / 2, 0, length / 2);

      const topLeftCornerGeometry = BufferGeometryUtils.mergeBufferGeometries([
        xSide,
        zSide,
      ]);
      const topRightCornerGeometry = topLeftCornerGeometry.clone()
        .rotateY(
          -Math.PI / 2
        )
        .translate(chunkSize, 0, 0);
      const bottomLeftCornerGeometry = topLeftCornerGeometry.clone()
        .rotateY(
          Math.PI / 2
        )
        .translate(0, 0, chunkSize);
      const bottomRightCornerGeometry = topLeftCornerGeometry.clone()
        .rotateY(
          Math.PI
        )
        .translate(chunkSize, 0, chunkSize);

      const geometries = [
        topLeftCornerGeometry,
        topRightCornerGeometry,
        bottomLeftCornerGeometry,
        bottomRightCornerGeometry,
      ];

      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
      return geometry;
    })();

    // use uv colors
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: {
          value: new THREE.Color(color),
          needsUpdate: true,
        },
        alpha: {
          value: alpha,
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `\
        uniform vec3 color;
        uniform float alpha;
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(color, alpha);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });

    super(geometry, material);
    this.frustrumCulled = false;
  }
}

class RulerMesh extends THREE.Mesh {
  constructor() {
    const geometry = (() => {
      const lineLength = chunkSize * chunkRange;
      const lineThickness = 0.3;

      const widthLineGeometry = new THREE.BoxGeometry(
        lineLength,
        lineThickness,
        lineThickness,
      );
      const depthLineGeometry = new THREE.BoxGeometry(
        lineThickness,
        lineThickness,
        lineLength,
      );

      const geometries = [];
      for (let z = 0; z < chunkRange; z++) {
        const geometry = widthLineGeometry.clone()
          .translate(0, 0, -chunkRange * chunkSize / 2 + z * chunkSize);
        geometries.push(geometry);
      }
      for (let x = 0; x < chunkRange; x++) {
        const geometry = depthLineGeometry.clone()
          .translate(-chunkRange * chunkSize / 2 + x * chunkSize, 0, 0);
        geometries.push(geometry);
      }
      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
      return geometry;
    })();
    // use uv colors
    const material = new THREE.ShaderMaterial({
      vertexShader: `\
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `\
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(0., 0., 0., 0.5);
        }
      `,
      // side: THREE.DoubleSide,
      transparent: true,
    });

    super(geometry, material);
    this.frustrumCulled = false;
  }
}

class OwnerMesh extends THREE.InstancedMesh {
  constructor() {
    const baseGeometry = new THREE.PlaneGeometry(
      chunkSize * 0.9,
      chunkSize * 0.9,
    )
      .rotateX(-Math.PI / 2)
      .translate(chunkSize / 2, 0, chunkSize / 2);

    /* const baseGeometry = (() => {
      // draw edge planes at the top, bottom, left, right, leaving a hole in the center
      const w = 16;
      const topLeftGeometry = new THREE.PlaneGeometry(
        chunkSize,
        w,
      )
        .rotateX(-Math.PI / 2)
        .translate(chunkSize / 2, 0, w / 2);
      const topRightGeometry = topLeftGeometry.clone()
        .rotateY(-Math.PI / 2)
        .translate(chunkSize, 0, 0);
      const bottomLeftGeometry = topLeftGeometry.clone()
        .rotateY(Math.PI / 2)
        .translate(0, 0, chunkSize);
      const bottomRightGeometry = topLeftGeometry.clone()
        .rotateY(Math.PI)
        .translate(chunkSize, 0, chunkSize);

      const geometries = [
        topLeftGeometry,
        topRightGeometry,
        bottomLeftGeometry,
        bottomRightGeometry,
      ];
      const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries);
      return geometry;
    })(); */

    // instanced geometry
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = baseGeometry.index;
    geometry.attributes.position = baseGeometry.attributes.position;
    geometry.attributes.uv = baseGeometry.attributes.uv;

    const material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      vertexColors: THREE.VertexColors,
      transparent: true,
      opacity: 0.4,
    });
    const maxInstances = 5000;
    super(
      geometry,
      material,
      maxInstances,
    );

    this.frustrumCulled = false;

    this.tokenMap = new Map();
  }
  setTokenMap(tokenMap) {
    this.tokenMap = tokenMap;

    let i = 0;
    for (const [key, value] of this.tokenMap.entries()) {
      const {
        location,
        owner,
      } = value;
      if (location && owner) {
        const [x, z] = location;
        const px = x * chunkSize;
        const pz = z * chunkSize;

        const matrix = new THREE.Matrix4()
          .compose(
            new THREE.Vector3(
              px /*- chunkSize / 2*/,
              0,
              pz /*- chunkSize / 2*/,
            ),
            new THREE.Quaternion(),
            new THREE.Vector3(
              1,
              1,
              1,
            ),
          );
        this.setMatrixAt(i, matrix);

        // set color
        localColor.set(
          0x333333
        );
        this.setColorAt(i, localColor);

        i++;
      }
    }
    // set number of instances
    this.count = i;
    // update instance matrices
    this.instanceMatrix.needsUpdate = true;
  }
  setAddress(address) {
    let i = 0;
    for (const [key, value] of this.tokenMap.entries()) {
      const {
        location,
        owner,
      } = value;
      if (location && owner) {
        // set color
        localColor.set(
          owner.toLowerCase() === address ?
            0x66BB6A
          :
            0xEF5350
        );
        this.setColorAt(i, localColor);

        // console.log('got local color', [owner, address]);

        i++;
      }
    }
    // set number of instances
    this.count = i;
    // update instance matrices
    this.instanceMatrix.needsUpdate = true;

    // console.log('get attributes', this.attributes);
  }
}

//

export class MapMesh extends EventTarget {
  constructor({
    landManager,
  }) {
    super();

    this.landManager = landManager;

    const {
      engineRenderer,
      cameraManager,
      playersManager,
      appTracker,
    } = this.landManager;

    //

    this.lastChunkCoord = (() => {
      const localPlayer = playersManager.getLocalPlayer();
      const position = localPlayer.position.clone();
      position.x = Math.floor(position.x / chunkSize);
      position.z = Math.floor(position.z / chunkSize);
      return position;
    })();

    //

    this.parcelMesh = new ParcelBoxMesh();
    this.parcelMesh.position.y = gridHeight;
    engineRenderer.scene.add(this.parcelMesh);
    this.parcelMesh.updateMatrixWorld();

    //

    this.selectMesh = new TargetMesh({
      color: 0xFFFFFF,
      alpha: 0.5,
    });
    this.selectMesh.position.y = gridHeight;
    engineRenderer.scene.add(this.selectMesh);
    this.selectMesh.visible = false;
    this.selectMesh.updateMatrixWorld();

    //

    this.rulerMesh = new RulerMesh();
    this.rulerMesh.position.y = gridHeight;
    engineRenderer.scene.add(this.rulerMesh);
    this.rulerMesh.updateMatrixWorld();

    //

    this.ownerMesh = new OwnerMesh();
    this.ownerMesh.position.y = gridHeight;
    engineRenderer.scene.add(this.ownerMesh);
    this.ownerMesh.updateMatrixWorld();

    //

    this.selectCoord = new THREE.Vector2();
  }

  //

  getHoverPoint(target) {
    return target.copy(this.parcelMesh.position);
  }
  setHoverPoint(v3) {
    if (v3) {
      const chunkX = Math.floor(v3.x / chunkSize);
      const chunkZ = Math.floor(v3.z / chunkSize);

      const isStreet = chunkX !== 0 || globalThis.streetClaimAllowed || false;

      const px = chunkX * chunkSize;
      const pz = chunkZ * chunkSize;

      this.parcelMesh.position.set(
        px,
        gridHeight,
        pz,
      );
      this.parcelMesh.updateMatrixWorld();

      this.parcelMesh.visible = isStreet;

      this.dispatchEvent(new MessageEvent('hoverpointupdate', {
        data: {
          point: v3.toArray(),
        },
      }));
    } else {
      this.parcelMesh.visible = false;
    }
  }

  //

  getSelectPoint(target) {
    return target.copy(this.selectMesh.position);
  }
  setSelectPoint(v3) {
    if (v3) {
      const chunkX = Math.floor(v3.x / chunkSize);
      const chunkZ = Math.floor(v3.z / chunkSize);

      const px = chunkX * chunkSize;
      const pz = chunkZ * chunkSize;

      const isStreet = chunkX !== 0 || globalThis.streetClaimAllowed || false;
      if (isStreet) { // street (x=0) is reserved for now
        localVector.set(px, gridHeight, pz);
        if (!this.selectMesh.position.equals(localVector)) {
          this.selectMesh.position.copy(localVector);
          this.selectMesh.updateMatrixWorld();

          this.selectMesh.visible = true;

          this.dispatchEvent(new MessageEvent('selectpointupdate', {
            data: {
              point: v3.toArray(),
            },
          }));
        } else {
          this.selectMesh.position.setScalar(NaN);
          this.selectMesh.visible = false;

          this.dispatchEvent(new MessageEvent('selectpointupdate', {
            data: {
              point: null,
            },
          }));
        }
      } else {
        this.selectMesh.position.setScalar(NaN);
        this.selectMesh.visible = false;

        this.dispatchEvent(new MessageEvent('selectpointupdate', {
          data: {
            point: null,
          },
        }));
      }
    } else {
      this.selectMesh.position.setScalar(NaN);
      this.selectMesh.visible = false;

      this.dispatchEvent(new MessageEvent('selectpointupdate', {
        data: {
          point: null,
        },
      }));
    }
  }

  //

  /* getColor() {
    return this.selectMesh.material.uniforms.color.value.getHex();
  } */
  setColor(c) {
    this.selectMesh.material.uniforms.color.value.setHex(c);
    this.selectMesh.material.uniforms.color.needsUpdate = true;
  }

  //

  setTokenMap(tokenMap) {
    this.ownerMesh.setTokenMap(tokenMap);
  }
  setAddress(address) {
    this.ownerMesh.setAddress(address);
  }

  //

  setCameraPosition(v3) {
    this.rulerMesh.position.copy(v3);
    this.rulerMesh.position.x = Math.floor(this.rulerMesh.position.x / chunkSize) * chunkSize;
    this.rulerMesh.position.z = Math.floor(this.rulerMesh.position.z / chunkSize) * chunkSize;
    this.rulerMesh.position.y = gridHeight;
    this.rulerMesh.updateMatrixWorld();
  }

  //

  update(timestamp, timeDiff) {
    const {
      engineRenderer,
      playersManager,
      appTracker,
    } = this.landManager;

    const _getCurrentChunkCoord = target => {
      const localPlayer = playersManager.getLocalPlayer();
      const sx = Math.floor(localPlayer.position.x / chunkSize);
      const sz = Math.floor(localPlayer.position.z / chunkSize);
      return target.set(sx, sz);
    };

    const _render = () => {
      const currentChunkCoord = _getCurrentChunkCoord(localVector2D);
      if (!currentChunkCoord.equals(this.lastChunkCoord)) {
        this.lastChunkCoord.copy(currentChunkCoord);

        this.parcelMesh.position.set(
          currentChunkCoord.x * chunkSize,
          gridHeight,
          currentChunkCoord.y * chunkSize,
        );
        this.parcelMesh.updateMatrixWorld();
      }
    };
    _render();
  }
  destroy() {
    this.parcelMesh.parent.remove(this.parcelMesh);
    this.parcelMesh = null;

    this.selectMesh.parent.remove(this.selectMesh);
    this.selectMesh = null;

    this.rulerMesh.parent.remove(this.rulerMesh);
    this.rulerMesh = null;

    this.ownerMesh.parent.remove(this.ownerMesh);
    this.ownerMesh = null;
  }
}