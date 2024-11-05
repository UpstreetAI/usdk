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
        // try {
          this.speaker.write(uint8Array);
        // } catch (err) {
        //   console.warn(err);
        // }
      },
      close: async () => {
        // console.log('speaker close 1');
        // try {
          this.speaker.end();

          // console.log('speaker close 2');

          await new Promise((accept, reject) => {
            this.speaker.once('close', accept);
          });

          // console.log('speaker close 3');
        // } catch (err) {
        //   console.warn(err);
        // }
      },
      abort: (reason) => {
        // try {
          this.speaker.end();
        // } catch (err) {
        //   console.warn(err);
        // }
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