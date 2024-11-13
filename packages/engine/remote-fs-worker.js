// import { makeId } from './util.js';

//

export class RemoteFsWorker {
  constructor({
    endpointUrl,
  }) {
    if (!endpointUrl) {
      throw new Error('no endpoint url');
    }

    this.endpointUrl = endpointUrl;
  }

  #getKeyPathUrl(keyPath) {
    return this.endpointUrl + keyPath.join('/');
  }

  async readFile(keyPath) {
    const url = this.#getKeyPathUrl(keyPath);
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    return arrayBuffer;
  }
  async writeFile(keyPath, value) {
    const url = this.#getKeyPathUrl(keyPath);
    const res = await fetch(url, {
      method: 'POST',
      body: value,
    });
    await res.blob();
  }
  async deleteFile(keyPath) {
    const url = this.#getKeyPathUrl(keyPath);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Force': 'true',
      },
    });
    await res.blob();
  }

  async readDirectory(keyPath) {
    let url = this.#getKeyPathUrl(keyPath);
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    const json = await res.json();
    return json;
  }
  async readAllFiles(keyPath) {
    const fileNames = await this.readDirectory(keyPath);
    const files = await Promise.all(fileNames.map(async fileName => {
      const arrayBuffer = await this.readFile(keyPath.concat([fileName]));
      return arrayBuffer;
    }));
    return files;
  }
  async clearDirectory(keyPath) {
    const fileNames = await this.readDirectory(keyPath);
    await Promise.all(fileNames.map(async fileName => {
      await this.deleteFile(keyPath.concat([fileName]));
    }));
  }

  async getFileSize(keyPath) {
    let url = this.#getKeyPathUrl(keyPath);
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/fileSize',
      },
    });
    const json = await res.json();
    return json;
  }
  async getDirectorySize(keyPath) {
    let url = this.#getKeyPathUrl(keyPath);
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/directorySize',
      },
    });
    const json = await res.json();
    return json;
  }
}