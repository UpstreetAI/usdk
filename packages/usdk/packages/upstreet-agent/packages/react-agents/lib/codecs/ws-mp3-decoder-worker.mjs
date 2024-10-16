import MPEGDecoder from './packages/mpg123-decoder/src/MPEGDecoder.fetch.js';
import { makeMp3Decoder } from './ws-mp3-decoder.mjs';
const WsMp3Decoder = makeMp3Decoder(MPEGDecoder);

const codec = new WsMp3Decoder();
onmessage = e => {
  codec.postMessage(e.data);
};
codec.addEventListener('message', e => {
  const {
    data,
    transferList,
  } = e;
  postMessage(data, transferList);
});
codec.addEventListener('close', () => {
  globalThis.close();
});