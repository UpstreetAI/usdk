export class AudioChunker {
  constructor({ sampleRate, chunkSize = 1536 }) {
    this.sampleRate = sampleRate;
    this.chunkSize = chunkSize;

    this.numSamples = 0;
    this.buffer = Buffer.alloc(0);
    this.buffers = [];
  }

  write(f32) {
    const frames = [];

    this.numSamples += f32.length;
    this.buffers.push(
      Buffer.from(f32.buffer, f32.byteOffset, f32.byteLength),
    );

    while (this.numSamples >= this.chunkSize) {
      // merge buffers if needed
      if (this.buffers.length > 0) {
        this.buffer = Buffer.concat([
          this.buffer,
          ...this.buffers,
        ]);
        this.buffers.length = 0;
      }

      const f32_2 = new Float32Array(this.buffer.buffer, this.buffer.byteOffset, this.chunkSize);
      this.buffer = this.buffer.subarray(this.chunkSize * Float32Array.BYTES_PER_ELEMENT);
      this.numSamples -= this.chunkSize;

      frames.push(f32_2);
    }

    return frames;
  }
}

/* export class WavAudioChunker {
  constructor({ sampleRate, channels = 1, bitDepth = 16, chunkSize = 8 * 1024 }) {
    this.sampleRate = sampleRate;
    this.channels = channels;
    this.bitDepth = bitDepth;
    this.chunkSize = chunkSize;
    // this.loggedMicData = false;
    this.numSamples = 0;
    this.buffer = Buffer.alloc(0);
    this.buffers = [];
  }

  write(f32) {
    const frames = [];
    const i16 = convertF32I16(f32);

    // if (!this.loggedMicData) {
    //   console.log('got mic data (silenced)', i16);
    //   this.loggedMicData = true;
    // }

    this.numSamples += i16.length;
    // this.buffer = Buffer.concat([
    //   this.buffer,
    //   Buffer.from(i16.buffer, i16.byteOffset, i16.byteLength),
    // ]);
    this.buffers.push(
      Buffer.from(i16.buffer, i16.byteOffset, i16.byteLength),
    );

    while (this.numSamples >= this.chunkSize) {
      // merge buffers if needed
      if (this.buffers.length > 0) {
        this.buffer = Buffer.concat([
          this.buffer,
          ...this.buffers,
        ]);
        this.buffers.length = 0;
      }

      const i16_2 = new Int16Array(this.buffer.buffer, this.buffer.byteOffset, this.chunkSize);
      this.buffer = this.buffer.subarray(this.chunkSize * Int16Array.BYTES_PER_ELEMENT);
      this.numSamples -= this.chunkSize;

      const headerBuffer = waveheader(i16_2.length, {
        channels: this.channels,
        sampleRate: this.sampleRate,
        bitDepth: this.bitDepth,
      });
      const wavBuffer = Buffer.concat([
        headerBuffer,
        Buffer.from(i16_2.buffer, i16_2.byteOffset, i16_2.byteLength),
      ]);

      frames.push(wavBuffer);
    }

    return frames;
  }
} */