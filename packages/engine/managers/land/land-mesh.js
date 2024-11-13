import * as THREE from 'three';
import bezier from '../../easing.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import {
  chunkSize,
  segments,
  chunkHeight,
  // customChunkType,
} from './constants.js';

//

const localVector2D = new THREE.Vector2();

//

const cubicBezier = bezier(0, 1, 0, 1);

//

class ChunkShaderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        iTime: {
          value: 0,
          needsUpdate: true,
        },
        heightfieldMap: {
          value: null,
          needsUpdate: false,
        },
      },
      vertexShader: `\
        uniform float iTime;
        uniform sampler2D heightfieldMap;
        attribute vec2 uv2;
        varying vec2 vUv;
        varying vec2 vUv2;

        void main() {
            vUv = uv;
            vUv2 = uv2;

            vec3 p = position;
            p.y *= iTime * 0.9;

            vec4 heightfield = texture2D(heightfieldMap, vUv2);
            p.y += heightfield.r;

            p.y += 0.2;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
        `,
      fragmentShader: `\
        uniform float iTime;
        varying vec2 vUv;
        varying vec2 vUv2;

        // 0x29B6F6
        // 0x81D4FA
        vec3 blue400 = vec3(${new THREE.Color(0x29B6F6).toArray().join(', ')});
        vec3 blue200 = vec3(${new THREE.Color(0x81D4FA).toArray().join(', ')});

        void main() {
            vec3 color = mix(blue200, blue400, vUv.y);
            gl_FragColor = vec4(color, iTime);
            if (gl_FragColor.a < 0.1) {
            discard;
            }

            // gl_FragColor.rg = vUv2;
            // gl_FragColor.b = 0.;
        }
        `,
      transparent: true,
    });
  }
}

//

class ChunksTracker extends EventTarget {
  constructor() {
    super();

    this.chunks = new Map();
  }
  addChunk(key, chunk) {
    this.chunks.set(key, chunk);

    this.dispatchEvent(new MessageEvent('addchunk', {
      data: {
        chunk,
      },
    }));
  }
  removeChunk(key) {
    const chunk = this.chunks.get(key);
    this.chunks.delete(key);

    this.dispatchEvent(new MessageEvent('removechunk', {
      data: {
        chunk,
      },
    }));
  }
  async waitForChunk(v2) {
    const key = `${v2.x}:${v2.y}`;
    let chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = await new Promise((accept, reject) => {
        const addchunk = e => {
          const {
            chunk,
          } = e.data;
          let { x, z } = chunk;
          x /= chunkSize;
          z /= chunkSize;
          const key2 = `${x}:${z}`;

          if (chunk.size === chunkSize) {
            if (key2 === key) {
              accept(chunk);
              cleanup();
            }
          }
        };
        this.addEventListener('addchunk', addchunk);

        const cleanup = () => {
          this.removeEventListener('addchunk', addchunk);
        };
      });
    }
    return chunk;
  }
}

//

