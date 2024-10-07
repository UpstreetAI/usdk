import libopus from './libopusjs/libopus.wasm.js';

import {channelCount, /*sampleRate, */ bitrate, frameSize, voiceOptimization} from '../audio/ws-constants.js';
import { QueueManager } from '../../../../util/queue-manager.mjs';
import { floatTo16Bit, int16ToFloat32 } from './convert.mjs';

export class WsOpusCodec extends EventTarget {
  constructor() {
    super();
    
    const readyPromise = libopus.waitForReady();
    
    this.onmessage = e => {
      const {
        mode,
        sampleRate,
        format,
      } = e.data;
      switch (mode) {
        case 'encode': {
          const encoderPromise = (async () => {
            await readyPromise;
            const enc = new libopus.Encoder(channelCount, sampleRate, bitrate, frameSize, voiceOptimization);
            return enc;
          })();
          const queueManager = new QueueManager();
    
          this.onmessage = async e => {
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
    
          this.onmessage = async e => {
            await queueManager.waitForTurn(async () => {
              const dec = await decoderPromise;
    
              if (e.data) {
                dec.input(e.data);
    
                let output;
                while (output = dec.output()) {
                  const formatted = formatSamples(output, format, 'i16');
                  this.dispatchMessage(formatted, [formatted.buffer]);
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
    this.onmessage({
      data,
      transferList,
    });
  }
  dispatchMessage(data, transferList) {
    this.dispatchEvent(new MessageEvent('postmessage', {
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