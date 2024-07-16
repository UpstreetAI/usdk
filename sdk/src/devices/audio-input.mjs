import { EventEmitter } from 'events';
// import { Transform } from 'stream';
import child_process from 'child_process';
// import { OpusDecoderWebWorker } from 'opus-decoder';
// import { OggOpusDecoderWebWorker } from 'ogg-opus-decoder';
// import {
//   QueueManager,
// } from '../util/queue-manager.mjs';

/* class OggDecodeTransformStream extends Transform {
  constructor({
    sampleRate,
  }) {
    const decoder = new OggOpusDecoderWebWorker();
    const queueManager = new QueueManager();

    super({
      transform: (chunk, encoding, callback) => {
        (async () => {
          await queueManager.waitForTurn(async () => {
            await decoder.ready;
            const {channelData, samplesDecoded, sampleRate: frameSampleRate} = await decoder.decode(chunk);
            if (frameSampleRate === sampleRate) {
              const samples = channelData[0]; // Float32Array
              if (samples?.length > 0) {
                this.push(samples);
                // const b = Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength);
                // this.push(b);
              }
            } else {
              console.warn('frame sample rate mismatch', frameSampleRate, sampleRate);
            }
          });
          callback();
        })();
      },
    });

    this.once('finish', () => {
      decoder.free();
    });
  }
} */

export class AudioInput extends EventEmitter {
  static defaultSampleRate = 48000;
  constructor(id, {
    sampleRate = AudioInput.defaultSampleRate,
    numSamples,
  } = {}) {
    super();

    (async () => {
      // const decoder = new OpusDecoderWebWorker();

      // ffmpeg -f avfoundation -i ":1" -ar 48000 -c:a libopus -f opus pipe:1
      const cp = child_process.spawn('ffmpeg', [
        '-f', 'avfoundation',
        '-i', `:${id}`,
        '-ar', `${sampleRate}`,
        // '-c:a', 'libopus',
        // '-f', 'opus',
        '-f', 'f32le',
        '-acodec', 'pcm_f32le',
        'pipe:1',
      ]);
      // cp.stderr.pipe(process.stderr);
      const bs = [];
      let bsLength = 0;

      // const decodeStream = cp.stdout.pipe(new OggDecodeTransformStream({
      //   sampleRate,
      // }));
      const decodeStream = cp.stdout;
      decodeStream.on('data', data => {
        // data = Uint8Array.from(data);
        // const {channelData, samplesDecoded, sampleRate} = await decoder.decode(data);
        // console.log('decoded', channelData, samplesDecoded, sampleRate);

        if (typeof numSamples === 'number') {
          bs.push(data);
          bsLength += data.length;

          // console.log('bs length', bsLength, numSamples);

          if (bsLength / Float32Array.BYTES_PER_ELEMENT >= numSamples) {
            const b = Buffer.concat(bs);
            let i = 0;
            while (bsLength / Float32Array.BYTES_PER_ELEMENT >= numSamples) {
              // const data = b.slice(i * Float32Array.BYTES_PER_ELEMENT, (i + numSamples) * Float32Array.BYTES_PER_ELEMENT);
              // const samples = new Float32Array(data.buffer, data.byteOffset, numSamples);
              const samples = new Float32Array(b.buffer, b.byteOffset + i * Float32Array.BYTES_PER_ELEMENT, numSamples);
              this.emit('data', samples);

              i += numSamples;
              bsLength -= numSamples * Float32Array.BYTES_PER_ELEMENT;
            }
            // unshift the remainder
            bs.length = 0;
            if (bsLength > 0) {
              bs.push(b.slice(i * Float32Array.BYTES_PER_ELEMENT));
            }
          }
        } else {
          const samples = new Float32Array(data.buffer, data.byteOffset, data.length / Float32Array.BYTES_PER_ELEMENT);
          this.emit('data', samples);
        }
      });
      decodeStream.on('end', () => {
        this.emit('end');
      });
      cp.on('error', err => {
        this.emit('error', err);
      });
    })();
  }
};