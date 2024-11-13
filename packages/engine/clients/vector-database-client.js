import {
  embeddingDimensions,
  maxVectorDatabaseElements,
} from '../constants/companion-constants.js';
import {
  Mutex,
} from '../lock-manager.js';
import {
  AiClient,
} from './ai-client.js';
import {
  QueueManager,
} from '../managers/queue/queue-manager.js';

import hnswWorkerManager from '../managers/hnsw/hnsw-worker-manager.js';
import {zbencode, zbdecode} from '../../zjs/encoding.mjs';
import {RequestableFsWorker} from '../requestable-fs-worker.js';

import {
  makeId,
} from '../util.js';

//

class PopSet extends Set {
  constructor() {
    super();
  }
  pop() {
    const {
      done,
      value,
    } = this.values().next();
    if (!done) {
      this.delete(value);
      return value;
    }
  }
}

//

const computeUsedFreeLists = (a, lengther = a => a.length, getter = (a, i) => a[i], stride = 1) => {
  const used = new PopSet();
  const free = new PopSet();
  
  const l = lengther(a);
  for (let i = 0; i < l; i += stride) {
    const v = getter(a, i);
    if (v) {
      used.add(i);
    } else {
      free.add(i);
    }
  }

  return {
    used,
    free,
  };
};

//

const FileMasks = {
  VALID: 1 << 0,
  HAS_FILE: 1 << 1,
};
const saveInterval = 5 * 1000;

//

export class VectorDatabaseItem {
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }
}

//

export class VectorDatabaseSchema {
  constructor({
    dataDirectoryName,
    schemaName,
    aiClient,
    fsWorker,
  }) {
    this.dataDirectoryName = dataDirectoryName;
    this.schemaName = schemaName;
    this.aiClient = aiClient;
    this.fsWorker = fsWorker;

    this.timeout = null;
    this.queued = false;
    this.saveQueueManager = new QueueManager();

    this.#resetHnswWorker();
    this.#resetCache();

    this.loadPromise = null;
  }

