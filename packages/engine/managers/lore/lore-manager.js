import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import {
  Message,
} from './message.js';
import {
  Lore,
} from './lore.js';
import {
  Actor,
} from './actor.js';

//

export class LoreManager extends THREE.Object3D {
  constructor(opts) {
    super();

    this.#lore = new Lore();
  }
  #lore;

  getLore() {
    return this.#lore;
  }

  createActor(opts) {
    return new Actor(opts);
  }
  autocompleteActorName(name) {
    const lore = this.getLore();
    const actors = lore.getActors();
    for (const actor of actors) {
      if (actor.spec.name === name) {
        return actor.spec.name;
      }
    }
    const nameLowercase = name.toLowerCase();
    for (const actor of actors) {
      if (actor.spec.name.toLowerCase() === nameLowercase) {
        return actor.spec.name;
      }
    }
    for (const actor of actors) {
      if (actor.spec.name.toLowerCase().startsWith(nameLowercase)) {
        return actor.spec.name;
      }
    }
    return name;
  }

  createAnonymousChatMessage({
    user_id,
    content,
    type = "",
  }) {
    const id = crypto.randomUUID();
    const m = Message.fromRaw({
      id,
      user_id,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      type,
    });
    return m;
  }

  addName(...args) {
    return this.#lore.addName(...args);
  }
  removeName(...args) {
    return this.#lore.removeName(...args);
  }
  addDescription(...args) {
    return this.#lore.addDescription(...args);
  }
  removeDescription(...args) {
    return this.#lore.removeDescription(...args);
  }

  getContentRating() {
    return this.#lore.getContentRating();
  }
  setContentRating(...args) {
    return this.#lore.setContentRating(...args);
  }

  addLoreItem(...args) {
    return this.#lore.addLoreItem(...args);
  }
  removeLoreItem(...args) {
    return this.#lore.removeLoreItem(...args);
  }

  addLocation(...args) {
    return this.#lore.addLocation(...args);
  }
  removeLocation(...args) {
    return this.#lore.removeLocation(...args);
  }

  getActorById(actorId) {
    return this.#lore.getActorById(actorId);
  }

  addActor(actor) {
    this.#lore.addActor(actor);
  }
  removeActor(actor) {
    this.#lore.removeActor(actor);
  }

  // setMode(mode) {
  //   debugger;
  //   throw new Error('use RenderedLoreManager');
  // }
  update(timestamp, timeDiff) {
    // nothing
  }
}

//

const localVector = new THREE.Vector3();
const localBox = new THREE.Box3();

