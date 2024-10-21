/* this module is responsible for mapping a remote TTS endpoint to the character. */

// import Rvc from '../rvc.js';
import { aiProxyHost } from '../../util/endpoints.mjs'

//

const elevenlabsTtsModelId = 'eleven_turbo_v2_5'; // eleven_multilingual_v2
const elevenlabsStsModelId = 'eleven_english_sts_v2'; // eleven_multilingual_sts_v2

const getVoiceRequest = {
  elevenlabs: async ({ text = '', voiceId = null }, { jwt = null, signal = null }) => {
    if (!voiceId) {
      throw new Error('voiceId was not passed');
    }
    if (!jwt) {
      throw new Error('no jwt');
    }

    const baseUrl = `https://${aiProxyHost}/api/ai/text-to-speech`;
    const j = {
      text,
      model_id: elevenlabsTtsModelId,
      voice_settings: {
        stability: 0.15,
        similarity_boost: 1,
        optimize_streaming_latency: 4,
      },
      // optimize_streaming_latency: 3,
      optimize_streaming_latency: 4,
    };
    // read fetch stream
    const res = await fetch(`${baseUrl}/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
      signal,
    });
    return res;
  },
  tiktalknet: async ({ text = '', voiceId = null }, { jwt = null, signal = null }) => {
    if (!voiceId) {
      throw new Error('voiceId was not passed');
    }
    if (!jwt) {
      throw new Error('no jwt');
    }

    const baseUrl = `https://${aiProxyHost}/api/tts`;
    const u = new URL(baseUrl);
    //clean emojis and special characters from text
    text = text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '');
    text = text.replace(/[^\x00-\x7F]/g, '');
    u.searchParams.set('voice', voiceId);
    u.searchParams.set('s', text);

    // read fetch stream
    //fetch and increase timeout, set timeout to longer
    const res = await fetch(u, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      signal,
    });
    return res;
  },
};
const getVoiceStream = {
  elevenlabs: (spec, opts) => {
    // create a through stream that will be used to pipe the audio stream
    const throughStream = new TransformStream();

    const close = () => {
      throughStream.writable.getWriter().close();
    };

    // request the audio stream
    const {
      promise: loadPromise,
      resolve: loadResolve,
      reject: loadReject,
    } = Promise.withResolvers();
    (async () => {
      try {
        const res = await getVoiceRequest.elevenlabs(spec, opts);

        if (res.ok) {
          loadResolve(null);

          await res.body.pipeTo(throughStream.writable);
        } else {
          console.warn(
            'preloadElevenLabsVoiceStream error',
            res.status,
            res.statusText
          );
          close();
        }
      } catch (err) {
        console.warn(err);
        // close();
      }
    })();

    // return the through stream readable end
    // const stream = throughStream.readable.pipeThrough(
    //   createMp3DecodeTransformStream({
    //     sampleRate: opts.sampleRate,
    //   })
    // );
    // stream.waitForLoad = () => loadPromise;
    // return stream;
    const stream = throughStream.readable;
    stream.type = 'audio/mpeg';
    stream.disposition = 'audio';
    stream.waitForLoad = () => loadPromise;
    return stream;
  },
  tiktalknet: (spec, opts) => {
    // create a through stream that will be used to pipe the audio stream
    const throughStream = new TransformStream();
    // throughStream.text = opts.text;

    const close = () => {
      throughStream.writable.getWriter().close();
    };

    // request the audio stream
    const {
      promise: loadPromise,
      resolve: loadResolve,
      reject: loadReject,
    } = Promise.withResolvers();
    (async () => {
      try {
        const res = await getVoiceRequest.tiktalknet(spec, opts);

        if (res.ok) {
          loadResolve(null);

          // const start = performance.now();
          await res.body.pipeTo(throughStream.writable);
          // const end = performance.now();
          // console.log('tiktalknet took', end - start, 'ms');
        } else {
          console.warn('tiktalknet error', res.status, res.statusText);
          close();
        }
      } catch (err) {
        console.warn(err);
        // close();
      }
    })();

    // return the through stream readable end
    // const stream = throughStream.readable.pipeThrough(
    //   createMp3DecodeTransformStream({
    //     sampleRate: opts.sampleRate,
    //   })
    // );
    // stream.isMp3Stream = true;
    // stream.waitForLoad = () => loadPromise;
    // return stream;
    const stream = throughStream.readable;
    stream.type = 'audio/mpeg';
    stream.disposition = 'audio';
    stream.waitForLoad = () => loadPromise;
    return stream;
  },
  openai: (spec, opts) => {
    const text = spec.text ?? '';
    const voiceId = spec.voiceId ?? 'nova';
    const signal = opts.signal ?? null;
    const jwt = opts.jwt ?? null;
    if (!jwt) {
      throw new Error('no jwt');
    }

    const throughStream = new TransformStream();
    // throughStream.text = opts.text;

    const close = () => {
      throughStream.writable.getWriter().close();
    };

    const {
      promise: loadPromise,
      resolve: loadResolve,
      reject: loadReject,
    } = Promise.withResolvers();
    (async () => {
      const u = `https://${aiProxyHost}/api/ai/audio/speech`;
      const j = {
        model: 'tts-1',
        // "input": "Today is a wonderful day to build something people love!",
        input: text,
        // "voice": "alloy"
        voice: voiceId,
      };
      const res = await fetch(u, {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${opts.apiKey}`,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(j),
        signal,
      });
      if (res.ok) {
        loadResolve(null);

        await res.body.pipeTo(throughStream.writable);
      } else {
        console.warn('openai error', res.status, res.statusText);
        close();
      }
    })();

    // return the through stream readable end
    // const stream = throughStream.readable.pipeThrough(
    //   createMp3DecodeTransformStream({
    //     sampleRate: opts.sampleRate,
    //   })
    // );
    // stream.isMp3Stream = true;
    // stream.waitForLoad = () => loadPromise;
    // return stream;
    const stream = throughStream.readable;
    stream.type = 'audio/mpeg';
    stream.disposition = 'audio';
    stream.waitForLoad = () => loadPromise;
    return stream;
  },
};
const getVoiceConversionRequest = {
  elevenlabs: async ({ blob, voiceId = null }, { jwt = null, signal = null }) => {
    if (!blob) {
      throw new Error('blob was not passed');
    }
    if (!voiceId) {
      throw new Error('voiceId was not passed');
    }
    if (!jwt) {
      throw new Error('no jwt');
    }

    const baseUrl = `https://${aiProxyHost}/api/ai/speech-to-speech`;
    const fd = new FormData();
    fd.append('audio', blob);
    fd.append('model_id', elevenlabsStsModelId);
    fd.append('voice_settings', JSON.stringify({
      stability: 0.15,
      similarity_boost: 1,
    }));
    // read fetch stream
    const res = await fetch(`${baseUrl}/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: fd,
      signal,
    });
    return res;
  },
};
export const getVoiceConversionStream = {
  elevenlabs: (spec, opts) => {
    // create a through stream that will be used to pipe the audio stream
    const throughStream = new TransformStream();

    const close = () => {
      throughStream.writable.getWriter().close();
    };

    // request the audio stream
    const {
      promise: loadPromise,
      resolve: loadResolve,
      reject: loadReject,
    } = Promise.withResolvers();
    (async () => {
      try {
        const res = await getVoiceConversionRequest.elevenlabs(spec, opts);

        if (res.ok) {
          loadResolve(null);

          await res.body.pipeTo(throughStream.writable);
        } else {
          console.warn(
            'preloadElevenLabsVoiceStream error',
            res.status,
            res.statusText
          );
          close();
        }
      } catch (err) {
        console.warn(err);
        // close();
      }
    })();

    const stream = throughStream.readable;
    stream.type = 'audio/mpeg';
    stream.waitForLoad = () => loadPromise;
    return stream;
  },
};
/* export const getVoiceChangeRequest = ({ audioBlob, voiceId, jwt = null }) => {
  if (!jwt) {
    throw new Error('no jwt');
  }
  const baseUrl = `https://${aiProxyHost}/api/ai/speech-to-speech`;
  const u = `${baseUrl}/${voiceId}/stream`;

  const fd = new FormData();
  fd.append('audio', audioBlob);

  const res = fetch(u, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: fd,
  });
  return res;
}; */
/* const preloadElevenLabsVoiceMessage = (text, voiceEndpointVoicer) => {
  const loadPromise = (async () => {
    const baseUrl = 'https://api.elevenlabs.io/v1/text-to-speech';
    const j = {
      text,
      voice_settings: {
        stability: 0.15,
        similarity_boost: 1,
        // optimize_streaming_latency: 4,
      },
      optimize_streaming_latency: 3,
      // optimize_streaming_latency: 4,
    };
    let res;
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        res = await fetch(`${baseUrl}/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(j),
        });
      } catch (err) {
        // nothing
      }
    }
    const arrayBuffer = await res.arrayBuffer();
    
    const audioBuffer = await voiceEndpointVoicer.loadAudioBufferFromArrayBuffer(arrayBuffer);
    return audioBuffer;
    // const mp3Blob = await res.blob();
    // const audio = new Audio();
    // audio.src = URL.createObjectURL(mp3Blob);
    // audio.play();

    // // wait for audio to finish
    // await new Promise((accept, reject) => {
    //   audio.addEventListener('ended', accept, {once: true});
    //   audio.addEventListener('error', reject, {once: true});
    // });
  })();

  return {
    isPreloadMessage: true,
    waitForLoad() {
      return loadPromise;
    },
  };
}; */

//

export class VoiceEndpoint {
  #getVoiceStreamFn;
  #getVoiceConversionStreamFn;
  #voiceId;
  constructor({
    getVoiceStreamFn,
    getVoiceConversionStreamFn,
    voiceId,
  }) {
    this.#getVoiceStreamFn = getVoiceStreamFn;
    this.#getVoiceConversionStreamFn = getVoiceConversionStreamFn;
    this.#voiceId = voiceId;
  }
  getVoiceStream(text, opts) {
    return this.#getVoiceStreamFn(
      {
        text,
        voiceId: this.#voiceId,
      },
      opts
    );
  }
  getVoiceConversionStream(blob, opts) {
    return this.#getVoiceConversionStreamFn(
      {
        blob,
        voiceId: this.#voiceId,
      },
      opts
    );
  }
}
export class AutoVoiceEndpoint extends VoiceEndpoint {
  constructor({ model, voiceId }) {
    const getVoiceStreamFn = getVoiceStream[model];
    const getVoiceConversionStreamFn = getVoiceConversionStream[model];
    super({
      getVoiceStreamFn,
      getVoiceConversionStreamFn,
      voiceId,
    });
  }
}
/* export class ElevenLabsVoiceEndpoint extends VoiceEndpoint {
  constructor({ voiceId }) {
    super(getVoiceStream.elevenlabs, voiceId);
  }
} */
/* export class TiktalknetVoiceEndpoint extends VoiceEndpoint {
  constructor({ voiceId }) {
    super(getVoiceStream.tiktalknet, voiceId);
  }
} */

//

/* const streamMp3 = async (stream, opts) => {
  const signal = opts?.signal;
  const audioInjectWorkletNode = opts?.audioInjectWorkletNode;
  if (!stream || !signal || !audioInjectWorkletNode) {
    debugger;
    throw new Error('invalid arguments');
  }

  const decoder = new MPEGDecoder();
  await decoder.ready;

  const abort = e => {
    audioInjectWorkletNode.port.postMessage({
      method: 'clear',
      args: {},
    });
  };
  signal.addEventListener('abort', abort);

  let firstPush = true;
  await new Promise((accept, reject) => {
    const reader = stream.getReader();

    const pushAudioBuffer = ({
      buffer,
      sampleRate,
    }) => {
      if (firstPush) {
        firstPush = false;
        opts.onStart?.();
      }

      const channelData = [
        buffer,
      ];
      audioInjectWorkletNode.port.postMessage({
        method: 'buffer',
        args: {
          channelData,
          sampleRate,
        },
      });
    };
    const read = async () => {
      const {
        done,
        value,
      } = await abortableRead(reader, signal);
      if (signal.aborted) {
        accept();
        return;
      }

      if (done) {
        await audioInjectWorkletNode.waitForFinish();
        accept();
      } else {
        const {
          channelData,
          sampleRate,
        } = decoder.decode(value);

        const firstChannelData = channelData[0]; // Float32Array
        if (firstChannelData.length > 0) {
          pushAudioBuffer({
            buffer: firstChannelData,
            sampleRate,
          });
        }

        read();
      }
    };
    read();
  });

  opts?.onEnd?.();

  signal.removeEventListener('abort', abort);

  decoder.free();
}; */
const startStream = async (stream, opts) => {
  const { sampleRate } = stream;
  if (!sampleRate) {
    debugger;
  }
  const signal = opts.signal;
  const audioInjectWorkletNode = opts?.audioInjectWorkletNode;
  if (!stream || !signal || !audioInjectWorkletNode) {
    debugger;
    throw new Error('invalid arguments');
  }

  // on abort, cancel output immediately
  signal.addEventListener('abort', () => {
    audioInjectWorkletNode.clear();
  });

  const reader = stream.getReader();
  opts?.onStart?.();

  for (;;) {
    const { done, value } = await reader.read();
    // console.log('voice read', {done, value});
    if (!done) {
      const channelData = [value];
      audioInjectWorkletNode.port.postMessage(
        {
          method: 'buffer',
          args: {
            channelData,
            sampleRate,
          },
        },
        [value.buffer]
      );
    } else {
      await audioInjectWorkletNode.waitForFinish();
      opts?.onEnd();
      break;
    }
  }
};

export class VoiceEndpointVoicer {
  constructor({ voiceEndpoint, /*sampleRate, */ jwt }) {
    if (!voiceEndpoint /*|| !sampleRate*/) {
      console.warn('VoiceEndpointVoicer bad args', {
        voiceEndpoint,
        sampleRate,
        // audioManager,
      });
      debugger;
    }

    this.voiceEndpoint = voiceEndpoint;
    // this.sampleRate = sampleRate;
    this.jwt = jwt;
    // this.audioManager = audioManager;

    // this.running = false;
    // this.queue = [];
    // this.cancel = null;
    // this.endPromise = null;
  }
  // setVolume(value) {
  //   this.audioManager.setVolume(value);
  // }
  getVoiceStream(text, opts) {
    return this.voiceEndpoint.getVoiceStream(text, {
      // sampleRate: this.sampleRate,
      jwt: this.jwt,
      ...opts, // signal
      // sampleRate: this.audioManager.audioContext.sampleRate,
    });
  }
  getVoiceConversionStream(blob, opts) {
    return this.voiceEndpoint.getVoiceConversionStream(blob, {
      // sampleRate: this.sampleRate,
      jwt: this.jwt,
      ...opts, // signal
      // sampleRate: this.audioManager.audioContext.sampleRate,
    });
  }
  /* async start(stream, opts) {
    throw new Error('needs to be reimplemented in a different class with an audioManager and sampleRate');

    // let stream;
    // if (text instanceof ReadableStream) {
    //   stream = text;
    // } else {
    //   stream = this.getStream(text, opts);
    // }
    await startStream(stream, opts);
  } */
  // static streamMp3 = streamMp3;
  static startStream = startStream;
}
