// import Encoder from './opus-encdec/dist/libopus-encoder.wasm.js';
// import Decoder from './opus-encdec/dist/libopus-decoder.wasm.js';
// import { OggOpusEncoder } from './opus-encdec/src/oggOpusEncoder.js';
// import { OggOpusDecoder } from './opus-encdec/src/oggOpusDecoder.js';

// import OpusScript from './opusscript/index.js';

import {channelCount, /*sampleRate, */ bitrate, frameSize, voiceOptimization} from '../audio/ws-constants.js';
import { QueueManager } from '../../../../util/queue-manager.mjs';

function floatTo16Bit(inputArray){
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
}

export const makeOpusCodec = (libopus) =>
class WsOpusCodec extends EventTarget {
  constructor() {
    super();
    
    const readyPromise = libopus.waitForReady();
    
    this.handlemessage = e => {
      const {
        mode,
        sampleRate,
      } = e.data;
      switch (mode) {
        case 'encode': {
          const encoderPromise = (async () => {
            await readyPromise;
            const enc = new libopus.Encoder(channelCount, sampleRate, bitrate, frameSize, voiceOptimization);
            return enc;
          })();
          const queueManager = new QueueManager();
    
          this.handlemessage = async e => {
            await queueManager.waitForTurn(async () => {
              const enc = await encoderPromise;
    
              if (e.data) {
                const samples = floatTo16Bit(e.data);
                enc.input(samples);
                
                let output;
                while (output = enc.output()) {
                  output = output.slice();
                  this.dispatchMessage({
                    data: output,
                    timestamp: 0, // fake
                    duration: 1, // fake
                  }, [output.buffer]);
                }
              } else {
                this.dispatchMessage({
                  data: null,
                  timestamp: 0, // fake
                  duration: 1, // fake
                });
    
                globalThis.close();
              }
            });
          }
          break;
        }
        case 'decode': {
          const decoderPromise = (async () => {
            await readyPromise;
            const dec = new libopus.Decoder(channelCount, sampleRate);
            return dec;
          })();
          const queueManager = new QueueManager();
    
          this.handlemessage = async e => {
            await queueManager.waitForTurn(async () => {
              const dec = await decoderPromise;
    
              if (e.data) {
                dec.input(e.data);
    
                let output;
                while (output = dec.output()) {
                  const result2 = int16ToFloat32(output);
                  this.dispatchMessage(result2, [result2.buffer]);
                }
              } else {
                this.dispatchMessage(null);
    
                globalThis.close();
              }
            });
          };
          break;
        }
      }
    };
  }
  postMessage(data, transferList) {
    this.handlemessage({
      data,
      transferList,
    });
  }
  dispatchMessage(data, transferList) {
    this.dispatchEvent(new MessageEvent('message', {
      data,
      transferList,
    }));
  }
  close() {
    this.dispatchEvent(new MessageEvent('close', {
      data: null,
    }));
  }
}
// import libopus from './libopusjs/libopus.wasm.js';
// import {channelCount, /*sampleRate, */ bitrate, frameSize, voiceOptimization} from './ws-constants.js';
// import { QueueManager } from '../queue-manager.mjs';