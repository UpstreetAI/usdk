import { WsOpusCodec } from 'react-agents/lib/multiplayer/public/audio-worker/ws-opus-codec.mjs';
import { WsMp3Encoder } from 'react-agents/lib/multiplayer/public/audio-worker/ws-mp3-encoder.mjs';
import { WsMp3Decoder } from 'react-agents/lib/multiplayer/public/audio-worker/ws-mp3-decoder.mjs';
// XXX finish this

// NO WebCodecs suport

export class FakeAudioData {
  constructor() {
    this.data = null;
    this.buffer = {
      getChannelData: n => {
        return this.data;
      },
    };
  }

  set(data) {
    this.data = data;
  }
}
/* class FakeIteratorResult {
  constructor(value) {
    this.value = value;
    this.done = false;
  }

  setDone(done) {
    this.done = done;
  }
}
export class WsMediaStreamAudioReader {
  constructor(mediaStream, {
    audioContext,
  }) {
    if (!audioContext) {
      console.warn('need audio context');
      debugger;
    }

    this.buffers = [];
    this.cbs = [];
    this.fakeAudioData = new FakeAudioData();
    this.fakeIteratorResult = new FakeIteratorResult(this.fakeAudioData);
    
    const mediaStreamSourceNode = audioContext.createMediaStreamSource(mediaStream);
    
    const audioWorkletNode = new AudioWorkletNode(audioContext, 'ws-input-worklet');
    audioWorkletNode.onprocessorerror = err => {
      console.warn('audio worklet error', err);
    };
    audioWorkletNode.port.onmessage = e => {
      this.pushAudioData(e.data);
    };
    
    mediaStreamSourceNode.connect(audioWorkletNode);
    
    const close = e => {
      this.cancel();
    };
    mediaStream.addEventListener('close', close);
    this.cleanup = () => {
      mediaStream.removeEventListener('close', close);
    };
  }

  read() {
    if (this.buffers.length > 0) {
      const b = this.buffers.shift();
      if (b) {
        this.fakeAudioData.set(b);
      } else {
        this.fakeIteratorResult.setDone(true);
      }
      return Promise.resolve(this.fakeIteratorResult);
    } else {
      let accept;
      const p = new Promise((a, r) => {
        accept = a;
      });
      this.cbs.push(b => {
        if (b) {
          this.fakeAudioData.set(b);
        } else {
          this.fakeIteratorResult.setDone(true);
        }
        accept(this.fakeIteratorResult);
      });
      return p;
    }
  }

  cancel() {
    this.pushAudioData(null);
    this.cleanup();
  }

  pushAudioData(b) {
    if (this.cbs.length > 0) {
      this.cbs.shift()(b);
    } else {
      this.buffers.push(b);
    }
  }
}

export function WsEncodedAudioChunk(o) {
  return o;
} */

export class OpusAudioEncoder {
  constructor({sampleRate, output, error}) {
    // this.worker = new OpusCodecWorker();
    this.worker = new WsOpusCodec();
    // console.log("worker", this.worker)
    this.worker.addEventListener('postmessage', e => {
      output(e.data);
    });
    this.worker.addEventListener('error', error);
    this.worker.postMessage({
      mode: 'encode',
      sampleRate,
    });
  }

  encode(audioData) {
    this.worker.postMessage(audioData.data, audioData.data !== null ? [audioData.data.buffer] : []);
  }
}

export class OpusAudioDecoder {
  constructor({sampleRate, output, error}) {
    // this.worker = new OpusCodecWorker();
    this.worker = new WsOpusCodec();
    const fakeAudioData = new FakeAudioData();
    this.worker.addEventListener('postmessage', e => {
      if (e.data) {
        fakeAudioData.set(e.data);
        output(fakeAudioData);
      } else {
        output(null);
      }
    });
    this.worker.addEventListener('error', error);
    this.worker.postMessage({
      mode: 'decode',
      sampleRate,
    });
  }

  decode(data) {
    this.worker.postMessage(data, data !== null ? [data.buffer] : []);
  }
}

export class Mp3AudioEncoder {
  constructor({
    sampleRate,
    bitrate = 128,
    transferBuffers = true,
    output,
    error,
  }) {
    if (!sampleRate) {
      debugger;
    }

    this.transferBuffers = transferBuffers;

    // this.worker = new Worker(new URL('../audio-worker/ws-mp3-encoder-worker.mjs', import.meta.url), {
    //   type: 'module',
    // });
    this.worker = new WsMp3Encoder();

    // this.worker.onmessage = e => {
    //   output(e.data);
    // };
    // this.worker.onerror = error;
    this.worker.addEventListener('postmessage', e => {
      output(e.data);
    });
    this.worker.addEventListener('error', error);
    this.worker.postMessage({
      sampleRate,
      bitrate,
    });
  }
  
  encode(audioData) {
    this.worker.postMessage(audioData.data, this.transferBuffers && audioData.data !== null ? [audioData.data.buffer] : []);
  }
}

export class Mp3AudioDecoder {
  constructor({
    sampleRate,
    format = 'f32',
    transferBuffers = true,
    output,
    error,
  }) {
    if (!sampleRate) {
      debugger;
    }

    this.transferBuffers = transferBuffers;

    // this.worker = new Worker(new URL('../audio-worker/ws-mp3-decoder-worker.mjs', import.meta.url), {
    //   type: 'module',
    // });
    this.worker = new WsMp3Decoder();

    // this.worker.onmessage = e => {
    //   output(e.data);
    // };
    // this.worker.onerror = error;
    this.worker.addEventListener('postmessage', e => {
      output(e.data);
    });
    this.worker.addEventListener('error', error);
    this.worker.postMessage({
      sampleRate,
      format,
    });
  }

  decode(data) {
    this.worker.postMessage(data, this.transferBuffers && data !== null ? [data.buffer] : []);
  }
}