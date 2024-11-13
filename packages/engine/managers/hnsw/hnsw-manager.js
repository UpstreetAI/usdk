/*
hnsw wasm integration
*/

// import * as THREE from 'three';
import Module from '../../../../public/hnsw-wasm.js';
import {Allocator, ScratchStack} from '../../geometry-util.js';
// import {heightfieldScale} from './constants.js';

const hnsw = {};

let loadPromise = null;
hnsw.loaded = false;
hnsw.waitForLoad =  () => {
  if (!loadPromise) {
    loadPromise = (async () => {
      try {
        await Module.waitForLoad();
      } catch(err) {
        console.warn('failed to load hnsw wasm', err);
      }

      hnsw.loaded = true;
    })();
  }
  return loadPromise;
};

const hnswWorker = (() => {
  const w = {}
  w.alloc = (constructor, count) => {
    if (count > 0) {
      const size = constructor.BYTES_PER_ELEMENT * count
      const ptr = Module._doMalloc(size)
      return new constructor(Module.HEAP8.buffer, ptr, count)
    } else {
      return new constructor(Module.HEAP8.buffer, 0, 0)
    }
  };
  w.free = (ptr) => {
    Module._doFree(ptr)
  };

  w.createSpace = (
    dim,
  ) => {
    const ptr = Module._createSpace(dim);
    return ptr;
  };
  w.destroySpace = () => {
    Module._destroySpace();
  };

  w.createHnsw = (
    space = null,
    max_elements = 10000,
    M = 16, // same parameters as qdrant
    ef_construction = 100,
  ) => {
    const ptr = Module._createHnsw(space, max_elements, M, ef_construction);
    return ptr;
  };
  w.destroyHnsw = (hnswPtr) => {
    Module._destroyHnsw(hnswPtr);
  };

  w.addPoint = (
    hnswPtr,
    vector,
    index,
  ) => {
    const allocator = new Allocator(Module);

    const vectorPtr = allocator.alloc(Float32Array, vector.length);
    vectorPtr.set(vector);

    // console.time('point ' + index);
    Module._addPoint(hnswPtr, vectorPtr.byteOffset, index);
    // console.timeEnd('point ' + index);

    allocator.freeAll();
  };
  w.removePoint = (
    hnswPtr,
    index,
  ) => {
    Module._removePoint(hnswPtr, index);
  };
  w.search = (
    hnswPtr,
    vector,
    k,
  ) => {
    // EMSCRIPTEN_KEEPALIVE void search(hnswlib::HierarchicalNSW<float> *alg_hnsw, float *vector, int k, hnswlib::labeltype **labels, float **distances, size_t *size) {

    const allocator = new Allocator(Module);

    const vectorPtr = allocator.alloc(Float32Array, vector.length);
    vectorPtr.set(vector);
    const labelsPtrPtr = allocator.alloc(Uint32Array, 1);
    const distancesPtrPtr = allocator.alloc(Uint32Array, 1);
    const sizePtr = allocator.alloc(Uint32Array, 1);

    Module._search(hnswPtr, vectorPtr.byteOffset, k, labelsPtrPtr.byteOffset, distancesPtrPtr.byteOffset, sizePtr.byteOffset);

    const size = sizePtr[0];

    const labelsPtr = labelsPtrPtr[0];
    const labels = new Uint32Array(Module.HEAP8.buffer, labelsPtr, size).slice();

    const distancesPtr = distancesPtrPtr[0];
    const distances = new Float32Array(Module.HEAP8.buffer, distancesPtr, size).slice();

    Module._doFree(labelsPtr);
    Module._doFree(distancesPtr);
    allocator.freeAll();

    return [
      labels,
      distances,
    ];
  };
  w.save = (
    hnswPtr,
  ) => {
    // EMSCRIPTEN_KEEPALIVE void save(hnswlib::HierarchicalNSW<float> *alg_hnsw, unsigned char **data, size_t *size) {

    const allocator = new Allocator(Module);

    const dataPtrPtr = allocator.alloc(Uint32Array, 1);
    const sizePtr = allocator.alloc(Uint32Array, 1);

    Module._save(hnswPtr, dataPtrPtr.byteOffset, sizePtr.byteOffset);

    const size = sizePtr[0];
    const dataPtr = dataPtrPtr[0];
    const data = new Uint8Array(Module.HEAPU8.buffer, Module.HEAPU8.byteOffset + dataPtr, size).slice();

    Module._doFree(dataPtr);
    allocator.freeAll();

    return data;
  };
  w.load = (
    hnswPtr,
    spacePtr,
    uint8Array,
  ) => {
    // EMSCRIPTEN_KEEPALIVE void load(hnswlib::HierarchicalNSW<float> *alg_hnsw, hnswlib::L2Space *space, unsigned char *data, size_t size) {

    const allocator = new Allocator(Module);

    const dataPtr = allocator.alloc(Uint8Array, uint8Array.length);
    dataPtr.set(uint8Array);

    Module._load(hnswPtr, spacePtr, dataPtr.byteOffset, uint8Array.length);

    allocator.freeAll();
  };

  return w;
})()
hnsw.hnswWorker = hnswWorker;

export default hnsw;