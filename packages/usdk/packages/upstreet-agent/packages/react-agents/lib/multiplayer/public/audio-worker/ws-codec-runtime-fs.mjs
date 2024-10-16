import libopus from '../audio-worker/libopusjs/libopus.wasm.fs.js';
import { makeOpusCodec } from '../audio-worker/ws-opus-codec.mjs';
export const WsOpusCodec = makeOpusCodec(libopus);

export { WsMp3Encoder } from '../audio-worker/ws-mp3-encoder.mjs';

import MPEGDecoder from '../audio-worker/mpg123-decoder/src/MPEGDecoder.fs.js';
import { makeMp3Decoder } from '../audio-worker/ws-mp3-decoder.mjs';
export const WsMp3Decoder = makeMp3Decoder(MPEGDecoder);