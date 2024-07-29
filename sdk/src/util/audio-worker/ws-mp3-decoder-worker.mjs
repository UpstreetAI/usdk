import MPEGDecoder from './mpg123-decoder/src/MPEGDecoder.js';
// import {channelCount, sampleRate, bitrate, kbps, frameSize, voiceOptimization} from './ws-constants.js';
import {resample} from './resample.js';
import { QueueManager } from '../queue-manager.mjs';

/* function floatTo16Bit(inputArray){
  const output = new Int16Array(inputArray.length);
  for (let i = 0; i < inputArray.length; i++){
    const s = Math.max(-1, Math.min(1, inputArray[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
} */
/* function int16ToFloat32(inputArray) {
  const output = new Float32Array(inputArray.length);
  for (let i = 0; i < inputArray.length; i++) {
    const int = inputArray[i];
    const float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
    output[i] = float;
  }
  return output;
} */

const mp3decoder = new MPEGDecoder();
const queueManager = new QueueManager();

onmessage = e => {
  const {
    sampleRate: globalSampleRate,
  } = e.data;
    onmessage = async e => {
      await queueManager.waitForTurn(async () => {
        await mp3decoder.ready;

        if (e.data) {
          const mp3Data = e.data;
          const result = mp3decoder.decode(mp3Data);
          const {channelData, samplesDecoded, sampleRate: localSampleRate} = result;
          if (samplesDecoded > 0) {
            const firstChannelData = channelData[0];
            const resampled = localSampleRate === globalSampleRate ?
              firstChannelData
            :
              resample(firstChannelData, localSampleRate, globalSampleRate);
            postMessage({
              data: resampled,
              timestamp: 0, // fake
              duration: 1, // fake
            }, [resampled.buffer]);
          }
        } else {
          // const data = mp3decoder.flush();
          // postMessage({
          //   data,
          //   timestamp: 0, // fake
          //   duration: 1, // fake
          // }, [data.buffer]);
    
          postMessage({
            data: null,
            timestamp: 0, // fake
            duration: 1, // fake
          });
    
          globalThis.close();
        }
      });
    };
  };