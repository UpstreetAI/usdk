/*
hnsw wasm worker
*/

import hnsw from './hnsw-manager.js';
import {
  embeddingDimensions,
  maxVectorDatabaseElements,  
} from '../../constants/companion-constants.js';

//

let spacePtr = 0;
let hnswPtr = 0;
const loadPromise = (async () => {
  await hnsw.waitForLoad();

  spacePtr = hnsw.hnswWorker.createSpace(embeddingDimensions);
  hnswPtr = hnsw.hnswWorker.createHnsw(spacePtr, maxVectorDatabaseElements);
})();

// as a worker, register message handler
self.onmessage = async (e) => {
  const {
    method,
    args,
    id,
  } = e.data;

  await loadPromise;

  const respond = (error, result) => {
    self.postMessage({
      method: 'response',
      id,
      error,
      result,
    });
  };

  // async createSpace(dim) {
  //   return this.request('createSpace', {
  //     dim,
  //   });
  // }
  // async destroySpace(spacePtr) {
  //   return this.request('destroySpace', {
  //     spacePtr,
  //   });
  // }
  // async createHnsw(spacePtr, max_elements, M, ef_construction) {
  //   return this.request('createHnsw', {
  //     spacePtr,
  //     max_elements,
  //     M,
  //     ef_construction,
  //   });
  // }
  // async destroyHnsw(hnswPtr) {
  //   return this.request('destroyHnsw', {
  //     hnswPtr,
  //   });
  // }
  // async addPoint(hnswPtr, vector, index) {
  //   return this.request('addPoint', {
  //     hnswPtr,
  //     vector,
  //     index,
  //   });
  // }
  // async removePoint(hnswPtr, index) {
  //   return this.request('removePoint', {
  //     hnswPtr,
  //     index,
  //   });
  // }
  // async search(hnswPtr, vector, k) {
  //   return this.request('search', {
  //     hnswPtr,
  //     vector,
  //     k,
  //   });
  // }
  // async save(hnswPtr) {
  //   return this.request('save', {
  //     hnswPtr,
  //   });
  // }

  try {
    const result = (() => {
      switch (method) {
        // case 'createSpace': {
        //   const {dim} = args;
        //   return hnsw.hnswWorker.createSpace(dim);
        // }
        // case 'destroySpace': {
        //   const {spacePtr} = args;
        //   return hnsw.hnswWorker.destroySpace(spacePtr);
        // }
        // case 'createHnsw': {
        //   const {spacePtr, max_elements, M, ef_construction} = args;
        //   return hnsw.hnswWorker.createHnsw(spacePtr, max_elements, M, ef_construction);
        // }
        // case 'destroyHnsw': {
        //   const {hnswPtr} = args;
        //   return hnsw.hnswWorker.destroyHnsw(hnswPtr);
        // }
        case 'addPoint': {
          const {/*hnswPtr, */vector, index} = args;
          return hnsw.hnswWorker.addPoint(hnswPtr, vector, index);
        }
        case 'removePoint': {
          const {/*hnswPtr, */index} = args;
          return hnsw.hnswWorker.removePoint(hnswPtr, index);
        }
        case 'search': {
          const {/*hnswPtr, */vector, k} = args;
          return hnsw.hnswWorker.search(hnswPtr, vector, k);
        }
        case 'save': {
          // const {hnswPtr} = args;
          const saveResult = hnsw.hnswWorker.save(hnswPtr);
          // console.log('got save result', saveResult);
          return saveResult;
        }
        case 'load': {
          const {/*hnswPtr, */uint8Array} = args;
          // console.log('got load input', uint8Array);
          return hnsw.hnswWorker.load(hnswPtr, spacePtr, uint8Array);
        }
      }
    })();
    respond(null, result);
  } catch (err) {
    respond(err);
  }
};