import {
  WsMp3Decoder,
} from './ws-mp3-decoder.mjs';

const codec = new WsMp3Decoder();
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