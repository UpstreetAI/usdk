/*
hnsw wasm worker manager
*/

import HnswWorker from './hnsw-worker.js?worker';
import {
  makeId,
} from '../../util.js';

//

class RequestableHnswWorker {
  constructor() {
    this.ids = new Map();
    this.internalWorker = new HnswWorker();

    this.#listen();
  }

  request(method, args) {
    const id = makeId(8);
    const result = new Promise((accept, reject) => {
      const cleanup = () => {
        this.ids.delete(id);
      };
      const fn = (err, result) => {
        if (!err) {
          accept(result);
          cleanup();
        } else {
          reject(err);
          cleanup();
        }
      };
      this.ids.set(id, fn);
    });
    // post the message on the HnswWorker port (it is a Worker)
    this.internalWorker.postMessage({
      id,
      method,
      args,
    });
    return result;
  }

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

  async addPoint(vector, index) {
    return this.request('addPoint', {
      // hnswPtr,
      vector,
      index,
    });
  }
  async removePoint(index) {
    return this.request('removePoint', {
      // hnswPtr,
      index,
    });
  }
  async search(vector, k) {
    return this.request('search', {
      // hnswPtr,
      vector,
      k,
    });
  }
  async save() {
    return this.request('save', {
      // hnswPtr,
    });
  }
  async load(uint8Array) {
    return this.request('load', {
      uint8Array,
    });
  }

  #listen() {
    // listen for responses from the HnswWorker port (it is a Worker)
    this.internalWorker.addEventListener('message', e => {
      const {method} = e.data;
      if (method === 'response') {
        const {id, err, result} = e.data;
        const fn = this.ids.get(id);
        if (fn) {
          fn(err, result);
        } else {
          console.warn('hnsw worker handle got unknown response callback id', id);
        }
      }
    });
  }

  terminate() {
    this.internalWorker.terminate();
  }
}

//

class HnswWorkerManager {
  constructor() {
    // nothing
  }
  createWorker() {
    const w = new RequestableHnswWorker();
    return w;
  }
}
const hnswManager = new HnswWorkerManager();
export default hnswManager;