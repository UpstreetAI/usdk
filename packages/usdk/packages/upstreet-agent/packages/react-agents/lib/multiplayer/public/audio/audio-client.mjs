// import {UPDATE_METHODS} from '../update-types.js';
// import {zbencode} from '../../../zjs/encoding.mjs';
// import {ensureAudioContext, getAudioContext} from './wsrtc/ws-audio-context.js';
import {WsMediaStreamAudioReader, OpusAudioEncoder, OpusAudioDecoder, Mp3AudioEncoder, Mp3AudioDecoder, FakeAudioData} from './ws-codec.mjs';
import {getEncodedAudioChunkBuffer, getAudioDataBuffer} from './audio-util.mjs';
import { makeId, makePromise } from '../util.mjs';


//
// AUDIO OUTPUTS
//

class AudioOutput extends EventTarget {
  constructor() {
    super();

    this.live = true;
  }
  write(data) {
    this.dispatchEvent(new MessageEvent('data', {
      data,
    }));
  }
  end() {
    this.live = false;
    this.dispatchEvent(new MessageEvent('end'));
  }
  readAll() {
    return new Promise((accept, reject) => {
      const bs = [];
      if (this.live) {
        this.addEventListener('data', e => {
          bs.push(e.data);
        });
        this.addEventListener('end', () => {
          accept(bs);
        });
      } else {
        accept(bs);
      }
    });
  }
}

// opus stream -> decoded output audio node
export function createOpusAudioOutputStream({
  audioContext,
}) {
  if (!audioContext) {
    debugger;
  }

  const audioWorkletNode = new AudioWorkletNode(
    audioContext,
    'ws-output-worklet',
  );
  audioWorkletNode.addEventListener('processorerror', e => {
    console.log('audioWorkletNode processorerror', e);
  });
  audioWorkletNode.port.onmessage = e => {
    // console.log('audio worklet node message', e.data);
    const {
      method,
    } = e.data;
    switch (method) {
      case 'finish': {
        // console.log('finish', performance.now());
        audioWorkletNode.dispatchEvent(new MessageEvent('finish'));
        break;
      }
      default: {
        console.warn('opus audio stream got unknown method', method);
        break;
      }
    }
  };

  const audioDecoder = new OpusAudioDecoder({
    sampleRate: audioContext.sampleRate,
    output: data => {
      if (data) {
        // console.log('decoded data', structuredClone(data?.data), performance.now());
        data = getAudioDataBuffer(data);
        audioWorkletNode.port.postMessage(data, [data.buffer]);
      } else {
        audioWorkletNode.port.postMessage(null);
      }
    },
  });

  return {
    outputNode: audioWorkletNode,
    audioDecoder,
    write(data) {
      // console.log('decode data', structuredClone(data));
      audioDecoder.decode(data);
    },
    end() {
      // console.log('decode end');
      audioDecoder.decode(null);
    }
    // close() {
    //   audioWorkletNode.disconnect();
    //   audioDecoder.close();
    // },
  };
}

// media stream -> encoded opus audio output
export function createOpusMicrophoneSource({
  mediaStream,
  audioContext,
}) {
  // // const audioContext = await ensureAudioContext();
  if (!audioContext) {
    debugger;
  }
  // audioContext.resume();
  if (!mediaStream) {
    debugger;
  }

  const output = new AudioOutput();

  const muxAndSend = encodedChunk => {
    if (encodedChunk.data) {
      const data = getEncodedAudioChunkBuffer(encodedChunk);
      output.write(data);
    } else {
      output.end();
    }
  };
  function onEncoderError(err) {
    console.warn('encoder error', err);
  }
  const audioEncoder = new OpusAudioEncoder({
    sampleRate: audioContext.sampleRate,
    output: muxAndSend,
    error: onEncoderError,
  });

  const audioReader = new WsMediaStreamAudioReader(mediaStream, {
    audioContext,
  });
  async function readAndEncode() {
    const result = await audioReader.read();
    if (!result.done) {
      audioEncoder.encode(result.value);
      readAndEncode();
    } else {
      audioEncoder.encode(new FakeAudioData());
    }
  }
  readAndEncode();

  const id = makeId(10);

  return {
    id,
    output,
    mediaStream,
    audioReader,
    audioEncoder,
    close() {
      audioReader.cancel();
      // note: the encoder will close itself on an end packet
      // audioEncoder.close();
    },
  };
};

