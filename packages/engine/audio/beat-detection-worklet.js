// globalThis.Module = {};
import Module from './bin/btt2.js';
// console.log('worklet btt module', Module);

//

/* function resample(sampleArray, srcSampleRate, targetSampleRate) {
  if (srcSampleRate === targetSampleRate) {
    return sampleArray.slice();
  }

  const conversionFactor = srcSampleRate / targetSampleRate;
  const outputLength = Math.ceil(sampleArray.length / conversionFactor);
  const outputArray = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; ++i) {
    const position = i * conversionFactor;
    const index = Math.floor(position);
    const fraction = position - index;

    if (index + 1 < sampleArray.length) {
      outputArray[i] = sampleArray[index] * (1 - fraction) + sampleArray[index + 1] * fraction;
    } else {
      outputArray[i] = sampleArray[index];
    }
  }

  return outputArray;
} */

//

/* function mod(a, n) {
  return ((a % n) + n) % n;
} */
function getNoteString(n) {
  // switch (mod((n - 1), 12)) {
  switch (n) {
    case 0: return 'C';
    case 1: return 'C#';
    case 2: return 'D';
    case 3: return 'D#';
    case 4: return 'E';
    case 5: return 'F';
    case 6: return 'F#';
    case 7: return 'G';
    case 8: return 'G#';
    case 9: return 'A';
    case 10: return 'A#';
    case 11: return 'B';
    default: return '';
  }
}
function getQualityString(n) {
  switch (n) {
    case 0: return 'min'; // Minor
    case 1: return 'maj'; // Major
    case 2: return 'sus'; // Suspended
    case 3: return 'dom'; // Dominant
    case 4: return 'dim'; // Dimished5th
    case 5: return 'aug'; // Augmented5th
    default: return '';
  }
}

//

/* struct BTTProcessOutput {
  float bpm;
  unsigned long long *onsetTimestamps;
  std::size_t numOnsetTimestamps;
  unsigned long long *beatTimestamps;
  std::size_t numBeatTimestamps;
};

EMSCRIPTEN_KEEPALIVE void processBt(BTTObject *btt, float *buffer, int buffer_size, BTTProcessOutput *output) {
  btt->onsetTimestamps.clear();
  btt->beatTimestamps.clear();

  btt_process(btt->btt, buffer, buffer_size);
  
  output->bpm = btt_get_tempo_bpm(btt->btt);
  output->onsetTimestamps = btt->onsetTimestamps.data();
  output->numOnsetTimestamps = btt->onsetTimestamps.size();
  output->beatTimestamps = btt->beatTimestamps.data();
  output->numBeatTimestamps = btt->beatTimestamps.size();
} */

//

class BeatDetectionWorklet extends AudioWorkletProcessor {
  constructor(...args) {
    super(...args);

    console.log('initialize sample rate', globalThis.sampleRate);
    this.bttPtr = null;
    (async () => {
      console.log('beat worklet wait for load 1');
      await globalThis.waitForLoad();
      console.log('beat worklet wait for load 2');

      this.bttPtr = Module._createBtt(globalThis.sampleRate);

      this.port.postMessage({
        method: 'ready',
        args: {},
      });
    })();
  }

