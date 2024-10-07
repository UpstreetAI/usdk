import {
  createMp3DecodeTransformStream,
  createOpusDecodeTransformStream,
  createPcmF32TransformStream,
} from './audio-client.mjs';

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
      case 'audio/opus': {
        return createOpusDecodeTransformStream({
          sampleRate,
          format,
        });
      }
      case 'audio/pcm-f32': {
        return createPcmF32TransformStream({
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
