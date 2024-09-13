import { createMp3DecodeTransformStream } from './audio-client.mjs';

export class AudioDecodeStream {
  constructor({
    type,
    sampleRate,
    format,
  }) {
    switch (type) {
      case 'audio/mpeg': {
        return createMp3DecodeTransformStream({
          sampleRate,
          format,
        });
      }
      default: {
        throw new Error(`unhandled audio mime type: ${type}`);
      }
    }
  }
}