  waitForLoad() {
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        const arrayBuffer = await this.fsWorker.readFile([this.dataDirectoryName, this.schemaName, 'index.bin']);
        if (arrayBuffer.byteLength > 0) {
          const uint8Array = new Uint8Array(arrayBuffer);

          const spec = zbdecode(uint8Array);
          const {
            pointRegistryData,
            hnswIndexData,
          } = spec;
          this.pointRegistry = pointRegistryData;
          this.pointRegistryFreeList = this.#getPointRegistryFreeList();

          this.#ensureHnswWorker();
          await this.hnswWorker.load(hnswIndexData);
        } else {
          // console.log('vector database no file', arrayBuffer, [this.dataDirectoryName, this.schemaName, 'index.bin']);
        }
      })();
    }
    return this.loadPromise;
  }

  #resetHnswWorker() {
    if (this.hnswWorker) {
      this.hnswWorker.terminate();
    }
    this.hnswWorker = null;
  }
  #getPointRegistryFreeList() {
    return computeUsedFreeLists(this.pointRegistry, undefined, (a, i) => {
      const mask = a[i];
      return !!(mask & FileMasks.VALID);
    }, 1);
  }
  #resetCache() {
    // mask, fileSize, fileIndex
    this.pointRegistry = new Uint32Array(maxVectorDatabaseElements);
    this.pointRegistryFreeList = this.#getPointRegistryFreeList();
  }

  #ensureHnswWorker() {
    if (!this.hnswWorker) {
      this.hnswWorker = hnswWorkerManager.createWorker();
    }
  }

  #mutexes = new Map();
  async #lock(id, fn) {
    let mutex = this.#mutexes.get(id);
    if (!mutex) {
      mutex = new Mutex();
      mutex.addEventListener('releasedall', () => {
        this.#mutexes.delete(id);
      });
      this.#mutexes.set(id, mutex);
    }
    await mutex.acquire();

    let result;
    try {
      result = await fn();
    } finally {
      mutex.release();
    }
    return result;
  }

  getSize() {
    return this.pointRegistryFreeList.used.size;
  }

  #getBlockFileName(id) {
    return `${id}.block`;
  }
  async getItem(id) {
    const index = id;
    const mask = this.pointRegistry[index];

    const used = !!(mask & FileMasks.VALID);
    if (used) {
      const hasFile = !!(mask & FileMasks.HAS_FILE);
      if (hasFile) {
        const arrayBuffer = await this.fsWorker.readFile([this.dataDirectoryName, this.schemaName, this.#getBlockFileName(id)]);
        const uint8Array = new Uint8Array(arrayBuffer);
        const blockFileData = zbdecode(uint8Array);

        return new VectorDatabaseItem(id, blockFileData);
      } else {
        return new VectorDatabaseItem(id, null);
      }
    } else {
      return null;
    }
  }
  async getItems(ids) {
    const promises = Array(ids.length);
    for (let i = 0; i < ids.length; i++) {
      promises[i] = this.getItem(ids[i]);
    }
    return await Promise.all(promises);
  }
  async findItems(queryString, opts) {
    const vector = await this.aiClient.embed(queryString);
    return await this.findItemsWithVector(vector, opts);
  }
  async findItemsWithVector(vector, opts) {
    this.#ensureHnswWorker();

    const k = opts?.limit ?? 10;
    const searchResults = await this.hnswWorker.search(vector, k);
    const [
      labels,
      distances,
    ] = searchResults;

    const promises = [];
    for (let i = 0; i < labels.length; i++) {
      const p = (async () => {
        const label = labels[i];
        const distance = distances[i];

        const item = await this.getItem(label);
        if (item) {
          return [
            item,
            distance,
          ];
        } else {
          console.warn('search result label not found in point registry', label);
          debugger;
          return null;
        }
      })();
      promises.push(p);
    }

    return await Promise.all(promises);
  }
  async listItems(opts = {}) {
    // optimized with a precomputed + cached [usedList, freeList]
    const promises = [];
    const ids = Array.from(this.pointRegistryFreeList.used);
    for (let i = 0; i < ids.length && (opts.limit === undefined || promises.length < opts.limit); i++) {
      const id = ids[i];
      const p = this.getItem(id);
      promises.push(p);
    }
    const items = await Promise.all(promises);
    return items;
  }

  getNextId() {
    return this.pointRegistryFreeList.free.pop();
  }
  unshiftNextId(id) {
    this.pointRegistryFreeList.free.add(id);
  }
  
  async setItem(id, value, embedValue) {
    if (embedValue === undefined) {
      if (typeof value === 'string') {
        embedValue = value;
      } else {
        throw new Error('no embed value');
      }
    }

    const vector = await this.aiClient.embed(embedValue);
    return await this.setItemVector(id, value, vector);
  }

  async setItemVector(id, value, vector) {
    this.#ensureHnswWorker();

    return await this.#lock(id, async () => {
      const mask = this.pointRegistry[id];
      // const used = !!(mask & FileMasks.VALID);
      const hasOldFile = !!(mask & FileMasks.HAS_FILE);

      // pop a new file index from the blockRegistryFreeList
      const hasNewFile = value !== undefined;

      // write the file
      if (hasNewFile) {
        const uint8Array = zbencode(value);

        await this.fsWorker.writeFile([this.dataDirectoryName, this.schemaName, this.#getBlockFileName(id)], uint8Array);
      } else if (hasOldFile) {
        await this.fsWorker.deleteFile([this.dataDirectoryName, this.schemaName, this.#getBlockFileName(id)]);
      }

      // set the file flag
      if (hasNewFile) {
        this.pointRegistry[id] |= FileMasks.HAS_FILE;
      } else {
        this.pointRegistry[id] &= ~FileMasks.HAS_FILE;
      }

      // set the valid flag
      this.pointRegistry[id] |= FileMasks.VALID;
      // add to the used list (overwrite if it was already there)
      this.pointRegistryFreeList.used.add(id);

      // set the vector in the hnsw index
      await this.hnswWorker.addPoint(vector, id);
      
      // trigger a save
      this.triggerSave();

      // return id;
      return new VectorDatabaseItem(id, value);
    });
  }
  async deleteItem(id) {
    this.#ensureHnswWorker();

    return await this.#lock(id, async () => {
      const mask = this.pointRegistry[id];
      const used = !!(mask & FileMasks.VALID);
      if (used) {
        // remove file
        const hasFile = !!(mask & FileMasks.HAS_FILE);
        if (hasFile) {
          await this.fsWorker.deleteFile([this.dataDirectoryName, this.schemaName, this.#getBlockFileName(id)]);

          // unset HAS_FILE in the mask
          this.pointRegistry[id] &= ~FileMasks.HAS_FILE;
        }
      } else {
        throw new Error('item not found: ' + id);
      }

      // unset USED in the mask
      this.pointRegistry[id] &= ~FileMasks.VALID;
      // remove from the used list
      this.pointRegistryFreeList.used.delete(id);
      // put back on the free list
      this.pointRegistryFreeList.free.add(id);
    
      // remove from the hnsw index
      await this.hnswWorker.removePoint(id);

      // trigger a save
      this.triggerSave();
    });
  }

  triggerSave() {
    if (!this.timeout) {
      this.timeout = setTimeout(async () => {
        await this.save();

        this.timeout = null;

        if (this.queued) {
          this.queued = false;
          this.triggerSave();
        }
      }, saveInterval);
    } else {
      this.queued = true;
    }
  }
  async save() {
    await this.saveQueueManager.waitForTurn(async () => {
      const pointRegistryData = this.pointRegistry;
      const hnswIndexData = await this.hnswWorker.save();
      const fileData = zbencode({
        pointRegistryData,
        hnswIndexData,
      });

      await this.fsWorker.writeFile([this.dataDirectoryName, this.schemaName, 'index.bin'], fileData);
    });
  }

  async clear() {
    this.#resetHnswWorker();
    this.#resetCache();

    await this.fsWorker.clearDirectory([this.dataDirectoryName, this.schemaName]);
  }
  async remove() {
    // const fs = await navigator.storage.getDirectory();
    // await fs.removeEntry(this.dataDirectoryName, {
    //   recursive: true,
    // });
    await this.fsWorker.deleteFile([this.dataDirectoryName, this.schemaName]);
  }

  destroy() {
    this.#resetHnswWorker();

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

//

export class VectorDatabaseClient extends EventTarget {
  constructor({
    aiClient,
    dataDirectoryName,
    fsWorker = new RequestableFsWorker(),
  }) {
    super();

    if (!aiClient || !dataDirectoryName) {
      throw new Error('missing arguments');
    }

    // members
    this.aiClient = aiClient;
    this.dataDirectoryName = dataDirectoryName;
    this.fsWorker = fsWorker;

    // locals
    this.schemas = new Map();

    // initialization
    this.loadPromise = null;
  }

  waitForLoad() {
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        const directoryNames = await this.fsWorker.readDirectory([this.dataDirectoryName]);
        const promises = directoryNames.map(async schemaName => {
          const schema = new VectorDatabaseSchema({
            dataDirectoryName: this.dataDirectoryName,
            schemaName,
            aiClient: this.aiClient,
            fsWorker: this.fsWorker,
          });
          await schema.waitForLoad();
          this.schemas.set(schemaName, schema);
        });

        await Promise.all(promises);

        this.dispatchEvent(new MessageEvent('schemasupdate'));
      })();
    }
    return this.loadPromise;
  }

  getSchema(schemaName) {
    return this.schemas.get(schemaName);
  }
  async createSchema(schemaName) {
    const oldSchema = this.schemas.get(schemaName);
    if (!oldSchema) {
      const newSchema = new VectorDatabaseSchema({
        dataDirectoryName: this.dataDirectoryName,
        schemaName,
        aiClient: this.aiClient,
        fsWorker: this.fsWorker,
      });
      await newSchema.waitForLoad();
      this.schemas.set(schemaName, newSchema);

      this.dispatchEvent(new MessageEvent('schemasupdate'));

      return newSchema;
    } else {
      throw new Error('schema already exists: ' + schemaName);
    }
  }
  async ensureSchema(schemaName) {
    let schema = this.schemas.get(schemaName);
    if (!schema) {
      schema = await this.createSchema(schemaName);
    }
    return schema;
  }
  async deleteSchema(schemaName) {
    const oldSchema = this.schemas.get(schemaName);
    oldSchema.destroy();
    this.schemas.delete(schemaName);

    this.dispatchEvent(new MessageEvent('schemasupdate'));

    await this.fsWorker.deleteFile([this.dataDirectoryName, schemaName]);
  }
  /* forgetSchema(schemaName) {
    const oldSchema = this.schemas.get(schemaName);
    if (oldSchema) {
      oldSchema.destroy();
      this.schemas.delete(schemaName);
    } else {
      throw new Error('schema not found: ' + schemaName);
    }
  } */
  async clear() {
    await this.fsWorker.clearDirectory([this.dataDirectoryName]);
  }
}
globalThis.testVectorDatabase = async () => {
  function arrayEquals(a, b) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }

  const aiClient = new AiClient();

  const tests = [
    // basic add
    async () => {
      const dataDirectoryName = makeId(8);
      const vectorDatabaseClient = new VectorDatabaseClient({
        aiClient,
        dataDirectoryName,
      });
      const schema = await vectorDatabaseClient.ensureSchema('test');
      
      {
        const size = await schema.getSize();
        console.log('size 1', size);
        console.assert(size === 0);
      }

      const id = schema.getNextId();
      const value = makeId(8);
      // const queryString = 'test';
      // const vector = await schema.aiClient.embed(queryString);
      const vector = new Float32Array(embeddingDimensions).fill(1);
      const item = await schema.setItemVector(id, value, vector);
      console.log('got item', item);

      {
        const size = await schema.getSize();
        console.log('size 2', size);
        console.assert(size === 1);
      }

      const items = await schema.listItems();
      console.log('got items', items);
      console.assert(items.length === 1);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.assert(item instanceof VectorDatabaseItem);
        console.assert(item.data === value);
      }

      const vector2 = vector.slice();
      vector2[0] = 0;
      // const foundItems = await schema.findItems(queryString + ' ' + 'garbage');
      const foundItems = await schema.findItemsWithVector(vector2);
      console.log('got found items', foundItems);
      console.assert(foundItems.length === 1);
      for (let i = 0; i < foundItems.length; i++) {
        console.assert(foundItems[i][0] instanceof VectorDatabaseItem);
        console.assert(typeof foundItems[i][1] === 'number');
      }

      schema.destroy();
      await schema.remove();
    },
    // multiple add
    async () => {
      const dataDirectoryName = makeId(8);
      const vectorDatabaseClient = new VectorDatabaseClient({
        aiClient,
        dataDirectoryName,
      });
      const schema = await vectorDatabaseClient.ensureSchema('test');

      const vector = new Float32Array(embeddingDimensions).fill(1);
      const vector2 = vector.slice();
      vector2[0] = 0;
      const vector3 = vector.slice();
      vector3[0] = 0.5;
      const vector4 = vector.slice();
      vector4[0] = 0.25;

      {
        const size = await schema.getSize();
        console.log('size 1', size);
        console.assert(size === 0);
      }

      const value = 42;
      const vectors = [
        vector,
        vector2,
        vector3,
      ];
      const promises = vectors.map((vector, i) => {
        return schema.setItemVector(i, value, vector);
      });
      await Promise.all(promises);

      {
        const size = await schema.getSize();
        console.log('size 2', size);
        console.assert(size === vectors.length);
      }

      const items = await schema.listItems();
      console.log('got items', items);
      console.assert(items.length === vectors.length);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.assert(item instanceof VectorDatabaseItem);
        console.assert(item.data === value);
      }

      // const foundItems = await schema.findItems(queryString + ' ' + 'garbage');
      const foundItems = await schema.findItemsWithVector(vector4);
      console.log('got found items', foundItems);
      console.assert(foundItems.length === vectors.length);
      for (let i = 0; i < foundItems.length; i++) {
        console.assert(foundItems[i][0] instanceof VectorDatabaseItem);
        console.assert(typeof foundItems[i][1] === 'number');
      }

      schema.destroy();
      await schema.remove();
    },
    // add/remove
    async () => {
      const dataDirectoryName = makeId(8);
      const vectorDatabaseClient = new VectorDatabaseClient({
        aiClient,
        dataDirectoryName,
      });
      const schema = await vectorDatabaseClient.ensureSchema('test');

      const vector = new Float32Array(embeddingDimensions);
      const value = new Float64Array(256).fill(42);

      {
        const size = await schema.getSize();
        console.log('size 1', size);
        console.assert(size === 0);
      }

      // add all points
      const numItems = 200;
      // const numItems = 2000;
      const numHalfItems = numItems / 2;
      {
        const promises = [];
        for (let i = 0; i < numItems; i++) {
          const N = 10;
          let n = i % N;
          n /= N;
          vector.fill(n);

          const p = schema.setItemVector(i, value, vector);
          promises.push(p);
        }
        await Promise.all(promises);
      }

      {
        const size = await schema.getSize();
        console.log('size 2', size);
        console.assert(size === numItems);
      }

      // remove first half of points
      {
        const promises = [];
        for (let i = 0; i < numHalfItems; i++) {
          const p = schema.deleteItem(i);
          promises.push(p);
        }
        await Promise.all(promises);
      }

      {
        const size = await schema.getSize();
        console.log('size 3', size);
        console.assert(size === numHalfItems);
      }

      const items = await schema.listItems();
      console.log('got items', items);
      console.assert(items.length === numHalfItems);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.assert(item instanceof VectorDatabaseItem);
        console.assert(arrayEquals(item.data, value));
      }

      schema.destroy();
      await schema.remove();
    },
    // save/load
    async () => {
      const dataDirectoryName = makeId(8);
      const vectorDatabaseClient = new VectorDatabaseClient({
        aiClient,
        dataDirectoryName,
      });
      let schema = await vectorDatabaseClient.ensureSchema('test');

      const vector = new Float32Array(embeddingDimensions);
      const value = new Uint8Array(256).fill(0x80);

      // add all points
      const numItems = 100;
      {
        const promises = [];
        for (let i = 0; i < numItems; i++) {
          const N = 10;
          let n = i % N;
          n /= N;
          vector.fill(n);

          const p = schema.setItemVector(i, value, vector);
          promises.push(p);
        }
        await Promise.all(promises);
      }

      // save schema
      await schema.save();

      // re-load schema
      vectorDatabaseClient.forgetSchema('test');
      schema = await vectorDatabaseClient.ensureSchema('test');

      {
        const size = await schema.getSize();
        console.log('size 1', size);
        console.assert(size === numItems);
      }

      const items = await schema.listItems();
      console.log('got items', items);
      console.assert(items.length === numItems);
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.assert(item instanceof VectorDatabaseItem);
        console.assert(arrayEquals(item.data, value));
      }

      const vector2 = new Float32Array(embeddingDimensions).fill(0.5);
      // const foundItems = await schema.findItems(queryString + ' ' + 'garbage');
      const foundItems = await schema.findItemsWithVector(vector2);
      console.log('got found items', foundItems);
      console.assert(foundItems.length > 0);
      for (let i = 0; i < foundItems.length; i++) {
        console.assert(foundItems[i][0] instanceof VectorDatabaseItem);
        console.assert(typeof foundItems[i][1] === 'number');
      }

      schema.destroy();
      await schema.remove();
    },
  ];
  for (let i = 0; i < tests.length; i++) {
    console.log(`---test #${i} start---`);
    const test = tests[i];
    await test();
    console.log(`---test #${i} end---`);
  }
  console.log('all tests finished');
};