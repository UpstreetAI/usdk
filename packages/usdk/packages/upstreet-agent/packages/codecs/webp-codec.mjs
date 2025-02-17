import * as u8 from 'u8-encoder';

export class WebPEncoder {
  constructor() {
    this.worker = new Worker(new URL('./webp-worker.mjs', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = e => {
      const promise = this.promises.shift();
      if (promise) {
        const b = e.data;
        const o = u8.decode(b);
        const {
          error,
          result,
        } = o;
        if (!error) {
          promise.resolve(result);
        } else {
          promise.reject(result);
        }
      } else {
        console.warn('WebPEncoder unexpected message', e.data);
      }
    };
    this.worker.onerror = err => {
      console.warn('WebPEncoder error', err);
    };

    this.promises = [];
  }
  async encode(imageData, {
    quality = 75,
    lossless = false,
  } = {}) {
    const b = u8.encode({
      method: 'encode',
      args: {
        imageData,
        opts: {
          quality,
          lossless: +lossless, // int is expected in the backend
        },
      },
    });
    this.worker.postMessage(b, [b.buffer]);

    const {
      promise,
      resolve,
      reject,
    } = Promise.withResolvers();
    this.promises.push({
      resolve,
    });

    return await promise;
  }
  async decode(encodedData) {
    const b = u8.encode({
      method: 'decode',
      args: {
        encodedData,
      },
    });
    this.worker.postMessage(b, [b.buffer]);

    const {
      promise,
      resolve,
      reject,
    } = Promise.withResolvers();
    this.promises.push({
      resolve,
    });

    return await promise;
  }
  close() {
    this.worker.terminate();
  }
}
