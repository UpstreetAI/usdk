// const volumeUpdateRate = 20;
// const volumeScale = 2;
// const audioBufferLength = 30;
class WsOutputWorklet extends AudioWorkletProcessor {
  constructor (...args) {
    super(...args);
    
    this.buffers = [];
    // this.lastVolumeTime = 0;
    // this.maxSample = 0;
    // this.numSamples = 0;
    this.finishFlag = false;
    this.finishEmitted = false;
    
    this.port.onmessage = e => {
      if (e.data) {
        this.buffers.push(e.data);
        // if the buffer is too big, delete it
        // if (this.buffers.length > audioBufferLength) {
        //   this.buffers.splice(0, this.buffers.length - audioBufferLength);
        // }
      } else {
        this.finishFlag = true;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];

    if (this.buffers.length > 0) {
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < this.buffers[0].length; i++) {
        const v = this.buffers[0][i];
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
    }
    
    let bufferIndex, frameIndex;
    for (const frames of output) {
      bufferIndex = 0;
      frameIndex = 0;

      if (bufferIndex < this.buffers.length) {
        for (let i = 0; i < frames.length; i++) {
          const buffer = this.buffers[bufferIndex];
          if (frameIndex < buffer.length) {
            // console.log('set frame', frames, buffer);
            const v = buffer[frameIndex++];
            frames[i] = v;
            // this.maxSample = Math.max(Math.abs(v), this.maxSample);
            // this.numSamples++;
          } else {
            bufferIndex++;
            frameIndex = 0;
            if (bufferIndex < this.buffers.length) {
              i--;
              continue;
            } else {
              break;
            }
          }
        }
      }
    }
    if (bufferIndex > 0) {
      this.buffers.splice(0, bufferIndex);
    }
    if (frameIndex > 0) {
      this.buffers[0] = this.buffers[0].slice(frameIndex);
      if (this.buffers[0].length === 0) {
        this.buffers.shift();
      }
    }

    /* const now = Date.now();
    const timeDiff = now - this.lastVolumeTime;
    if (timeDiff >= volumeUpdateRate) {
      const volume = this.numSamples > 0 ?
        Math.min(this.maxSample * volumeScale, 1)
      :
        0;
      this.port.postMessage(volume);

      this.lastVolumeTime = now;
      this.maxSample = 0;
      this.numSamples = 0;
    } */

    if (this.buffers.length === 0 && this.finishFlag && !this.finishEmitted) {
      this.port.postMessage({
        method: 'finish',
      });
      this.finishEmitted = true;
    }
    
    return true;
  }
}
registerProcessor('ws-output-worklet', WsOutputWorklet);