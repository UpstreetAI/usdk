import { createMp3EncodeTransformStream } from './audio-client.mjs';

export class AudioEncodeStream {
  constructor({
    type,
    sampleRate,
    codecs,
    transferBuffers,
  }) {
    if (!type) {
      throw new Error('no type');
    }
    if (!sampleRate) {
      throw new Error('no sample rate');
    }
    if (!codecs) {
      throw new Error('no codecs');
    }

    switch (type) {
      case 'audio/mpeg': {
        return createMp3EncodeTransformStream({
          sampleRate,
          codecs,
          transferBuffers,
        });
      }
      default: {
        throw new Error(`unhandled audio mime type: ${type}`);
      }
    }
  }
}