  process(inputs, outputs, parameters) {
    // console.log('beat worklet process', inputs, outputs, parameters);
    if (!this.bttPtr) {
      throw new Error('not ready');
    }
    // console.log('btt ptr', this.bttPtr);

    // WebAudio Worklet: copy input to output
    for (let i = 0; i < inputs.length; ++i) {
      const channelData = inputs[i];
      const outputChannelData = outputs[i];

      for (let j = 0; j < channelData.length; ++j) {
        outputChannelData[j].set(channelData[j]);
      }
    }

    // beat detection
    const channels = inputs[0];
    const firstChannel = channels[0];

    const numSamples = firstChannel.length;
    const bufferPtr = Module._doMalloc(numSamples * Float32Array.BYTES_PER_ELEMENT);
    const buffer = new Float32Array(Module.HEAPF32.buffer, Module.HEAPF32.byteOffset + bufferPtr, numSamples);

    // fill the buffer with the first input channel average
    // console.log('process', numSamples);
    for (let i = 0; i < numSamples; i++) {
      let v = 0;
      for (let k = 0; k < channels.length; k++) {
        v += channels[k][i];
      }
      v /= channels.length;
      buffer[i] = v;
    }

    const processOutputPtr = Module._doMalloc(
      Float64Array.BYTES_PER_ELEMENT + // sampleTimestamp
      Float32Array.BYTES_PER_ELEMENT + // bpm
      Uint32Array.BYTES_PER_ELEMENT + // numOnsetTimestamps
      Uint32Array.BYTES_PER_ELEMENT + // onsetTimestamps
      Uint32Array.BYTES_PER_ELEMENT + // numBeatTimestamps
      Uint32Array.BYTES_PER_ELEMENT + // beatTimestamps
      Int32Array.BYTES_PER_ELEMENT + // rootNote
      Int32Array.BYTES_PER_ELEMENT + // quality
      Int32Array.BYTES_PER_ELEMENT // intervals
    );

    // for (let i = 0; i < numSamples; i++) {
    //   let sum = 0;
    //   for (let k = 0; k < channels.length; k++) {
    //     sum += channels[k][i];
    //   }
    //   buffer[i] = sum / channels.length;
    // }

    Module._processBt(this.bttPtr, bufferPtr, numSamples, processOutputPtr);

    let processOutputBufferIndex = 0;
    const sampleTimestamp = new Float64Array(Module.HEAPF64.buffer, Module.HEAPF64.byteOffset + processOutputPtr + processOutputBufferIndex, 1);
    processOutputBufferIndex += Float64Array.BYTES_PER_ELEMENT;

    const bpm = new Float32Array(Module.HEAPF32.buffer, Module.HEAPF32.byteOffset + processOutputPtr + processOutputBufferIndex, 1);
    processOutputBufferIndex += Float32Array.BYTES_PER_ELEMENT;
    
    const numOnsetTimestamps = new Uint32Array(Module.HEAPU32.buffer, Module.HEAPF32.byteOffset + processOutputPtr + processOutputBufferIndex, 1);
    processOutputBufferIndex += Uint32Array.BYTES_PER_ELEMENT;
    const onsetTimestampsAddress = new Uint32Array(Module.HEAPU32.buffer, Module.HEAPF32.byteOffset + processOutputPtr + processOutputBufferIndex, 1)[0];
    processOutputBufferIndex += Uint32Array.BYTES_PER_ELEMENT;
    const onsetTimestamps = new Uint32Array(Module.HEAPU32.buffer, Module.HEAPF32.byteOffset + onsetTimestampsAddress, numOnsetTimestamps[0]);

    const numBeatTimestamps = new Uint32Array(Module.HEAPU32.buffer, Module.HEAPF32.byteOffset + processOutputPtr + processOutputBufferIndex, 1);
    processOutputBufferIndex += Uint32Array.BYTES_PER_ELEMENT;
    const beatTimestampsAddress = new Uint32Array(Module.HEAPU32.buffer, Module.HEAPF32.byteOffset + processOutputPtr + processOutputBufferIndex, 1)[0];
    processOutputBufferIndex += Uint32Array.BYTES_PER_ELEMENT;
    const beatTimestamps = new Uint32Array(Module.HEAPU32.buffer, Module.HEAPF32.byteOffset + beatTimestampsAddress, numBeatTimestamps[0]);

    const stats = new Int32Array(Module.HEAP32.buffer, Module.HEAP32.byteOffset + processOutputPtr + processOutputBufferIndex, 3);
    processOutputBufferIndex += Int32Array.BYTES_PER_ELEMENT * 3;
    const [
      rootNote,
      quality,
      intervals,
    ] = stats;

    // rootNote: function() {
    //   switch(ChordDetector._getRootNote(this._ptr)) {
    //     case 0: return "C";
    //     case 1: return "C#";
    //     case 2: return "D";
    //     case 3: return "D#";
    //     case 4: return "E";
    //     case 5: return "F";
    //     case 6: return "F#";
    //     case 7: return "G";
    //     case 8: return "G#";
    //     case 9: return "A";
    //     case 10: return "A#";
    //     case 11: return "B";
    //   }
    // },

    this.port.postMessage({
      method: 'update',
      args: {
        sampleTimestamp: Math.floor(sampleTimestamp[0]),
        bpm: bpm[0],
        onsetTimestamps: onsetTimestamps.slice(),
        beatTimestamps: beatTimestamps.slice(),
        rootNote: getNoteString(rootNote),
        quality: getQualityString(quality),
        intervals: intervals,
      },
    });

    const _cleanup = () => {
      Module._doFree(bufferPtr);
      Module._doFree(processOutputPtr);
    };
    _cleanup();

    return true;
  }
}
registerProcessor('beat-detection-worklet', BeatDetectionWorklet);