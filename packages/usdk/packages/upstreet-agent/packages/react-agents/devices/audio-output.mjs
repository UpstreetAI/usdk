import Speaker from 'speaker';

export class SpeakerOutputStream extends WritableStream {
  static defaultSampleRate = 44100;

  constructor({
    sampleRate = SpeakerOutputStream.defaultSampleRate,
  } = {}) {
    super({
      write: (chunk, controller) => {
        // console.log('speaker write', chunk);
        let uint8Array;
        if (chunk instanceof Uint8Array) {
          uint8Array = chunk;
        } else {
          uint8Array = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        }
        this.speaker.write(uint8Array);
      },
      close: async () => {
        this.speaker.end();
        await new Promise((accept, reject) => {
          this.speaker.once('finish', accept);
        });
      },
    });

    this.sampleRate = sampleRate;

    // create the speaker
    this.speaker = new Speaker({
      channels: 1,          // 2 channels
      bitDepth: 16,         // 16-bit samples
      sampleRate,
    });
  }
}