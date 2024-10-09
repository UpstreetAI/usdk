import waveheader from 'waveheader';
import {
  transcribeRealtime,
} from '../util/audio-perception.mjs';
import { resample } from '../lib/multiplayer/public/audio-worker/resample.mjs';
import { floatTo16Bit } from '../lib/multiplayer/public/audio-worker/convert.mjs';

//

class AudioChunker {
constructor({
    sampleRate = TranscribedVoiceInput.transcribeSampleRate,
    channels = 1,
    bitDepth = 16,
    chunkSize = 8 * 1024
}) {
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
    const i16 = floatTo16Bit(f32);

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
  abortController;
  constructor({
    audioInput,
    sampleRate = TranscribedVoiceInput.transcribeSampleRate,
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
        // chunkSize: 8 * 1024,
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
    })().catch(err => {
      console.warn(err);
      throw err;
    });
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