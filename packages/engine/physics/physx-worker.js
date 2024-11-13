import * as THREE from 'three';
// import physxLite from './physx-lite.js';
import physx from './physx.js';
import {makePromise} from './util.js'
// import {Allocator, ScratchStack} from '../geometry-util.js';

// const localVector = new THREE.Vector3();

const fakeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});
// const scratchStackSize = 8 * 1024 * 1024;

let loaded = false;
let running = false;
let queue = [];
const _handleMethod = ({
  method,
  args,
}) => {
  switch (method) {
    case 'make': {
      const scene = physx.physxWorker.makeScene();
      return {
        result: scene,
        transfers: [],
      };
    }
    case 'destroy': {
      const {
        scene,
      } = args;
      physx.physxWorker.destroyScene(scene);
      return {
        result: null,
        transfers: [],
      };
    }
    case 'addGeometry': {
      const {
        scene,
        mesh: meshSpec,
        physicsId,
      } = args;
      const {
        position: p,
        quaternion: q,
        scale: s,
        positions,
        indices,
      } = meshSpec;

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      const material = fakeMaterial;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.fromArray(p);
      mesh.quaternion.fromArray(q);
      mesh.scale.fromArray(s);
      mesh.updateMatrixWorld();

      physx.physxWorker.addGeometryPhysics(scene, mesh, physicsId);

      const physicsGeometry = physx.physxWorker.getGeometryPhysics(scene, physicsId);
      // console.log('got geometry', physicsGeometry);
      // const physicsGeometry = {
      //   positions: new Float32Array(1024),
      //   indices: new Uint32Array(1024),
      //   bounds: new Float32Array(6),
      // };

      return {
        result: physicsGeometry,
        transfers: [],
      };
    }
    case 'removeGeometry': {
      const {
        scene,
        physicsId,
      } = args;
      try {
        physx.physxWorker.removeGeometryPhysics(scene, physicsId)
      } catch(err) {
        console.warn(err);
      }

      return {
        result: null,
        transfers: [],
      };
    }
    case 'raycastArray': {
      const {
        scene: physics,
        p,
        q,
        n,
      } = args;
      const ps = Array(p.length / 3);
      for (let i = 0; i < ps.length; i++) {
        ps[i] = new THREE.Vector3().fromArray(p, i * 3);
      }
      const qs = Array(q.length / 4);
      for (let i = 0; i < qs.length; i++) {
        qs[i] = new THREE.Quaternion().fromArray(q, i * 4);
      }

      const result = physx.physxWorker.raycastPhysicsArray(physics, ps, qs, n);

      return {
        result,
        transfers: [],
      };
    }
    case 'cookGeometry': {
      const {positions, indices} = args;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      const mesh = new THREE.Mesh(geometry, fakeMaterial);
      const result = physx.physxWorker.cookGeometryPhysics(mesh);
      return {
        result,
        transfers: [result.buffer],
      };
    }
    case 'cookConvexGeometry': {
      const {positions, indices} = args;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      const mesh = new THREE.Mesh(geometry, fakeMaterial);
      const result = physx.physxWorker.cookConvexGeometryPhysics(mesh);
      return {
        result,
        transfers: [result.buffer],
      };
    }
    case 'cookHeightfieldGeometry': {
      const {numRows, numColumns, heights} = args;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      const mesh = new THREE.Mesh(geometry, fakeMaterial);
      const result = physx.physxWorker.cookHeightfieldGeometryPhysics(numRows, numColumns, heights);
      return {
        result,
        transfers: [result.buffer],
      };
    }
    case 'meshoptSimplify': {
      const {positions, /* uvs, */ indices, targetRatio, targetError} = args;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      // geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      const mesh = new THREE.Mesh(geometry, fakeMaterial);
      if (!physx.physxWorker.meshoptSimplify) {
        throw new Error('meshoptSimplify not available');
      }
      const result = physx.physxWorker.meshoptSimplify(mesh, targetRatio, targetError);
      return {
        result,
        transfers: [result.buffer],
      };
    }
    case 'meshoptSimplifySloppy': {
      const {positions, /* uvs, */ indices, targetRatio, targetError} = args;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      // geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      const mesh = new THREE.Mesh(geometry, fakeMaterial);
      if (!physx.physxWorker.meshoptSimplifySloppy) {
        throw new Error('meshoptSimplifySloppy not available');
      }
      const result = physx.physxWorker.meshoptSimplifySloppy(mesh, targetRatio, targetError);
      return {
        result,
        transfers: [result.buffer],
      };
    }

    case 'hitTestGeometry': {
      const {mesh, position, quaternion} = args;
      // const {numRows, numColumns, heights} = args;
      // const geometry = new THREE.BufferGeometry();
      // geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      // geometry.setIndex(new THREE.BufferAttribute(indices, 1));
      // const mesh2 = new THREE.Mesh(geometry, fakeMaterial);
      // const result = physx.physxWorker.cookHeightfieldGeometryPhysics(numRows, numColumns, heights);

      const scene = physx.physxWorker.makeScene();
      scene.addGeometry(mesh);
      // return {
      //   result,
      //   transfers: [result.buffer],
      // };
    }
    default: {
      throw new Error(`unknown method: ${method}`);
    }
  }
};
const _handleMessage = async e => {
  if (loaded && !running) {
    const {
      data,
      port,
    } = e;
    
    {
      running = true;

      const {requestId} = data;
      const p = makePromise();
      try {
        const spec = await _handleMethod(data);
        p.resolve(spec);
      } catch (err) {
        p.reject(err);
      }

      if (requestId) {
        p.then(spec => {
          const {result = null, transfers = []} = spec ?? {};
          port.postMessage({
            method: 'response',
            requestId,
            result,
          }, transfers);
        }, err => {
          port.postMessage({
            requestId,
            error: err.message,
          });
        });
      }

      running = false;
    }
    // next
    if (queue.length > 0) {
      _handleMessage(queue.shift());
    }
  } else {
    queue.push(e);
  }
};
if (typeof self !== 'undefined') {
  self.onmessage = e => {
    if (loaded) {
      _handleMessage({
        data: e.data,
        port: self,
      });
    } else {
      queue.push(e);
    }
  };
}

if (typeof self !== 'undefined') {
  (async () => {
    await physx.waitForLoad();

    loaded = true;
    if (queue.length > 0) {
      _handleMessage(queue.shift());
    }
  })();
}