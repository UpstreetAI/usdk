const bufferSize = 4096;

class WsInputWorklet extends AudioWorkletProcessor {
  constructor (...args) {
    super(...args);

    this.buffer = new Float32Array(bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const channels = inputs[0];
    if (channels.length > 0) {
      const firstChannel = channels[0];
      for (let i = 0; i < firstChannel.length; i++) {
        let v = 0;
        for (let j = 0; j < channels.length; j++) {
          v += channels[j][i];
        }
        v /= channels.length;
        this.buffer[this.bufferIndex++] = v;
        if (this.bufferIndex >= this.buffer.length) {
          this.port.postMessage(this.buffer, [this.buffer.buffer]);
          this.buffer = new Float32Array(bufferSize);
          this.bufferIndex = 0;
        }
      }
    }
    return true;
  }
}
registerProcessor('ws-input-worklet', WsInputWorklet);