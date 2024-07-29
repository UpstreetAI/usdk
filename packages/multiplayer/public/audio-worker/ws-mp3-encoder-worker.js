// import lamejs from './lamejs/lame.all.js';
import lamejs from './lamejs/lame.min.js';
import {channelCount, bitrate, kbps, frameSize, voiceOptimization} from './ws-constants.js';

function floatTo16Bit(inputArray){
  const output = new Int16Array(inputArray.length);
  for (let i = 0; i < inputArray.length; i++){
    const s = Math.max(-1, Math.min(1, inputArray[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}
/* function int16ToFloat32(inputArray) {
  const output = new Float32Array(inputArray.length);
  for (let i = 0; i < inputArray.length; i++) {
    const int = inputArray[i];
    const float = (int >= 0x8000) ? -(0x10000 - int) / 0x8000 : int / 0x7FFF;
    output[i] = float;
  }
  return output;
} */

onmessage = e => {
  const {
    sampleRate,
  } = e.data;
  const mp3encoder = new lamejs.Mp3Encoder(channelCount, sampleRate, kbps);

  onmessage = e => {
    if (e.data) {
      const samples = floatTo16Bit(e.data);
      const data = mp3encoder.encodeBuffer(samples);
      postMessage({
        data,
        timestamp: 0, // fake
        duration: 1, // fake
      }, [data.buffer]);
    } else {
      const data = mp3encoder.flush();
      postMessage({
        data,
        timestamp: 0, // fake
        duration: 1, // fake
      }, [data.buffer]);

      postMessage({
        data: null,
        timestamp: 0, // fake
        duration: 1, // fake
      });

      globalThis.close();
    }
  };
};