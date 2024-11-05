import {OpusAudioEncoder, OpusAudioDecoder, Mp3AudioEncoder, Mp3AudioDecoder} from './ws-codec.mjs';
import {WsMediaStreamAudioReader, FakeAudioData} from './ws-codec-util.mjs';
import {AudioOutput} from './audio-classes.mjs';
import {getEncodedAudioChunkBuffer, getAudioDataBuffer} from './audio-util.mjs';

// opus stream -> decoded output audio node
export function createOpusAudioOutputStream({
  audioContext,
  codecs,
}) {
  if (!audioContext) {
    throw new Error('missing audio context');
  }
  if (!codecs) {
    throw new Error('missing codecs');
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
  codecs,
}) {
  if (!audioContext) {
    throw new Error('missing audio context');
  }
  if (!mediaStream) {
    throw new Error('missing media stream');
  }
  if (!codecs) {
    throw new Error('missing codecs');
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
    codecs,
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

  const id = crypto.randomUUID();

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

// media stream -> pcm (Float32) 48000 audio output
export function createPcmF32MicrophoneSource({
  mediaStream,
  audioContext,
}) {
  if (!audioContext) {
    throw new Error('missing audio context');
  }
  if (!mediaStream) {
    throw new Error('missing media stream');
  }

  const output = new AudioOutput();

  const audioReader = new WsMediaStreamAudioReader(mediaStream, {
    audioContext,
    sampleRate: 48000,
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

  const id = crypto.randomUUID();

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
  codecs,
}) {
  if (!readableStream) {
    throw new Error('missing readable stream');
  }
  if (!codecs) {
    throw new Error('missing codecs');
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
    codecs,
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
  const id = crypto.randomUUID();

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
  codecs,
}) {
  if (!readableStream) {
    throw new Error('missing readable stream');
  }
  if (!codecs) {
    throw new Error('missing codecs');
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
    codecs,
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
  const id = crypto.randomUUID();

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
  codecs,
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
    codecs,
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

  const id = crypto.randomUUID();

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
  codecs,
}) {
  if (!sampleRate) {
    throw new Error('missing sample rate');
  }
  if (!format) {
    throw new Error('missing format');
  }
  if (!codecs) {
    throw new Error('missing codecs');
  }

  let controller;
  const {
    promise: donePromise,
    resolve: doneResolve,
    reject: doneReject,
  } = Promise.withResolvers();
  const transformStream = new TransformStream({
    start: (c) => {
      controller = c;
    },
    transform: (chunk) => {
      // console.log('decoding data', chunk);
      audioDecoder.decode(chunk);
    },
    flush: async () => {
      audioDecoder.decode(null);
      await donePromise;
    },
  });

  const muxAndSend = encodedChunk => {
    // console.log('decoded data', encodedChunk);
    if (encodedChunk) {
      controller.enqueue(encodedChunk.data);
    } else {
      doneResolve();
    }
  };
  function onDecoderError(err) {
    console.warn('mp3 decoder error', err);
  }
  const audioDecoder = new Mp3AudioDecoder({
    sampleRate,
    format,
    codecs,
    transferBuffers,
    output: muxAndSend,
    error: onDecoderError,
  });

  transformStream.readable.sampleRate = sampleRate;
  transformStream.readable.format = format;
  transformStream.abort = (reason) => {
    transformStream.readable.cancel(reason);
    transformStream.writable.abort(reason);
    audioDecoder.close();
  };

  return transformStream;
}

export function createOpusDecodeTransformStream({
  sampleRate,
  format = 'f32',
  codecs,
}) {
  if (!sampleRate) {
    throw new Error('missing sample rate');
  }
  if (!format) {
    throw new Error('missing format');
  }
  if (!codecs) {
    throw new Error('missing codecs');
  }

  let controller;
  const {
    promise: donePromise,
    resolve: doneResolve,
    reject: doneReject,
  } = Promise.withResolvers();
  const transformStream = new TransformStream({
    start: (c) => {
      controller = c;
    },
    transform: (chunk) => {
      // console.log('decode data 1', chunk);
      audioDecoder.decode(chunk);
    },
    flush: async () => {
      audioDecoder.decode(null);
      await donePromise;
    },
  });

  const muxAndSend = encodedChunk => {
    console.log('decode data', encodedChunk.data);
    if (encodedChunk) {
      controller.enqueue(encodedChunk.data);
    } else {
      doneResolve();
    }
  };
  function onDecoderError(err) {
    console.warn('opus decoder error', err);
  }
  const audioDecoder = new OpusAudioDecoder({
    sampleRate,
    format,
    codecs,
    output: muxAndSend,
    error: onDecoderError,
  });

  transformStream.readable.sampleRate = sampleRate;
  transformStream.readable.format = format;
  transformStream.abort = (reason) => {
    transformStream.readable.cancel(reason);
    transformStream.writable.abort(reason);
    audioDecoder.close();
  };

  return transformStream;
}

export function createPcmF32TransformStream({
  sampleRate,
  format = 'f32',
}) {
  if (!sampleRate) {
    throw new Error('missing sample rate');
  }
  if (!format) {
    throw new Error('missing format');
  }

  throw new Error('not implemented');

  // let controller;
  const transformStream = new TransformStream({
    start: c => {
      controller = c;
    },
    transform: (chunk, controller) => {
      console.log('decode pcm', chunk);
      // const formatted = formatSamples(output, format, 'i16');
    },
    flush: async controller => {
      console.log('flush pcm');
      // await donePromise;
    },
  });

  transformStream.readable.sampleRate = sampleRate;
  transformStream.readable.format = format;
  transformStream.abort = (reason) => {
    transformStream.readable.cancel(reason);
    transformStream.writable.abort(reason);
  };

  return transformStream;
}

//
// ENCODER STREAMS
//

export function createMp3EncodeTransformStream({
  sampleRate,
  transferBuffers,
  codecs,
}) {
  if (!sampleRate) {
    throw new Error('missing sample rate');
  }
  if (!codecs) {
    throw new Error('missing codecs');
  }

  let controller;
  const {
    promise: donePromise,
    resolve: doneResolve,
    reject: doneReject,
  } = Promise.withResolvers();
  const transformStream = new TransformStream({
    start: (c) => {
      controller = c;
    },
    transform: (chunk) => {
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
    // console.log('mux and send', encodedChunk);
    if (encodedChunk.data) {
      const data = getEncodedAudioChunkBuffer(encodedChunk);
      // output.write(data);
      controller.enqueue(data);
    } else {
      // output.end();
      doneResolve();
    }
  };
  function onEncoderError(err) {
    console.warn('mp3 encoder error', err);
  }
  const audioEncoder = new Mp3AudioEncoder({
    sampleRate,
    transferBuffers,
    codecs,
    output: muxAndSend,
    error: onEncoderError,
  });

  transformStream.readable.sampleRate = sampleRate;
  transformStream.abort = (reason) => {
    transformStream.readable.cancel(reason);
    transformStream.writable.abort(reason);
    audioEncoder.close();
  };

  return transformStream;
}