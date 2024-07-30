import { EventEmitter } from 'events';
import child_process from 'child_process';
import { AudioEncodeStream } from '../lib/multiplayer/public/audio/audio-encode.mjs';
import vad from '@ricky0123/vad-node';
import { log as vadLog } from '@ricky0123/vad-node/dist/_common/logging.js';
import {
  InputDevices,
} from './input-devices.mjs';
import {
  QueueManager,
} from '../util/queue-manager.mjs';
import {
  aiHost,
} from '../util/endpoints.mjs';

//

const _disableVadLog = () => {
  for (const k in vadLog) {
    vadLog[k] = () => {};
  }
};
_disableVadLog();

//

/* const convertF32I16 = (samples) => {
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
} */

export const encodeMp3 = async (bs, {
  sampleRate,
}) => {
  if (Array.isArray(bs)) {
    bs = bs.slice();
  } else {
    bs = [bs];
  }

  // console.log('got bs', bs);

  let bufferIndex = 0;
  const inputStream = new ReadableStream({
    // start(controller) {
    // },
    pull(controller) {
      // console.log('pull', bufferIndex, bs.length);
      if (bufferIndex < bs.length) {
        const b = bs[bufferIndex++];
        // console.log('enqueue b', b);
        controller.enqueue(b);
      } else {
        controller.close();
      }
    },
  });

  const encodeTransformStream = new AudioEncodeStream({
    type: 'audio/mpeg',
    sampleRate,
    transferBuffers: false,
  });

  const outputStream = inputStream.pipeThrough(encodeTransformStream);

  // read the output
  const outputs = [];
  for await (const output of outputStream) {
    const b = Buffer.from(output.buffer, output.byteOffset, output.byteLength);
    outputs.push(b);
  }
  return Buffer.concat(outputs);
};

//

const defaultTranscriptionModel = 'whisper-1';
export const transcribe = async (data, {
  jwt,
}) => {
  const fd = new FormData();
  fd.append('file', new Blob([data], {
    type: 'audio/mpeg',
  }));
  fd.append('model', defaultTranscriptionModel);
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
    const text = await res.text();
    throw new Error('request failed: ' + res.status + ': ' + text);
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

      const _listenForStart = () => {
        let s = '';
        cp.stderr.setEncoding('utf8');
        const ondata = data => {
          s += data;
          if (/time=/.test(s)) {
            this.emit('start');
            cp.stderr.removeListener('data', ondata);
          }
        };
        cp.stderr.on('data', ondata);
      };
      _listenForStart();

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