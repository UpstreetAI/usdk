import FsWorker from './fs-worker.js?worker';
import {makeId} from './util.js';

//

export class RequestableFsWorker {
  constructor() {
    this.ids = new Map();
    this.internalWorker = new FsWorker();

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

  readFile(keyPath) {
    return this.request('readFile', {
      // directoryName,
      // fileName,
      keyPath,
    });
  }
  writeFile(keyPath, value) {
    // console.log('request write file', {
    //   keyPath,
    //   value,
    // }, new Error().stack);
    return this.request('writeFile', {
      // directoryName,
      // fileName,
      keyPath,
      value,
    });
  }
  deleteFile(keyPath) {
    return this.request('deleteFile', {
      // directoryName,
      // fileName,
      keyPath,
    });
  }

  readDirectory(keyPath) {
    return this.request('readDirectory', {
      // directoryName,
      keyPath,
    });
  }
  readAllFiles(keyPath) {
    return this.request('readAllFiles', {
      // directoryName,
      keyPath,
    });
  }
  clearDirectory(keyPath) {
    return this.request('clearDirectory', {
      // directoryName,
      keyPath,
    });
  }

  getFileSize(keyPath) {
    return this.request('getFileSize', {
      keyPath,
    });
  }
  getDirectorySize(keyPath) {
    return this.request('getDirectorySize', {
      keyPath,
    });
  }

  #listen() {
    // listen for responses from the HnswWorker port (it is a Worker)
    this.internalWorker.addEventListener('message', e => {
      const {method} = e.data;
      if (method === 'response') {
        const {id, err, result} = e.data;
        const fn = this.ids.get(id);
        // console.log('response', id, err, result);
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