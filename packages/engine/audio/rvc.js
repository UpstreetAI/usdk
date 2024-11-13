import * as ort from 'onnxruntime-web';
// import * as ort from '../../onnxruntime-web/';
// import ort from '../../onnxruntime-web/';
ort.env.wasm.proxy = true;
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = `${location.protocol}//${location.host}/rvc/`;

import { QueueManager } from '../managers/queue/queue-manager.js';

const log = console.log;
// const log = () => {};

const kModel = '/rvc/llvc_onnx.onnx';

// wrapper around onnxruntime and model
class Model {
  constructor(url, cb) {
    ort.env.logLevel = "error";
    this.sess = null;

    // semi constants that we initialize once and pass to every run() call
    this.min_length = Int32Array.from({ length: 1 }, () => 1);
    this.max_length = Int32Array.from({ length: 1 }, () => 448);
    this.num_return_sequences = Int32Array.from({ length: 1 }, () => 1);
    this.length_penalty = Float32Array.from({ length: 1 }, () => 1.);
    this.repetition_penalty = Float32Array.from({ length: 1 }, () => 1.);
    this.attention_mask = Int32Array.from({ length: 1 * 80 * 3000 }, () => 0);

    const opt = {
      executionProviders: ["wasm"],
      // executionProviders: ["webgl"],
      logSeverityLevel: 3,
      logVerbosityLevel: 3,
    };
    ort.InferenceSession.create(url, opt).then((s) => {
      this.sess = s;
      cb();
    }, (e) => { cb(e); })
  }

  run(audio_pcm, beams = 1) {
    // console.log('audio_pcm', audio_pcm);
    // console.log('Inference Started');
    // clone semi constants into feed. The clone is needed if we run with ort.env.wasm.proxy=true
    const feed = {
      "input": audio_pcm,
      // "max_length": new ort.Tensor(new Int32Array(this.max_length), [1]),
      // "min_length": new ort.Tensor(new Int32Array(this.min_length), [1]),
      // "num_beams": new ort.Tensor(Int32Array.from({ length: 1 }, () => beams), [1]),
      // "num_return_sequences": new ort.Tensor(new Int32Array(this.num_return_sequences), [1]),
      // "length_penalty": new ort.Tensor(new Float32Array(this.length_penalty), [1]),
      // "repetition_penalty": new ort.Tensor(new Float32Array(this.repetition_penalty), [1]),
      // "attention_mask": new ort.Tensor(new Int32Array(this.attention_mask), [1, 80, 3000]),
    }

    const r = this.sess.run(feed);

    // console.log('r', r);

    return r;
  }
  destroy() {
    this.sess.release();
    this.sess = null;
  }
}

/* function floatTo16Bit(inputArray){
  const output = new Int16Array(inputArray.length);
  for (let i = 0; i < inputArray.length; i++){
    const s = Math.max(-1, Math.min(1, inputArray[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}
function int16ToFloat32(inputArray) {
  const output = new Float32Array(inputArray.length);
  for (let i = 0; i < inputArray.length; i++) {
    const int = inputArray[i];
    const float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
    output[i] = float;
  }
  return output;
} */

/* const onmessage = (() => {
  const sessPromise = createModelAsync();

  return async e => {
    if (e.data) {
      await queueManager.waitForTurn(async () => {
        const sess = await sessPromise;
        const ret = await sess.run(new ort.Tensor(xa, [1, 1, xa.length]));
        postMessage(ret.output.data, [ret.output.data.buffer]);
      });
    } else {
      postMessage({
        data: null,
        timestamp: 0, // fake
        duration: 1, // fake
      });

      globalThis.close();
    }
  };
})(); */

const createModelAsync = () => new Promise((accept, reject) => {
  const whisper = new Model(kModel, (e) => {
    if (e === undefined) {
      log(`${kModel} loaded, ${ort.env.wasm.numThreads} threads`);
      accept(whisper);
    } else {
      log(`Error: ${e}`);
      reject(e);
    }
  });
});
export default class Rvc {
  static sampleRate = 16000;
  
  constructor() {
    this.loadPromise = createModelAsync();
    this.queueManager = new QueueManager();
  }
  createStream() {
    let controller;
    const stream = new ReadableStream({
      start(c) {
        controller = c;
      },
    });
    stream.sampleRate = Rvc.sampleRate;

    let queued = 0;
    let finished = false;
    stream.write = async xa => {
      queued++;
      await this.queueManager.waitForTurn(async () => {
        const sess = await this.loadPromise;
        // console.time('process');
        // try {
          const ret = await sess.run(new ort.Tensor(xa, [1, 1, xa.length]));
          const output = ret.output.data;
          controller.enqueue(output);
        // } finally {
        //   console.timeEnd('process');
        // }
      });
      queued--;
      if (queued === 0 && finished) {
        controller.close();
      }
    };
    stream.end = () => {
      finished = true;
      if (queued === 0) {
        controller.close();
      }
    };
    return stream;
  }
  async destroy() {
    const sess = await this.loadPromise;
    sess.destroy();
  }
  // async process(xa) {
  //   return await this.queueManager.waitForTurn(async () => {
  //     const sess = await this.loadPromise;
  //     const ret = await sess.run(new ort.Tensor(xa, [1, 1, xa.length]));
  //     const output = ret.output.data;
  //     return output;
  //   });
  // }
}