const length = 1;
const thickness = 0.02;
const scanMeshGeometry = (() => {
  // set the direction attribute
  const setOffset = (geometry, filterVector) => {
    const positionAttribute = geometry.getAttribute('position');
    const offsetArray = new Float32Array(positionAttribute.count * 3);
    for (let i = 0; i < positionAttribute.array.length; i += 3) {
      localVector.fromArray(positionAttribute.array, i)
        .multiply(filterVector)
        .toArray(offsetArray, i);
    }
    globalThis.offsetArray = offsetArray;
    geometry.setAttribute('offset', new THREE.BufferAttribute(offsetArray, 3));
  };

  // top bar
  const topBarGeometry = new THREE.BoxGeometry(length + thickness, thickness, thickness);
  setOffset(topBarGeometry, new THREE.Vector3(thickness, 1, 1));
  topBarGeometry.translate(0, length / 2, 0);
  // bottom bar
  const bottomBarGeometry = new THREE.BoxGeometry(length + thickness, thickness, thickness);
  setOffset(bottomBarGeometry, new THREE.Vector3(thickness, 1, 1));
  bottomBarGeometry.translate(0, -length / 2, 0);
  // left bar
  const leftBarGeometry = new THREE.BoxGeometry(thickness, length + thickness, thickness);
  setOffset(leftBarGeometry, new THREE.Vector3(1, thickness, 1));
  leftBarGeometry.translate(-length / 2, 0, 0);
  // right bar
  const rightBarGeometry = new THREE.BoxGeometry(thickness, length + thickness, thickness);
  setOffset(rightBarGeometry, new THREE.Vector3(1, thickness, 1));
  rightBarGeometry.translate(length / 2, 0, 0);
  // top bottom left right bars
  const geometry = BufferGeometryUtils.mergeBufferGeometries([
    topBarGeometry,
    bottomBarGeometry,
    leftBarGeometry,
    rightBarGeometry,
  ]);
  return geometry;
})();
class ScanMesh extends THREE.Mesh {
  constructor({
    camera,
    object,
    loreManager,
  }) {

    const scanMeshMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uSize: {
          value: new THREE.Vector3(1, 1, 1),
          needsUpdate: true,
        },
        uColor: {
          value: new THREE.Color(0xFF0000),
          needsUpdate: true,
        },
      },
      vertexShader: `\
        uniform vec3 uSize;
        attribute vec3 offset;
        // varying vec2 vUv;

        void main() {
          // vUv = uv;

          vec3 p = position;
          p -= offset;
          p *= uSize;
          p += offset;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `\
        // basic fragment shader
        uniform vec3 uColor;
        // varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(uColor, 1.0);
        }
      `,
    });
    super(scanMeshGeometry, scanMeshMaterial);

    this.camera = camera;
    this.object = object;
    this.loreManager = loreManager;
  }
  update() {
    const box3 = localBox.setFromObject(this.object, true);
    const {camera} = this;

    //

    // Calculate the center of the Box3
    // const worldCenter = new THREE.Vector3();
    // box3.getCenter(worldCenter);

    // Calculate the corners of the Box3
    const corners = [
      new THREE.Vector3(box3.min.x, box3.min.y, box3.min.z),
      new THREE.Vector3(box3.min.x, box3.min.y, box3.max.z),
      new THREE.Vector3(box3.min.x, box3.max.y, box3.min.z),
      new THREE.Vector3(box3.min.x, box3.max.y, box3.max.z),
      new THREE.Vector3(box3.max.x, box3.min.y, box3.min.z),
      new THREE.Vector3(box3.max.x, box3.min.y, box3.max.z),
      new THREE.Vector3(box3.max.x, box3.max.y, box3.min.z),
      new THREE.Vector3(box3.max.x, box3.max.y, box3.max.z)
    ];
    // clamp all corners to [-1, 1] in camera space, then shift back to world space
    let numOutrangedPoints = 0;
    for (const corner of corners) {
      corner.project(camera); // project to camera space
      if (corner.x < -1 || corner.x > 1 || corner.y < -1 || corner.y > 1 || corner.z < -1 || corner.z > 1) {
        numOutrangedPoints++;
      }
      corner.clampScalar(-1, 1); // clamp to [-1, 1] in camera space
      corner.unproject(camera); // unproject back to world space
    }
    this.visible = numOutrangedPoints <= 4;

    // compute the corner center
    const worldCenter = new THREE.Vector3();
    for (const corner of corners) {
      worldCenter.add(corner);
    }
    worldCenter.divideScalar(corners.length);

    // XXX debugging
    /* {
      // remove old corner meshes
      for (const cornerMesh of cornerMeshes) {
        cornerMesh.parent.remove(cornerMesh);
      }
      cornerMeshes.length = 0;

      // add new corner meshes
      for (let i = 0; i < 8; i++) {
        const corner = corners[i];
        const cornerMesh = makeCornerMesh(corner);
        cornerMesh.position.copy(corner);
        scene.add(cornerMesh);
        cornerMesh.updateMatrixWorld();
        cornerMeshes.push(cornerMesh);
      }
    } */

    // Project corners to camera space
    const projectedCorners = corners.map(corner => {
      corner = corner.clone();
      // corner.applyMatrix4(this.object.matrixWorld); // transform to world coordinates
      corner.project(camera); // project to camera space
      return corner;
    });

    // Find the bounding box in camera space
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const corner of projectedCorners) {
      minX = Math.min(minX, corner.x);
      minY = Math.min(minY, corner.y);
      maxX = Math.max(maxX, corner.x);
      maxY = Math.max(maxY, corner.y);
    }

    // Compute the 2D center in camera space
    // const center2D = new THREE.Vector3((minX + maxX) / 2, (minY + maxY) / 2, 0);

    // Compute the size of the box in camera space
    const w = (maxX - minX) / 2;
    const h = (maxY - minY) / 2;

    // now, compute a rough size of the frame at the given distance from the camera, using the camera's parameters
    const distanceFromCamera = camera.position.distanceTo(worldCenter);

    // Calculate vertical FOV in radians
    const vFOV = THREE.MathUtils.degToRad(camera.fov);

    // Calculate the height of the frustum slice at the distance from the camera
    const frustumHeight = 2 * Math.tan(vFOV / 2) * distanceFromCamera;

    // Calculate the width of the frustum slice based on aspect ratio
    const frustumWidth = frustumHeight * camera.aspect;

    // Scale the frustum dimensions based on the 2D bounding box
    const worldWidth = w * frustumWidth;
    const worldHeight = h * frustumHeight;

    // Now, worldWidth and worldHeight contain the dimensions of the frame in world coordinates
    // You can set these as your frame's dimensions
    const worldSize = new THREE.Vector3(worldWidth, worldHeight, 1);  // Assuming the frame is 1 unit thick

    //

    this.position.copy(worldCenter);
    this.quaternion.copy(this.camera.quaternion);
    // this.scale.copy(worldSize);
    this.updateMatrixWorld();

    //

    this.material.uniforms.uSize.value.copy(worldSize);
    this.material.uniforms.uSize.needsUpdate = true;
  }
}

export class RenderedLoreManager extends LoreManager {
  constructor(opts) {
    super(opts);

    const {
      engineRenderer,
    } = opts;

    if (!engineRenderer) {
      console.warn('missing arguments', {
        engineRenderer,
      });
      throw new Error('missing arguments');
    }

    this.engineRenderer = engineRenderer;

    this.scanMeshes = [];
    this.mode = 'play';
  }

  setMode(mode) { // XXX break out scan meshes into another manager
    this.mode = mode;
  }

  addActor(actor) {
    super.addActor(actor);

    if (actor.type === 'object') {
      const {scene, camera} = this.engineRenderer;

      const {
        object,
      } = actor;
      const scanMesh = new ScanMesh({
        camera,
        object,
        loreManager: this,
      });
      scanMesh.visible = false;
      scene.add(scanMesh);
      scanMesh.updateMatrixWorld();
      this.scanMeshes.push(scanMesh);
    }
  }
  removeActor(actor) {
    super.removeActor(actor);

    if (actor.type === 'object') {
      const itemObject = actor.object;
      const scanMeshIndex = this.scanMeshes.findIndex(scanMesh => scanMesh.object === itemObject);
      if (scanMeshIndex !== -1) {
        const scanMesh = this.scanMeshes[scanMeshIndex];
        scanMesh.parent.remove(scanMesh);
        this.scanMeshes.splice(scanMeshIndex, 1);
      } else {
        console.warn('scan mesh not found', args[2]);
      }
    }
  }

  update(timestamp, timeDiff) {
    super.update(timestamp, timeDiff);

    const scanMeshesVisible = this.mode === 'aiAgents';
    if (scanMeshesVisible) {
      for (const scanMesh of this.scanMeshes) {
        scanMesh.update();
      }
    } else {
      for (const scanMesh of this.scanMeshes) {
        scanMesh.visible = false;
      }
    }
  }
}