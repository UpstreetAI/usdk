import {
  Mutex,
} from '../lock-manager.js';

import {zbencode, zbdecode} from '../../zjs/encoding.mjs';

//

export class FileDatabaseSchema {
  constructor({
    schemaName,
    dataDirectoryName,
    fsWorker,
  }) {
    this.schemaName = schemaName;
    this.dataDirectoryName = dataDirectoryName;
    this.fsWorker = fsWorker;
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

  // async getSize() {
  //   return await this.fsWorker.getDirectorySize([this.dataDirectoryName, this.schemaName]);
  // }

  async getFile(id) {
    const arrayBuffer = await this.fsWorker.readFile([this.dataDirectoryName, this.schemaName, id]);
    const uint8Array = new Uint8Array(arrayBuffer);
    const value = zbdecode(uint8Array);
    return value;
  }

  async setFile(id, value) {
    return await this.#lock(id, async () => {
      const value2 = zbencode(value);
      await this.fsWorker.writeFile([this.dataDirectoryName, this.schemaName, id], value2);
    });
  }
  async deleteFile(id) {
    return await this.#lock(id, async () => {
      // remove the file from the directory
      await this.fsWorker.deleteFile([this.dataDirectoryName, this.schemaName, id]);
    });
  }

  async readAll() {
    const files = await this.fsWorker.readAllFiles([this.dataDirectoryName, this.schemaName]);
    return files.map(arrayBuffer => zbdecode(new Uint8Array(arrayBuffer)));
  }

  // async clear() {
  //   // remove all contents of the directory
  //   await this.fsWorker.clearDirectory([this.dataDirectoryName, this.schemaName]);
  // }
}

//

export class FileDatabaseClient extends EventTarget {
  constructor({
    dataDirectoryName,
    fsWorker // = new RequestableFsWorker(),
  }) {
    super();

    if (!dataDirectoryName || !fsWorker) {
      throw new Error('missing arguments');
    }

    // members
    this.dataDirectoryName = dataDirectoryName;
    this.fsWorker = fsWorker;

    // locals
    this.schemas = new Map();
  }

  getSchema(schemaName) {
    return this.schemas.get(schemaName);
  }
  async createSchema(schemaName) {
    const oldSchema = this.schemas.get(schemaName);
    if (!oldSchema) {
      const newSchema = new FileDatabaseSchema({
        schemaName,
        dataDirectoryName: this.dataDirectoryName,
        fsWorker: this.fsWorker,
      });
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
  /* async deleteSchema(schemaName) {
    const oldSchema = this.schemas.get(schemaName);
    oldSchema.destroy();
    this.schemas.delete(schemaName);

    this.dispatchEvent(new MessageEvent('schemasupdate'));

    await this.fsWorker.deleteFile([this.dataDirectoryName, schemaName]);
  } */
}