const _makeGridGeometry = (
  width,
  height,
  depth,
  segments,
  lineWidth,
) => {
  const sideLinesGeometry = (() => {
    // generate one side of geometry
    const sideLines = [];
    // vertical lines
    {
      const heightLine = new THREE.BoxGeometry(
        lineWidth,
        height,
        lineWidth,
        segments,
        height,
        segments,
      );
      // make sure to handle off-by-one error
      for (let x = 0; x <= width; x++) {
        const heightLineGeometry = heightLine.clone()
          .translate(x - width / 2, 0, 0);
        sideLines.push(heightLineGeometry);
      }
    }
    // horizontal lines
    {
      const widthLine = new THREE.BoxGeometry(
        width,
        lineWidth,
        lineWidth,
        segments,
        1,
        1,
      );
      // make sure to handle off-by-one error
      for (let y = 0; y <= height; y++) {
        const widthLineGeometry = widthLine.clone()
          .translate(0, y - height / 2, 0);
        sideLines.push(widthLineGeometry);
      }
    }
    // merge the side lines into a single geometry
    const sideLinesGeometry = BufferGeometryUtils.mergeBufferGeometries(sideLines);

    // set uv based on height, bottom to top
    {
      const positionAttribute = sideLinesGeometry.getAttribute('position');
      const positions = positionAttribute.array;
      const uvAttribute = sideLinesGeometry.getAttribute('uv');
      const uvs = uvAttribute.array;

      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i + 0];
        const y = positions[i + 1];
        // const z = positions[i + 2];
        const u = Math.min(Math.max((x + width / 2) / width, 0), 1);
        const v = Math.min(Math.max(y / height, 0), 1);
        uvs[i / 3 * 2 + 0] = u;
        uvs[i / 3 * 2 + 1] = v;
      }
    }

    // shift the geometry to +z based on the chunkSize
    sideLinesGeometry.translate(0, height / 2, depth / 2);

    return sideLinesGeometry;
  })();

  // floor
  const floorGeometry = (() => {
    const floorLines = [];

    const widthLine = new THREE.BoxGeometry(width, lineWidth, lineWidth, segments, 1, 1);
    // make sure to handle off-by-one error
    for (let z = 0; z <= depth; z++) {
      const widthLineGeometry = widthLine.clone()
        .translate(0, 0, z - depth / 2);
      floorLines.push(widthLineGeometry);
    }

    const depthLine = new THREE.BoxGeometry(lineWidth, lineWidth, depth, 1, 1, segments);
    // make sure to handle off-by-one error
    for (let x = 0; x <= width; x++) {
      const depthLineGeometry = depthLine.clone()
        .translate(x - width / 2, 0, 0);
      floorLines.push(depthLineGeometry);
    }

    const floorGeometry = BufferGeometryUtils.mergeBufferGeometries(floorLines);
    return floorGeometry;
  })();

  // generate geometries for all 4 sides
  const geometries = [
    sideLinesGeometry,
    floorGeometry,
  ];
  for (let i = 1; i < 4; i++) {
    const geometry = sideLinesGeometry.clone()
      .rotateY(i * Math.PI / 2);
    geometries.push(geometry);
  }
  const geometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
    .translate(width / 2, 0, depth / 2);

  // set x-z uvs
  {
    const positionAttribute = geometry.getAttribute('position');
    const positions = positionAttribute.array;
    const uv2s = new Float32Array(positions.length / 3 * 2);
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i + 0];
      // const y = positions[i + 1];
      const z = positions[i + 2];
      // const u = Math.min(Math.max((x - 0.5) / width, 0), 1);
      // const v = Math.min(Math.max((z - 0.5) / width, 0), 1);
      // const u = Math.min(Math.max((x + 0.5) / width, 0), 1);
      // const v = Math.min(Math.max((z + 0.5) / depth, 0), 1);
      const u = Math.min(Math.max(x / width, 0), 1);
      const v = Math.min(Math.max(z / depth, 0), 1);
      uv2s[i / 3 * 2 + 0] = u;
      uv2s[i / 3 * 2 + 1] = v;
    }
    geometry.setAttribute('uv2', new THREE.BufferAttribute(uv2s, 2));
  }

  return geometry;
};
export class GridMesh {
  constructor({
    landManager,
  }) {
    this.landManager = landManager;

    const {
      engineRenderer,
      cameraManager,
      playersManager,
      appTracker,
    } = this.landManager;

    if (!engineRenderer || !cameraManager || !playersManager || !appTracker) {
      console.warn('missing arguments', {
        engineRenderer,
        cameraManager,
        playersManager,
        appTracker,
      });
      throw new Error('missing arguments');
    }


    const chunksTracker = new ChunksTracker();
    appTracker.registerAppTracker({
      // appManagerName: 'adventure',
      query: /terrain$/,
      addCb: terrainApp => {
        terrainApp.listenTerrains(e => {
          const {
            terrain,
          } = e;
          // if (chunk.customType === customChunkType) {
            // if (chunk.size === chunkSize) {
              const {x, z} = terrain;
              const key = `${x}:${z}`;
              chunksTracker.addChunk(key, terrain);
            // }
          // }
        }, e => {
          const {
            terrain,
          } = e;
          // if (chunk.customType === customChunkType) {
            // console.log('remove chunk', chunk);
            const {x, z}  = terrain;
            const key = `${x}:${z}`;
            chunksTracker.removeChunk(key);
          // }
        });
      },
      removeCb: terrainApp => {
        // console.log('remove app', terrainApp);
      },
    });

    //
  
    this.geometry = GridMesh.gridGeometry;

    this.meshes = [];
    this.lastChunkCoord = new THREE.Vector2(NaN, NaN);
  }