// media stream -> pcm (f32) audio output
export function createPcmMicrophoneSource({
  mediaStream,
  audioContext,
}) {
  // // const audioContext = await ensureAudioContext();
  if (!audioContext) {
    debugger;
  }
  // audioContext.resume();
  if (!mediaStream) {
    debugger;
  }

  const output = new AudioOutput();

  const audioReader = new WsMediaStreamAudioReader(mediaStream, {
    audioContext,
  });
  const _readLoop = async () => {
    for (;;) {
      const result = await audioReader.read();
      if (!result.done) {
        output.write(result.value.data);
      } else {
        output.end();
        break;
      }
    }
  };
  _readLoop();

  const id = makeId(10);

  return {
    id,
    output,
    mediaStream,
    audioReader,
    // audioEncoder,
    close() {
      audioReader.cancel();
      // note: the encoder will close itself on an end packet
      // audioEncoder.close();
    },
  };
};

// samples readable stream -> encoded opus audio output
export function createOpusReadableStreamSource({
  readableStream,
  // audioContext,
}) {
  // const audioContext = await ensureAudioContext();
  // if (!audioContext) {
  //   debugger;
  // }
  // audioContext.resume();
  if (!readableStream) {
    debugger;
  }

  const {sampleRate} = readableStream;
  if (!sampleRate) {
    debugger;
  }

  // create output
  const output = new AudioOutput();

  // create encoder
  const muxAndSend = encodedChunk => {
    if (encodedChunk.data) {
      const data = getEncodedAudioChunkBuffer(encodedChunk);
      output.write(data);
    } else {
      output.end();
    }
  };
  function onEncoderError(err) {
    console.warn('encoder error', err);
  }
  const audioEncoder = new OpusAudioEncoder({
    sampleRate,
    output: muxAndSend,
    error: onEncoderError,
  });

  // read the stream
  (async () => {
    const fakeAudioData = new FakeAudioData();
    const reader = readableStream.getReader();
    for (;;) {
      const {done, value} = await reader.read();
      if (!done) {
        fakeAudioData.set(value);
        audioEncoder.encode(fakeAudioData);
      } else {
        fakeAudioData.set(null);
        audioEncoder.encode(fakeAudioData);
        break;
      }
    }
  })();

  // return result
  const id = makeId(10);

  return {
    id,
    output,
    audioEncoder,
    close() {
      audioReader.cancel();
      // note: the encoder will close itself on an end packet
      // audioEncoder.close();
    },
  };
}

// samples readable stream -> encoded mp3 audio output
export function createMp3ReadableStreamSource({
  readableStream,
  // audioContext,
}) {
  // const audioContext = await ensureAudioContext();
  // if (!audioContext) {
  //   debugger;
  // }
  // audioContext.resume();
  if (!readableStream) {
    debugger;
  }

  const {sampleRate} = readableStream;
  if (!sampleRate) {
    debugger;
  }

  // create output
  const output = new AudioOutput();

  // create encoder
  const muxAndSend = encodedChunk => {
    if (encodedChunk.data) {
      const data = getEncodedAudioChunkBuffer(encodedChunk);
      output.write(data);
    } else {
      output.end();
    }
  };
  function onEncoderError(err) {
    console.warn('encoder error', err);
  }
  const audioEncoder = new Mp3AudioEncoder({
    sampleRate,
    output: muxAndSend,
    error: onEncoderError,
  });

  // read the stream
  (async () => {
    const fakeAudioData = new FakeAudioData();
    const reader = readableStream.getReader();
    for (;;) {
      const {done, value} = await reader.read();
      if (!done) {
        fakeAudioData.set(value);
        audioEncoder.encode(fakeAudioData);
      } else {
        fakeAudioData.set(null);
        audioEncoder.encode(fakeAudioData);
        break;
      }
    }
  })();

  // return result
  const id = makeId(10);

  return {
    id,
    output,
    audioEncoder,
    close() {
      audioReader.cancel();
      // note: the encoder will close itself on an end packet
      // audioEncoder.close();
    },
  };
}

