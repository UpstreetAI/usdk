import { EventEmitter } from 'events';
import child_process from 'child_process';
import waveheader from 'waveheader';
import { AudioEncodeStream } from '../lib/multiplayer/public/audio/audio-encode.mjs';
// import vad from '@ricky0123/vad-node';
// import { log as vadLog } from '@ricky0123/vad-node/dist/_common/logging.js';
// import {
//   InputDevices,
// } from './input-devices.mjs';
import {
  transcribeRealtime,
} from '../util/audio-perception.mjs';
// import {
//   QueueManager,
// } from '../util/queue-manager.mjs';
import { resample } from '../lib/multiplayer/public/audio-worker/resample.mjs';

//

// const _disableVadLog = () => {
//   for (const k in vadLog) {
//     vadLog[k] = () => {};
//   }
// };
// _disableVadLog();

//

const convertF32I16 = (samples) => {
  const buffer = new ArrayBuffer(samples.length * Int16Array.BYTES_PER_ELEMENT);
  const view = new Int16Array(buffer);
  for (let i = 0; i < samples.length; i++) {
    view[i] = samples[i] * 0x7fff;
  }
  return view;
};

/* class Mp3EncodeStream extends Transform {
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

class AudioChunker {
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
}
export class TranscribedVoiceInput extends EventTarget {
  static transcribeSampleRate = 24000;
  // audioInput;
  abortController;
  constructor({
    audioInput,
    sampleRate = AudioInput.transcribeSampleRate,
    jwt,
  }) {
    if (!audioInput) {
      throw new Error('no audio input');
    }
    if (!sampleRate) {
      throw new Error('no sample rate');
    }
    if (!jwt) {
      throw new Error('no jwt');
    }

    super();

    // this.audioInput = audioInput;

    this.abortController = new AbortController();
    const {
      signal,
    } = this.abortController;

    // this.paused = false;

    (async () => {
      const transcription = transcribeRealtime({
        jwt,
      });
      transcription.addEventListener('speechstart', e => {
        this.dispatchEvent(new MessageEvent('speechstart', {
          data: e.data,
        }));
      });
      transcription.addEventListener('speechstop', e => {
        this.dispatchEvent(new MessageEvent('speechstop', {
          data: e.data,
        }));
      });
      transcription.addEventListener('transcription', e => {
        this.dispatchEvent(new MessageEvent('transcription', {
          data: e.data,
        }));
      });
      signal.addEventListener('abort', () => {
        transcription.close();
      });

      const openPromise = new Promise((accept, reject) => {
        transcription.addEventListener('open', e => {
          accept(null);
        });
        transcription.addEventListener('error', e => {
          reject(e);
        });
      });

      const audioChunker = new AudioChunker({
        sampleRate: TranscribedVoiceInput.transcribeSampleRate,
        chunkSize: 8 * 1024,
      });
      const ondata = async (f32) => {
        await openPromise;

        // resample if needed
        if (sampleRate !== TranscribedVoiceInput.transcribeSampleRate) {
          f32 = resample(f32, sampleRate, TranscribedVoiceInput.transcribeSampleRate);
        }

        const wavFrames = audioChunker.write(f32);
        for (const wavFrame of wavFrames) {
          transcription.write(wavFrame);
        }
      };
      audioInput.on('data', ondata);

      const cleanup = () => {
        signal.addEventListener('abort', () => {
          audioInput.removeListener('data', ondata);
        });
      };
      signal.addEventListener('abort', () => {
        cleanup();
      });
    })();
  }
  close() {
    this.abortController.abort();
    this.dispatchEvent(new MessageEvent('close', {
      data: null,
    }));
  }
  // pause() {
  //   if (!this.paused) {
  //     this.paused = true;
  //     this.dispatchEvent(new MessageEvent('pause', {
  //       data: null,
  //     }));
  //   }
  // }
  // resume() {
  //   if (this.paused) {
  //     this.paused = false;
  //     this.dispatchEvent(new MessageEvent('resume', {
  //       data: null,
  //     }));
  //   }
  // }
}
//

export class AudioInput extends EventEmitter {
  static defaultSampleRate = 48000;
  constructor(id, {
    sampleRate = AudioInput.defaultSampleRate,
    numSamples,
  } = {}) {
    super();

    const _reset = () => {
      this.abortController = new AbortController();
      const { signal } = this.abortController;

      this.paused = false;

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
      signal.addEventListener('abort', () => {
        cp.kill();
      });

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

        signal.addEventListener('abort', () => {
          cp.stderr.removeListener('data', ondata);
        });
      };
      _listenForStart();

      const bs = [];
      let bsLength = 0;
      const ondata = data => {
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
      };
      cp.stdout.on('data', ondata);
      const onend = () => {
        this.emit('end');
      };
      cp.stdout.on('end', onend);
      const onerror = err => {
        this.emit('error', err);
      };
      cp.on('error', onerror);

      signal.addEventListener('abort', () => {
        cp.stdout.removeListener('data', ondata);
        cp.stdout.removeListener('end', onend);
        cp.removeListener('error', onerror);
      });
    };
    _reset();

    this.on('pause', e => {
      this.abortController.abort();
    });
    this.on('resume', e => {
      _reset();
    });
  }
  close() {
    this.abortController.abort();
    this.emit('close');
  }
  pause() {
    if (!this.paused) {
      this.paused = true;
      this.emit('pause');
    }
  }
  resume() {
    if (this.paused) {
      this.paused = false;
      this.emit('resume');
    }
  }
};