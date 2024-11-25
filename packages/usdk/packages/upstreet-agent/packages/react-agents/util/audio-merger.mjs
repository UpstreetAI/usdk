import { EventEmitter } from 'events';

export class AudioMerger extends EventEmitter {
  constructor({
    sampleRate,
    chunkRateMs = 100,
    timeoutMs = null,
  }) {
    super();

    if (!sampleRate) {
      throw new Error('AudioMerger: no sample rate');
    }

    this.sampleRate = sampleRate;
    this.chunkRateMs = chunkRateMs;
    this.timeoutMs = timeoutMs;
    const numSamplesPerChunk = this.sampleRate / 1000 * this.chunkRateMs;
    if (Math.floor(numSamplesPerChunk) !== numSamplesPerChunk) {
      throw new Error(`chunkRateMs does not divide evenly into sampleRate: ${this.chunkRateMs}ms, ${this.sampleRate}Hz`);
    }
    this.numSamplesPerChunk = numSamplesPerChunk;

    this.streamBuffers = new Set();
    this.lastDataTime = Date.now();
    this.interval = setInterval(() => {
      this.process();
    }, this.chunkRateMs);
  }

  process() {
    const outputChunk = new Float32Array(this.numSamplesPerChunk);

    const hadStreamBuffers = this.streamBuffers.size > 0;

    // merge all stream buffers
    for (const buffers of this.streamBuffers) {
      let localOutputIndex = 0;
      while (buffers.length > 0) {
        const f32 = buffers[0];
        if (f32 === null) {
          // stream ended and we have consumed all its data
          this.streamBuffers.delete(buffers);
          break;
        }

        const numSamplesToWrite = Math.min(f32.length, this.numSamplesPerChunk - localOutputIndex);

        // slice the buffer into the part we will write to output and the part we will rebuffer
        const outputPart = f32.subarray(0, numSamplesToWrite);
        const rebufferPart = f32.subarray(numSamplesToWrite);

        // write to output by adding samples
        for (let i = 0; i < outputPart.length; i++) {
          outputChunk[localOutputIndex + i] += outputPart[i];
        }
        localOutputIndex += numSamplesToWrite;

        // remove or rebuffer
        if (rebufferPart.length > 0) {
          buffers[0] = rebufferPart;
          break;
        } else {
          buffers.shift();
        }
      }
    }
    // emit the chunk
    this.emit('data', outputChunk);

    // if we had stream buffers, update the last data time
    const now = Date.now();
    if (hadStreamBuffers) {
      this.lastDataTime = now;
    }
    if (this.timeoutMs !== null) {
      // timeout if there is no data for a while
      const timeDiff = now - this.lastDataTime;
      if (timeDiff > this.timeoutMs) {
        this.end();
      }
    }
  }

  add(readableStream) {
    const buffers = [];
    this.streamBuffers.add(buffers);

    (async () => {
      const reader = readableStream.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (!done) {
          buffers.push(value);
        } else {
          buffers.push(null);
          break;
        }
      }
    })();
  }

  end() {
    clearInterval(this.interval);
    this.interval = null;

    this.emit('end');
  }
}