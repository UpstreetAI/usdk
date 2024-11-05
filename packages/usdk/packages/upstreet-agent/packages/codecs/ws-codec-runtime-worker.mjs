export class WsOpusCodec {
  constructor() {
    this.worker = new Worker(new URL(`./ws-opus-codec-worker.js`, import.meta.url), {
      type: 'module',
    });
  }
  postMessage(data) {
    this.worker.postMessage(data);
  }
  addEventListener(event, listener) {
    this.worker.addEventListener(event, listener);
  }
  removeEventListener(event, listener) {
    this.worker.removeEventListener(event, listener);
  }
  terminate() {
    this.worker.terminate();
  }
}
export class WsMp3Encoder {
  constructor() {
    this.worker = new Worker(new URL(`./ws-mp3-encoder-worker.mjs`, import.meta.url), {
      type: 'module',
    });
  }
  postMessage(data) {
    this.worker.postMessage(data);
  }
  addEventListener(event, listener) {
    this.worker.addEventListener(event, listener);
  }
  removeEventListener(event, listener) {
    this.worker.removeEventListener(event, listener);
  }
  terminate() {
    this.worker.terminate();
  }
}

export class WsMp3Decoder {
  constructor() {
    this.worker = new Worker(new URL(`./ws-mp3-decoder-worker.mjs`, import.meta.url), {
      type: 'module',
    });
  }
  postMessage(data) {
    this.worker.postMessage(data);
  }
  addEventListener(event, listener) {
    this.worker.addEventListener(event, listener);
  }
  removeEventListener(event, listener) {
    this.worker.removeEventListener(event, listener);
  }
  terminate() {
    this.worker.terminate();
  }
}