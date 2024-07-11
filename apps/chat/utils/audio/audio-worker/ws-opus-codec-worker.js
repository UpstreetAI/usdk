import libopus from './libopusjs/libopus.wasm.js';
import {channelCount, /*sampleRate, */ bitrate, frameSize, voiceOptimization} from './ws-constants.js';
import { QueueManager } from '../../queue/queue-manager.js';

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

const readyPromise = libopus.waitForReady();

onmessage = e => {
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

      onmessage = async e => {
        await queueManager.waitForTurn(async () => {
          const enc = await encoderPromise;

          if (e.data) {
            const samples = floatTo16Bit(e.data);
            enc.input(samples);
            
            let output;
            while (output = enc.output()) {
              output = output.slice();
              postMessage({
                data: output,
                timestamp: 0, // fake
                duration: 1, // fake
              }, [output.buffer]);
            }
          } else {
            postMessage({
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

      onmessage = async e => {
        await queueManager.waitForTurn(async () => {
          const dec = await decoderPromise;

          if (e.data) {
            dec.input(e.data);

            let output;
            while (output = dec.output()) {
              const result2 = int16ToFloat32(output);
              postMessage(result2, [result2.buffer]);
            }
          } else {
            postMessage(null);

            globalThis.close();
          }
        });
      };
      break;
    }
  }
};