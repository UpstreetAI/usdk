import Speaker from 'speaker';

export class SpeakerOutputStream extends WritableStream {
  static defaultSampleRate = 44100;

  constructor({
    // metadata,
    sampleRate = SpeakerOutputStream.defaultSampleRate,
  } = {}) {
    super({
      // start: c => {
      //   controller = c;
      // },
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

    // this.metadata = metadata;
    this.sampleRate = sampleRate;

    // // let controller;
    // // const donePromise = makePromise();
    // const inputStream = new TransformStream({
    //   // start: c => {
    //   //   controller = c;
    //   // },
    //   transform: (chunk, controller) => {
    //     // console.log('decode data 1', chunk);
    //     // audioDecoder.decode(chunk);
    //     controller.enqueue(chunk);
    //   },
    //   // flush: async controller => {
    //   //   audioDecoder.decode(null);
    //   //   await donePromise;
    //   // },
    // });
    // this.inputStream = inputStream;

    // create the speaker
    this.speaker = new Speaker({
      channels: 1,          // 2 channels
      bitDepth: 16,         // 16-bit samples
      sampleRate,
    });
    // // pump the decoder stream to the speaker
    // (async () => {
    //   for await (const chunk of this.decoderStream.readable) {
    //     this.speaker.write(chunk);
    //   }
    //   this.speaker.end();
    // })();
  }
  /* #createDecoderStream() {
    const { type, sampleRate } = this;
    switch (type) {
      case 'audio/mpeg': {
        return createMp3DecodeTransformStream({
          sampleRate,
        });
      }
      default: {
        throw new Error(`unhandled audio mime type: ${type}`);
      }
    }
  } */
  // write(data) {
  //   this.inputStream.writable.write(data);
  // }
  // end() {
  //   this.inputStream.writable.end();
  // }
}