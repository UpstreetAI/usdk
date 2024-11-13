import {resample} from './resample.js';

const defaultBufferSize = 1024;

class VolumeProcessor extends (typeof AudioWorkletProcessor !== 'undefined' ? AudioWorkletProcessor : {}) {
  constructor() {
    super();

    // configurable
    this.sampleRate = globalThis.sampleRate;
    this.bufferSize = defaultBufferSize;
    this.muted = true;
    this.emitVolume = false;
    this.emitBuffer = false;

    // volume
    this.sampleMax = 0;
    this.numSamples = 0;

    // buffer
    this.queue = [];
    this.queueLength = 0;

    // this.queue = [];
    // this.queueLength = 0;
    // this.maxQueueLength = 4000;

    this.port.addEventListener('message', e => {
      const data = JSON.parse(e.data);
      const {method} = data;
      if (method === 'options') {
        const {args} = data;
        if (args.sampleRate !== undefined) {
          this.sampleRate = args.sampleRate;
        }
        if (args.bufferSize !== undefined) {
          this.bufferSize = args.bufferSize;
        }
        if (args.muted !== undefined) {
          this.muted = args.muted;
        }
        if (args.emitVolume !== undefined) {
          this.emitVolume = args.emitVolume;
        }
        if (args.emitBuffer !== undefined) {
          this.emitBuffer = args.emitBuffer;
        }
      }
    });
    this.port.start();
  }

  process(inputs, outputs) {
    const _emitVolume = () => {
      {
        for (const channels of inputs) {
          for (const samples of channels) {
            for (let j = 0; j < samples.length; j++) {
              this.sampleMax = Math.max(this.sampleMax, Math.abs(samples[j]));
              this.numSamples++;

              if (this.numSamples >= this.bufferSize) {
                const value = this.sampleMax;
                this.port.postMessage({
                  method: 'volume',
                  data: value,
                });
        
                this.sampleMax = 0;
                this.numSamples = 0;
              }
            }
          }
        }
      }
    };
    this.emitVolume && _emitVolume();

    // merge the channels
    const sampleLength = inputs[0]?.[0]?.length ?? 0;
    if (sampleLength > 0) {
      const _copyToOutput = () => {
        // simply copy all channels to the outputs
        for (let i = 0; i < outputs.length; i++) {
          const output = outputs[i];
          const input = inputs[i];
          if (input) {
            for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
              input[channelIndex] && output[channelIndex].set(input[channelIndex]);
            }
          }
        }

        /* const mergedChannels = Array(2);
        for (let channelIndex = 0; channelIndex < 2; channelIndex++) {
          const mergedChannel = new Float32Array(sampleLength);
          mergedChannels[channelIndex] = mergedChannel;
          
          for (const channels of inputs) {
            for (const samples of channels) {
              for (let j = 0; j < samples.length; j++) {
                mergedChannel[j] += samples[j] / channels.length;
              }
            }
          }
        }

        this.queue.push(mergedChannels);
        this.queueLength += sampleLength;

        while (this.queueLength > this.maxQueueLength) {
          const channels = this.queue.shift();
          this.queueLength -= channels[0].length;
          for (let i = 0; i < outputs.length; i++) {
            const output = outputs[i];
            for (let channelIndex = 0; channelIndex < output.length; channelIndex++) {
              output[channelIndex] && output[channelIndex].set(mergedChannels[channelIndex]);
            }
          }
        } */
      };
      !this.muted && _copyToOutput();

      const _emitBuffer = () => {
        // add merged samples to the queue
        const mergedSamples = new Float32Array(sampleLength);
        for (const channels of inputs) {
          for (const samples of channels) {
            for (let j = 0; j < sampleLength; j++) {
              mergedSamples[j] += samples[j];
            }
          }
          for (let j = 0; j < sampleLength; j++) {
            mergedSamples[j] /= channels.length;
          }
        }
        this.queue.push(mergedSamples);
        this.queueLength += sampleLength;

        // if we have enough samples, output them
        const requiredBufferSize = Math.ceil(this.bufferSize * this.sampleRate / globalThis.sampleRate);
        if (this.queueLength >= requiredBufferSize) {
          let bufferIndex = 0;
          let sampleIndex = 0;
          const pullSample = () => {
            const buffer = this.queue[bufferIndex];
            const sample = buffer[sampleIndex];

            sampleIndex++;
            if (sampleIndex >= buffer.length) {
              bufferIndex++;
              sampleIndex = 0;
            }

            return sample;
          };

          const rawMerged = new Float32Array(requiredBufferSize);
          for (let i = 0; i < requiredBufferSize; i++) {
            rawMerged[i] = pullSample();
          }
          this.queueLength -= requiredBufferSize;
          if (bufferIndex > 0) {
            this.queue.splice(0, bufferIndex);
          }
          if (sampleIndex > 0) {
            this.queue[0] = this.queue[0].slice(sampleIndex);
          }

          const resampled = globalThis.sampleRate === this.sampleRate ?
            rawMerged
          :
            resample(rawMerged, globalThis.sampleRate, this.sampleRate);

          this.port.postMessage({
            method: 'buffer',
            data: resampled,
          }, [resampled.buffer]);
        }
      };
      this.emitBuffer && _emitBuffer();
    }

    return true;
  }
}
if (typeof globalThis.registerProcessor !== 'undefined') {
  registerProcessor('volume-processor', VolumeProcessor);
}