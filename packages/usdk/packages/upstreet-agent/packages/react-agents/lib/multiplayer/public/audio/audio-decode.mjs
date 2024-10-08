import { createMp3DecodeTransformStream, createOpusDecodeTransformStream } from './audio-client.mjs';

export class AudioDecodeStream {
  constructor({
    type,
    sampleRate,
    format,
    codecs,
  }) {
    if (!codecs) {
      throw new Error('no codecs');
    }

    switch (type) {
      case 'audio/mpeg': {
        return createMp3DecodeTransformStream({
          sampleRate,
          format,
          codecs,
        });
      }
      case 'audio/opus': {
        return createOpusDecodeTransformStream({
          sampleRate,
          format,
          codecs,
        });
      }
      default: {
        throw new Error(`unhandled audio mime type: ${type}`);
      }
    }
  }
}
