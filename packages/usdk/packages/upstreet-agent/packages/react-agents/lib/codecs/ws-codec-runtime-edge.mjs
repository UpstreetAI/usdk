import libopus from './packages/libopusjs/libopus.wasm.js';
import { makeOpusCodec } from './ws-opus-codec.mjs';
export const WsOpusCodec = makeOpusCodec(libopus);

export { WsMp3Encoder } from './ws-mp3-encoder.mjs';

import MPEGDecoder from './packages/mpg123-decoder/src/MPEGDecoder.js';
import { makeMp3Decoder } from './ws-mp3-decoder.mjs';
export const WsMp3Decoder = makeMp3Decoder(MPEGDecoder);