  update(timestamp, timeDiff) {
    const {
      engineRenderer,
      playersManager,
      // appTracker,
      appManagerContext,
    } = this.landManager;

    const _getCurrentChunkCoord = target => {
      const localPlayer = playersManager.getLocalPlayer();
      const sx = Math.floor(localPlayer.position.x / chunkSize);
      const sz = Math.floor(localPlayer.position.z / chunkSize);
      return target.set(sx, sz);
    };

    const _createChunkMesh = (currentChunkCoord) => {
      (async () => {
        const appManager = appManagerContext.getAppManager('adventure');
        const terrainApp = appManager.findApp(/terrain$/);
        // console.log('got app', terrainApp, appManager.getApps().map(a => a.name));
        if (terrainApp) {
          const terrain = await terrainApp.createTerrain(currentChunkCoord.x, currentChunkCoord.y);
          let {
            elevations,
          } = terrain;
          elevations = elevations.slice();
          terrainApp.destroyTerrain(terrain);

          const dataTexture = new THREE.DataTexture(elevations, segments, segments, THREE.RedFormat, THREE.FloatType);
          dataTexture.minFilter = THREE.LinearFilter;
          dataTexture.magFilter = THREE.LinearFilter;
          dataTexture.needsUpdate = true;
          mesh.material.uniforms.heightfieldMap.value = dataTexture;
          mesh.material.uniforms.heightfieldMap.needsUpdate = true;

          mesh.visible = true;
        }
      })();

      const {geometry} = this;
      const material = new ChunkShaderMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      mesh.visible = false;

      mesh.position.set(
        currentChunkCoord.x * chunkSize,
        0,
        currentChunkCoord.y * chunkSize,
      );

      mesh.animationSpec = null;

      return mesh;
    };

    const _enterMeshes = meshes => {
      for (const mesh of meshes) {
        const startTime = performance.now();
        const endTime = startTime + 2 * 1000;
        mesh.animationSpec = {
          startTime,
          endTime,
          value: mesh.animationSpec?.value,
          startValue: mesh.animationSpec?.value ?? 0,
          endValue: 1,
        };
      }
    };
    const _exitMeshes = meshes => {
      for (const mesh of meshes) {
        const startTime = performance.now();
        const endTime = startTime + 1 * 1000;
        mesh.animationSpec = {
          startTime,
          endTime,
          value: mesh.animationSpec?.value,
          startValue: mesh.animationSpec?.value ?? 1,
          endValue: 0,
        };
      }
    };

    //

    const _updateAnimations = () => {
      for (let i = 0; i < this.meshes.length; i++) {
        const mesh = this.meshes[i];
        if (mesh.animationSpec) {
          let f = Math.min(Math.max(
            (timestamp - mesh.animationSpec.startTime) / (mesh.animationSpec.endTime - mesh.animationSpec.startTime),
            0),
            1);
          f = cubicBezier(f);
          if (mesh.animationSpec.endValue > 0 || f < 1) {
            const value = (1 - f) * mesh.animationSpec.startValue + f * mesh.animationSpec.endValue;
            mesh.material.uniforms.iTime.value = value;
            mesh.material.uniforms.iTime.needsUpdate = true;
          } else {
            mesh.animationSpec = null;
            this.meshes.splice(i, 1);
            i--;
            mesh.parent.remove(mesh);
          }
        }
      }
    };
    _updateAnimations();

    const _render = () => {
      const currentChunkCoord = _getCurrentChunkCoord(localVector2D);
      // if chunks are different
      if (!currentChunkCoord.equals(this.lastChunkCoord)) {
        _exitMeshes(this.meshes);

        const mesh = _createChunkMesh(currentChunkCoord);
        engineRenderer.scene.add(mesh);
        mesh.updateMatrixWorld();

        this.meshes.push(mesh);

        _enterMeshes([mesh]);

        this.lastChunkCoord.copy(currentChunkCoord);
      }
    };
    _render();
  }
  destroy() {
    for (const mesh of this.meshes) {
      mesh.parent.remove(mesh);
    }
    this.meshes.length = 0;
  }

  static gridGeometry = null;
  static async waitForLoad() {
    await Promise.resolve();
    this.gridGeometry = _makeGridGeometry(chunkSize, chunkHeight, chunkSize, segments, 0.03);
  }
}