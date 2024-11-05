import { resample } from './resample.mjs';

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
export class FakeIteratorResult {
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
    // if passed, resample audio to this rate
    // otherwise, use the rate of the audio context
    sampleRate = undefined,
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
      let f32 = e.data;
      // console.warn('push audio data', f32, audioContext.sampleRate, sampleRate);
      if (sampleRate !== undefined) {
        f32 = resample(f32, audioContext.sampleRate, sampleRate);
      }
      this.pushAudioData(f32);
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
}