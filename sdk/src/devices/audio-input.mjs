import { EventEmitter } from 'events';
import { Transform } from 'stream';
import child_process from 'child_process';
import lamejs from 'lamejstmp';
// import { OpusDecoderWebWorker } from 'opus-decoder';
// import { OggOpusDecoderWebWorker } from 'ogg-opus-decoder';
// import {
//   QueueManager,
// } from '../util/queue-manager.mjs';
import {
  aiHost,
} from '../util/endpoints.mjs';

/* class OggDecodeTransformStream extends Transform {
  constructor({
    sampleRate,
  }) {
    super();

    this.decoder = new OggOpusDecoderWebWorker();
    this.queueManager = new QueueManager();

    this.once('finish', () => {
      decoder.free();
    });
  }
  _transform(chunk, encoding, callback) {
      (async () => {
        await this.queueManager.waitForTurn(async () => {
          await this.decoder.ready;
          const {channelData, samplesDecoded, sampleRate: frameSampleRate} = await this.decoder.decode(chunk);
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
    }
} */

//

// convert Float32Array to Int16Array
const convertF32I16 = (samples) => {
  const buffer = new ArrayBuffer(samples.length * Int16Array.BYTES_PER_ELEMENT);
  const view = new Int16Array(buffer);
  for (let i = 0; i < samples.length; i++) {
    view[i] = samples[i] * 0x7fff;
  }
  return view;
};

class Mp3EncodeStream extends Transform {
  constructor({
    sampleRate = AudioInput.defaultSampleRate,
    bitRate = 128,
  } = {}) {
    super();

    this.mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, bitRate); // mono
  }
  _transform(chunk, encoding, callback) {
    if (chunk.byteLength % Float32Array.BYTES_PER_ELEMENT !== 0) {
      throw new Error('wrong byte length', chunk.byteLength);
    }
    const float32Array = new Float32Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / Float32Array.BYTES_PER_ELEMENT);
    const samples = convertF32I16(float32Array);
    const encodedData = this.mp3encoder.encodeBuffer(samples);
    this.push(encodedData);

    callback();
  }
  _flush(callback) {
    const encodedData = this.mp3encoder.flush();
    this.push(encodedData);

    callback();
  }
}

export const encodeMp3 = (bs) => {
  if (!Array.isArray(bs)) {
    bs = [bs];
  }

  const encodeStream = new Mp3EncodeStream();
                  
  // read encoded result
  const resultPromise = new Promise((accept, reject) => {
    const bs = [];
    encodeStream.on('data', d => {
      bs.push(d);
    });
    encodeStream.on('end', () => {
      const b = Buffer.concat(bs);
      accept(b);
    });
  });

  // write samples
  for (const b of bs) {
    encodeStream.write(b);
  }
  encodeStream.end();

  return resultPromise;
};

//

const defaultTranscriptionModel = 'whisper-1';
export const transcribe = async (file, {
  jwt,
}) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('mode', defaultTranscriptionModel);
  fd.append('language', 'en');
  // fd.append('response_format', 'json');
  
  const res = await fetch(`${aiHost}/api/ai/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
    },
    body: fd,
  });
  if (res.ok) {
    const j = await res.json();
    const { text } = j;
    return text;
  } else {
    throw new Error('request failed: ' + res.status);
  }
};

//

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