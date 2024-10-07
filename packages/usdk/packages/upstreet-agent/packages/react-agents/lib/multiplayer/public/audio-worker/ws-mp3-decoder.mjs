import MPEGDecoder from './mpg123-decoder/src/MPEGDecoder.js';
// import {channelCount, sampleRate, bitrate, kbps, frameSize, voiceOptimization} from './ws-constants.js';
import { resample, convertFloat32ToInt16 } from './resample.mjs';
import { QueueManager } from './queue-manager.mjs';

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

export class WsMp3Decoder extends EventTarget {
  constructor() {
    super();

    const mp3decoder = new MPEGDecoder();
    const queueManager = new QueueManager();

    this.onmessage = e => {
      const {
        sampleRate: globalSampleRate,
        format,
      } = e.data;
      this.onmessage = async e => {
        await queueManager.waitForTurn(async () => {
          console.log('wait for decoder ready 1');
          await mp3decoder.ready;
          console.log('wait for decoder ready 2');

          if (e.data) {
            const mp3Data = e.data;
            console.log('decode data 1', mp3Data);
            const result = mp3decoder.decode(mp3Data);
            console.log('decode data 2', result);
            const {channelData, samplesDecoded, sampleRate: localSampleRate} = result;
            if (samplesDecoded > 0) {
              const firstChannelData = channelData[0];
              // console.log('resampling 1');
              const resampled = localSampleRate === globalSampleRate ?
                firstChannelData
              :
                resample(firstChannelData, localSampleRate, globalSampleRate);
              // console.log('resampling 2', format);
              const formatted = (() => {
                switch (format) {
                  case 'f32': {
                    return resampled;
                  }
                  case 'i16': {
                    const f32 = resampled;
                    const i16 = convertFloat32ToInt16(f32);
                    return i16;
                  }
                  default: {
                    throw new Error('invalid format: ' + format);
                  }
                }
              })();
              // console.log('formatted', formatted);
              this.dispatchMessage({
                data: formatted,
                timestamp: 0, // fake
                duration: 1, // fake
              }, [formatted.buffer]);
            }
          } else {
            // const data = mp3decoder.flush();
            // this.dispatchMessage({
            //   data,
            //   timestamp: 0, // fake
            //   duration: 1, // fake
            // }, [data.buffer]);
      
            this.dispatchMessage({
              data: null,
              timestamp: 0, // fake
              duration: 1, // fake
            });
      
            this.close();
          }
        });
      };
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