// media stream -> encoded mp3 audio output
export function createMp3MicrophoneSource({
  mediaStream,
  audioContext,
}) {
  const output = new AudioOutput();

  const muxAndSend = encodedChunk => {
    if (encodedChunk.data) {
      const data = getEncodedAudioChunkBuffer(encodedChunk);
      output.write(data);
    } else {
      output.end();
    }
  };
  function onEncoderError(err) {
    console.warn('mp3 encoder error', err);
  }
  const audioEncoder = new Mp3AudioEncoder({
    sampleRate: audioContext.sampleRate,
    output: muxAndSend,
    error: onEncoderError,
  });

  const audioReader = new WsMediaStreamAudioReader(mediaStream, {
    audioContext,
  });
  async function readAndEncode() {
    const result = await audioReader.read();
    if (!result.done) {
      audioEncoder.encode(result.value);
      readAndEncode();
    } else {
      audioEncoder.encode(new FakeAudioData());
    }
  }
  readAndEncode();

  const id = makeId(10);

  return {
    id,
    output,
    mediaStream,
    audioReader,
    audioEncoder,
    close() {
      audioReader.cancel();
      // note: the encoder will close itself on an end packet
      // audioEncoder.close();
    },
  };
}

//
// DECODER STREAMS
//

export function createMp3DecodeTransformStream({
  sampleRate,
  format = 'f32',
  transferBuffers,
}) {
  if (!sampleRate) {
    debugger;
  }

  let controller;
  const donePromise = makePromise();
  const transformStream = new TransformStream({
    start: c => {
      controller = c;
    },
    transform: (chunk, controller) => {
      // console.log('decode data 1', chunk);
      audioDecoder.decode(chunk);
    },
    flush: async controller => {
      audioDecoder.decode(null);
      await donePromise;
    },
  });

  const muxAndSend = encodedChunk => {
    // console.log('decode data', encodedChunk.data);
    if (encodedChunk.data) {
      controller.enqueue(encodedChunk.data);
    } else {
      // controller.enqueue(null);
      donePromise.resolve();
    }
  };
  function onDecoderError(err) {
    console.warn('mp3 decoder error', err);
  }
  const audioDecoder = new Mp3AudioDecoder({
    sampleRate,
    format,
    transferBuffers,
    output: muxAndSend,
    error: onDecoderError,
  });

  transformStream.readable.sampleRate = sampleRate;

  return transformStream;
}

export function createOpusDecodeTransformStream({
  sampleRate,
}) {
  if (!sampleRate) {
    throw new Error('missing sample rate');
  }

  let controller;
  const donePromise = makePromise();
  const transformStream = new TransformStream({
    start: c => {
      controller = c;
    },
    transform: (chunk, controller) => {
      // console.log('decode data 1', chunk);
      audioDecoder.decode(chunk);
    },
    flush: async controller => {
      audioDecoder.decode(null);
      await donePromise;
    },
  });

  const muxAndSend = encodedChunk => {
    // console.log('decode data', encodedChunk.data);
    if (encodedChunk.data) {
      controller.enqueue(encodedChunk.data);
    } else {
      // controller.enqueue(null);
      donePromise.resolve();
    }
  };
  function onDecoderError(err) {
    console.warn('opus decoder error', err);
  }
  const audioDecoder = new OpusAudioDecoder({
    sampleRate,
    output: muxAndSend,
    error: onDecoderError,
  });

  transformStream.readable.sampleRate = sampleRate;

  return transformStream;
}

//
// ENCODER STREAMS
//

export function createMp3EncodeTransformStream({
  sampleRate,
  transferBuffers,
}) {
  if (!sampleRate) {
    debugger;
  }

  let controller;
  const donePromise = makePromise();
  const transformStream = new TransformStream({
    start: c => {
      controller = c;
    },
    transform: (chunk, controller) => {
      const audioData = new FakeAudioData();
      audioData.data = new Float32Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / Float32Array.BYTES_PER_ELEMENT);
      audioEncoder.encode(audioData);
    },
    flush: async () => {
      // console.log('flush');
      audioEncoder.encode(new FakeAudioData());
      await donePromise;
    },
  });

  // create encoder
  const muxAndSend = encodedChunk => {
    // console.log('mux and send', encodedChunk.data);
    if (encodedChunk.data) {
      const data = getEncodedAudioChunkBuffer(encodedChunk);
      // output.write(data);
      controller.enqueue(data);
    } else {
      // output.end();
      donePromise.resolve();
    }
  };
  function onEncoderError(err) {
    console.warn('encoder error', err);
  }
  const audioEncoder = new Mp3AudioEncoder({
    sampleRate,
    transferBuffers,
    output: muxAndSend,
    error: onEncoderError,
  });

  transformStream.readable.sampleRate = sampleRate;

  return transformStream;
}