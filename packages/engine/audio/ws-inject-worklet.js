import {resample} from './resample.js';

// const maxBuffers = 16;

class WsInjectWorklet extends AudioWorkletProcessor {
  constructor(...args) {
    super(...args);

    this.buffers = [];
    this.port.onmessage = (e) => {
      const {
        method,
        args,
      } = e.data;
      switch (method) {
        case 'buffer': {
          const {
            channelData,
            sampleRate: srcSampleRate,
          } = args;
            
          const targetSampleRate = globalThis.sampleRate;
  
          if (typeof targetSampleRate !== 'number' || typeof srcSampleRate !== 'number') {
            throw new Error('invalid sample rates: ' + JSON.stringify([targetSampleRate, srcSampleRate]));
          }
  
          const resampledChannelData = Array(channelData.length);
          for (let i = 0; i < channelData.length; i++) {
            resampledChannelData[i] = resample(channelData[i], srcSampleRate, targetSampleRate);
          }

          // const resampledChannelData = channelData;
          
          this.pushBuffer({
            type: 'buffer',
            channels: resampledChannelData,
            currentSampleIndex: 0,
          });
          break;
        }
        case 'finishRequest': {
          const {
            id,
          } = args;
          this.pushBuffer({
            type: 'finishRequest',
            id,
          });
          break;
        }
        case 'clear': {
          const oldBuffers = this.buffers;
          this.buffers = [];

          // release pending finish requests
          for (let i = 0; i < oldBuffers.length; i++) {
            const buffer = oldBuffers[i];
            if (buffer.type === 'finishRequest') {
              this.#postFinishResponse(buffer);
            }
          }

          break;
        }
        default: {
          break;
        }
      }
    };
  }

  pushBuffer(buffer) {
    this.buffers.push(buffer);

    // while (this.buffers.length > maxBuffers) {
    //   this.buffers.shift();
    // }
  }

  #postFinishResponse(buffer) {
    this.port.postMessage({
      method: 'finishResponse',
      args: {
        id: buffer.id,
      },
    });
  }

  process(inputs, outputs, parameters) {
    if (outputs.length !== 1) {
      throw new Error('outputs.length !== 1');
    }
    const channels = outputs[0];
    
    // clear output
    for (const channel of channels) {
      channel.fill(0);
    }

    const getNextBuffer = () => {
      while (this.buffers.length > 0) {
        let currentBuffer = this.buffers[0];
        if (currentBuffer.type === 'buffer') {
          return currentBuffer;
        } else if (currentBuffer.type === 'finishRequest') {
          this.#postFinishResponse(currentBuffer);
          this.buffers.shift();
          continue;
        } else {
          throw new Error('invalid buffer type: ' + JSON.stringify(currentBuffer.type));
        }
      }
      return null;
    };

    let currentBuffer = getNextBuffer();
    if (currentBuffer) {
      if (channels.length !== currentBuffer.channels.length) {
        throw new Error('channels.length !== currentBuffer.channels.length: ' + JSON.stringify([channels.length, currentBuffer.channels.length]));
      }

      const numOutputSamples = channels[0].length;
      const numBufferSamples = currentBuffer.channels[0].length;
      for (let k = 0; k < numOutputSamples; k++) {
        for (let i = 0; i < channels.length; i++) {
          const outputChannel = channels[i];
          const bufferChannel = currentBuffer.channels[i];
          outputChannel[k] = bufferChannel[currentBuffer.currentSampleIndex];
        }

        currentBuffer.currentSampleIndex++;
        if (currentBuffer.currentSampleIndex >= numBufferSamples) {
          this.buffers.shift();
          currentBuffer = getNextBuffer();
          if (!currentBuffer) {
            break;
          }
        }
      }
    }
    return true;
  }
}
registerProcessor('ws-inject-worklet', WsInjectWorklet);