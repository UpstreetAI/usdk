import { createMp3DecodeTransformStream } from '../lib/multiplayer/public/audio/audio-client.mjs';

export class AudioDecodeStream {
  constructor({
    type,
    sampleRate,
  }) {
    switch (type) {
      case 'audio/mpeg': {
        return createMp3DecodeTransformStream({
          sampleRate,
        });
      }
      default: {
        throw new Error(`unhandled audio mime type: ${type}`);
      }
    }
  }
}
