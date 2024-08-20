import { createMp3DecodeTransformStream } from '../lib/multiplayer/public/audio/audio-client.mjs';

export class AudioDecodeStream {
  constructor({
    type,
    sampleRate,
    transferBuffers,
  }) {
    switch (type) {
      case 'audio/mpeg': {
        return createMp3DecodeTransformStream({
          sampleRate,
          transferBuffers,
        });
      }
      default: {
        throw new Error(`unhandled audio mime type: ${type}`);
      }
    }
  }
}
