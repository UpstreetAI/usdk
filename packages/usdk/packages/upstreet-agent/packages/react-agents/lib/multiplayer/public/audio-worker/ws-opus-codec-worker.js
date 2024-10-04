import {
  WsOpusCodec,
} from './ws-opus-codec.mjs';

const codec = new WsOpusCodec();
onmessage = e => {
  codec.postMessage(e.data);
};
codec.addEventListener('postmessage', e => {
  const {
    data,
    transferList,
  } = e;
  postMessage(data, transferList);
});
codec.addEventListener('close', () => {
  globalThis.close();
});