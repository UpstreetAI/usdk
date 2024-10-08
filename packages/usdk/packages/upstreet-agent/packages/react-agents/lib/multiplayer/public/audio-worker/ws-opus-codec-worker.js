import libopus from './libopusjs/libopus.wasm.js';
import {
  makeOpusCodec,
} from './ws-opus-codec.mjs';

const WsOpusCodec = makeOpusCodec(libopus);

const codec = new WsOpusCodec();
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