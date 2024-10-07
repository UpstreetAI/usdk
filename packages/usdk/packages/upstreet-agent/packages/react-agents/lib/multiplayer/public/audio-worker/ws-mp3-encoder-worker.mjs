import {
  WsMp3Encoder,
} from './ws-mp3-encoder.mjs';

const codec = new WsMp3Encoder();
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