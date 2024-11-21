import { int16ToFloat32, floatTo16Bit } from './convert.mjs';

const validFormats = ['f32', 'i16'];

export const formatSamples = (samples, dstFormat, srcFormat) => {
  if (!samples || !dstFormat || !srcFormat) {
    throw new Error('missing arguments: ' + JSON.stringify({
      samples: !!samples,
      dstFormat: !!dstFormat,
      srcFormat: !!srcFormat,
    }));
  }
  if (!validFormats.includes(srcFormat)) {
    throw new Error('invalid srcFormat: ' + srcFormat);
  }
  if (!validFormats.includes(dstFormat)) {
    throw new Error('invalid dstFormat: ' + dstFormat);
  }

  if (dstFormat === srcFormat) {
    return samples;
  } else {
    switch (dstFormat) {
      case 'f32': {
        if (srcFormat === 'i16') {
          const i16 = samples;
          const f32 = int16ToFloat32(i16);
          return f32;
        } else {
          return samples;
        }
      }
      case 'i16': {
        if (srcFormat === 'f32') {
          const f32 = samples;
          const i16 = floatTo16Bit(f32);
          return i16;
        } else {
          return samples;
        }
      }
      default: {
        throw new Error('invalid format: ' + format);
      }
    }
  }
};