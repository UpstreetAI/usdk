import { createMp3EncodeTransformStream } from './audio-client.mjs';

export class AudioEncodeStream {
  constructor({
    type,
    sampleRate,
    // format,
    transferBuffers,
  }) {
    switch (type) {
      case 'audio/mpeg': {
        return createMp3EncodeTransformStream({
          sampleRate,
          // format,
          transferBuffers,
        });
      }
      default: {
        throw new Error(`unhandled audio mime type: ${type}`);
      }
    }
  }
}
