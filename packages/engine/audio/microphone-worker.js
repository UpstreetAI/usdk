class MicrophoneWorker extends EventTarget {
  constructor(options = {}) {
    super();

    const audioWorkletNode = new AudioWorkletNode(options.audioContext, 'volume-processor');
    audioWorkletNode.port.onmessage = e => {
      switch (e.data.method) {
        case 'volume':
        case 'buffer':
          {
            this.dispatchEvent(new MessageEvent(e.data.method, {
              data: e.data.data,
            }));
            break;
          }
        default: {
          console.warn('invalid microphone worklet message', e.data);
        }
      }
    };
    this.audioWorkletNode = audioWorkletNode;

    this.setOptions(options);

    audioWorkletNode.connect(options.audioContext.gain);
  }

  setOptions(options) {
    this.audioWorkletNode.port.postMessage(JSON.stringify({
      method: 'options',
      args: {
        sampleRate: options.sampleRate,
        bufferSize: options.bufferSize,
        muted: options.muted,
        emitVolume: options.emitVolume,
        emitBuffer: options.emitBuffer,
      },
    }));
  }

  getInput() {
    return this.audioWorkletNode;
  }

  close() {
    if (this.audioWorkletNode) {
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode.port.onmessage = null;
    }
  }
}
export default MicrophoneWorker;