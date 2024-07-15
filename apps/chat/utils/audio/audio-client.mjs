// import {UPDATE_METHODS} from '../update-types.js';
// import {parseUpdateObject, makeId} from '../util.mjs';
// import {zbencode} from '../../../zjs/encoding.mjs';
// import {ensureAudioContext, getAudioContext} from './wsrtc/ws-audio-context.js';
import {WsMediaStreamAudioReader, OpusAudioEncoder, OpusAudioDecoder, Mp3AudioEncoder, Mp3AudioDecoder, FakeAudioData} from './ws-codec.js';
import {getEncodedAudioChunkBuffer, getAudioDataBuffer, getMp3AudioDatBuffer} from './ws-util.js';
import {makeId, makePromise} from '../util.js';

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

export function createMp3AudioOutputStream({
  audioContext,
}) {
  if (!audioContext) {
    console.log("no audio context passed");
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
    console.log('audio worklet node message', e.data);
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

  const audioDecoder = new Mp3AudioDecoder({
    sampleRate: audioContext.sampleRate,
    output: data => {
      if (data && data.data !== null) {
        // console.log('decoded data', structuredClone(data?.data), performance.now());
        data = getMp3AudioDatBuffer(data);
        // console.log('data buffer', data.buffer);
        audioWorkletNode.port.postMessage(data, [data.buffer]);
      } else {
        audioWorkletNode.port.postMessage(null);
      }
    },
    error: err => {
      console.error("mp3 audio decoder error: ",err);
    }
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
// STREAMS
//

export function createMp3DecodeTransformStream({
  sampleRate,
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