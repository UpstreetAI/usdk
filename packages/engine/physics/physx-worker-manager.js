import * as THREE from 'three';
import {makeId} from './util.js';
import PhysxWorker from './physx-worker.js?worker';
import {getNextPhysicsId, convertMeshToPhysicsMesh, makePhysicsObject} from './util.js';

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();

const defaultNumPhysicsWorkers = 2;

class PhysicsWorkerScene extends EventTarget {
  constructor({
    worker,
  }) {
    super();

    this.worker = worker;

    this.loadPromise = (async () => {
      this.scene = await this.worker.request('make', {
        // positions: mesh.geometry.attributes.position.array,
        // indices: mesh.geometry.index.array,
      });
    })();
  }

  waitForLoad() {
    return this.loadPromise;
  }

  async addGeometry(mesh) {
    const physicsMesh = convertMeshToPhysicsMesh(mesh)
  
    const physicsId = getNextPhysicsId()

    const position = physicsMesh.getWorldPosition(localVector).toArray()
    const quaternion = physicsMesh.getWorldQuaternion(localQuaternion).toArray()
    const scale = physicsMesh.getWorldScale(localVector2).toArray()

    const result = await this.worker.request('addGeometry', {
      scene: this.scene,
      mesh: {
        position,
        quaternion,
        scale,
        positions: physicsMesh.geometry.attributes.position.array,
        indices: physicsMesh.geometry.index.array,
      },
      physicsId,
    });
    const {
      positions,
      indices,
      bounds,
    } = result;

    let geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    geometry = geometry.toNonIndexed()
    geometry.computeVertexNormals()
    geometry.boundingBox = new THREE.Box3(
      new THREE.Vector3().fromArray(bounds, 0),
      new THREE.Vector3().fromArray(bounds, 3)
    );
    physicsMesh.geometry = geometry

    const physicsObject = makePhysicsObject(
      physicsId,
      physicsMesh.position,
      physicsMesh.quaternion,
      physicsMesh.scale
    )
    physicsObject.add(physicsMesh)
    physicsMesh.position.set(0, 0, 0)
    physicsMesh.quaternion.set(0, 0, 0, 1)
    physicsMesh.scale.set(1, 1, 1)
    physicsMesh.updateMatrixWorld()
    physicsObject.physicsMesh = physicsMesh
    return physicsObject
  }
  async removeGeometry(physicsObject) {
    await this.waitForLoad();

    const physicsId = physicsObject.physicsId
    await this.worker.request('removeGeometry', {
      scene: this.scene,
      physicsId,
    });
  }

  async raycastArray(ps, qs, n) {
    await this.waitForLoad();

    const p = new Float32Array(ps.length * 3);
    for (let i = 0; i < ps.length; i++) {
      ps[i].toArray(p, i * 3);
    }
    const q = new Float32Array(qs.length * 4);
    for (let i = 0; i < qs.length; i++) {
      qs[i].toArray(q, i * 4);
    }

    return await this.worker.request('raycastArray', {
      scene: this.scene,
      p,
      q,
      n,
    });
  }

  async destroy() {
    await this.worker.request('destroy', {
      scene: this.scene,
    });
  }
}

class PhysicsWorkerManager {
  constructor({
    numWorkers = defaultNumPhysicsWorkers,
  } = {}) {
    this.numWorkers = numWorkers;

    this.workers = [];
    this.nextWorker = 0;
    this.loadPromise = null;
  }

  scenes = new Map();
  async getScene(instance = null) {
    let scene = this.scenes.get(instance);
    if (!scene) {
      const worker = this.workers[this.nextWorker];
      this.nextWorker = (this.nextWorker + 1) % this.workers.length;

      scene = new PhysicsWorkerScene({
        worker,
      });
      await scene.waitForLoad();
      this.scenes.set(instance, scene);
    }
    return scene;
  }

  waitForLoad() {
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        // create workers
        const workers = Array(this.numWorkers);
        for (let i = 0; i < this.numWorkers; i++) {
          /* const worker = new Worker('./physx-worker.js?import', {
            type: 'module',
          }); */
          const worker = new PhysxWorker();
          const cbs = new Map();
          worker.onmessage = e => {
            const {requestId} = e.data;
            const cb = cbs.get(requestId);
            if (cb) {
              cbs.delete(requestId);
              cb(e.data);
            } else {
              console.warn('worker message without callback', e.data);
            }
          };
          worker.onerror = err => {
            console.log('physx worker load error', err);
          };
          worker.request = (method, args) => {
            return new Promise((resolve, reject) => {
              const requestId = makeId(5);
              cbs.set(requestId, data => {
                const {error, result} = data;
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              });
              worker.postMessage({
                method,
                args,
                requestId,
              });
            });
          };
          workers[i] = worker;
        }
        this.workers = workers;
      })();
    }
    return this.loadPromise;
  }

  async cookGeometry(mesh) {
    await this.waitForLoad();

    const {workers} = this;
    const worker = workers[this.nextWorker];
    this.nextWorker = (this.nextWorker + 1) % workers.length;

    const result = await worker.request('cookGeometry', {
      positions: mesh.geometry.attributes.position.array,
      indices: mesh.geometry.index.array,
    });
    return result;
  }

  async cookConvexGeometry(mesh) {
    await this.waitForLoad();
    
    const {workers} = this;
    const worker = workers[this.nextWorker];
    this.nextWorker = (this.nextWorker + 1) % workers.length;

    const result = await worker.request('cookConvexGeometry', {
      positions: mesh.geometry.attributes.position.array,
      indices: mesh.geometry.index.array,
    });
    return result;
  }

  async cookHeightfieldGeometry(numRows, numColumns, heights) {
    await this.waitForLoad();

    const {workers} = this;
    const worker = workers[this.nextWorker];
    this.nextWorker = (this.nextWorker + 1) % workers.length;

    const result = await worker.request('cookHeightfieldGeometry', {
      numRows,
      numColumns,
      heights,
    });
    return result;
  }

  async meshoptSimplify(mesh, targetRatio, targetError) {
    await this.waitForLoad();
    
    const {workers} = this;
    const worker = workers[this.nextWorker];
    this.nextWorker = (this.nextWorker + 1) % workers.length;

    const result = await worker.request('meshoptSimplify', {
      positions: mesh.geometry.attributes.position.array,
      // uvs: mesh.geometry.attributes.uv.array,
      indices: mesh.geometry.index.array,
      targetRatio,
      targetError,
    });
    return result;
  }

  async meshoptSimplifySloppy(mesh, targetRatio, targetError) {
    await this.waitForLoad();
    
    const {workers} = this;
    const worker = workers[this.nextWorker];
    this.nextWorker = (this.nextWorker + 1) % workers.length;

    const result = await worker.request('meshoptSimplifySloppy', {
      positions: mesh.geometry.attributes.position.array,
      // uvs: mesh.geometry.attributes.uv.array,
      indices: mesh.geometry.index.array,
      targetRatio,
      targetError,
    });
    return result;
  }
}
const physicsWorkerManager = new PhysicsWorkerManager();
export default physicsWorkerManager;