import {
  zbencode,
  zbdecode,
} from '../../lib/zjs/encoding.mjs';
import {
  QueueManager,
} from '../../util/queue-manager.mjs';
// import {
//   OpusDecoder,
// } from 'opus-decoder';
// import {
//   whisperTranscribe,
// } from '../clients/whisper-client.js';
import {
  transcribe,
} from '../../util/audio-perception.mjs';
// import audioBufferToWav from 'audiobuffer-to-wav';
import {
  createOpusDecodeTransformStream,
  createMp3ReadableStreamSource,
} from '../../lib/multiplayer/public/audio/audio-client.mjs';
import {
  makePromise,
  makeId,
} from '../../util/util.mjs';
import {
  discordBotEndpointUrl,
} from '../../util/endpoints.mjs';

//

export class DiscordInput {
  constructor({
    ws,
  }) {
    this.ws = ws;

    this.streamSpecs = new Map();
  }

  writeText(text) {
    const writeTextMessage = {
      method: 'writeText',
      args: {
        text,
      },
    };
    this.ws.send(JSON.stringify(writeTextMessage));
  }

  // async to wait for consumption of the stream by the discord api
  async pushStream(stream) {
    const streamId = makeId(8);

    const startVoiceMessage = {
      method: 'playVoiceStart',
      args: {
        streamId,
      },
    };
    // console.log('start voice message', {
    //   startVoiceMessage,
    // });
    this.ws.send(JSON.stringify(startVoiceMessage));

    const abortController = new AbortController();
    const {signal} = abortController;
    // const onabort = () => {
    //   const voiceAbortMessage = {
    //     method: 'playVoiceEnd',
    //     args: {
    //       streamId,
    //     },
    //   };
    //   this.ws.send(JSON.stringify(voiceAbortMessage));
    // };
    // signal.addEventListener('abort', onabort);
    // const cleanup = () => {
    //   signal.removeEventListener('abort', onabort);
    // };

    this.streamSpecs.set(streamId, {
      // stream,
      cancel() {
        abortController.abort();
      },
    });

    // signal.addEventListener('abort', () => {
    //   const voiceAbortMessage = {
    //     method: 'playVoiceAbort',
    //     args: {
    //       streamId,
    //     },
    //   };
    //   // console.log('play voice stream send abort', voiceAbortMessage);
    //   this.ws.send(JSON.stringify(voiceAbortMessage));
    // });

    const reader = stream.getReader();
    for (;;) {
      const {
        done,
        value,
      // } = await abortableRead(reader, signal);
      } = await reader.read();
      if (!done && !signal.aborted) {
        // console.log('signal read not done', !!signal.aborted);
        const uint8Array = value;
        const voiceDataMessage = {
          method: 'playVoiceData',
          args: {
            streamId,
            uint8Array,
          },
        };
        const encodedData = zbencode(voiceDataMessage);
        // console.log('play voice stream send data', voiceDataMessage, encodedData);
        // ensure the websocket is still live
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(encodedData);
        } else {
          break;
        }
      } else {
        // console.log('signal read done', !!signal.aborted);
        const voiceEndMessage = {
          method: 'playVoiceEnd',
          args: {
            streamId,
          },
        };
        // console.log('play voice stream send end', voiceEndMessage);
        this.ws.send(JSON.stringify(voiceEndMessage));
        break;
      }
    }

    // cleanup();

    this.streamSpecs.delete(streamId);
  }
  cancelStream(streamId) {
    const streamSpec = this.streamSpecs.get(streamId);
    if (streamSpec) {
      streamSpec.cancel();
    } else {
      console.warn('no stream found for streamId: ' + streamId);
    }
  }
}

//

export class DiscordOutputStream extends EventTarget {
  constructor({
    sampleRate,
    speechQueue,
  }) {
    super();

    this.sampleRate = sampleRate;
    this.speechQueue = speechQueue;

    // // XXX decode with opus, encode with mp3 instead of wav
    // this.decoder = new OpusDecoder();
    // this.chunks = [];
    // this.bufferSize = 0;

    // const loadPromise = this.decoder.ready
    //   .then(() => {});
    // this.waitForLoad = () => loadPromise;

    this.opusTransformStream = createOpusDecodeTransformStream({
      sampleRate,
    });
    this.opusTransformStreamWriter = this.opusTransformStream.writable.getWriter();

    this.mp3Source = createMp3ReadableStreamSource({
      readableStream: this.opusTransformStream.readable,
    });

    this.mp3BuffersOutputPromise = this.mp3Source.output.readAll();
  }

  update(uint8Array) {
    this.opusTransformStreamWriter.write(uint8Array);
    /* (async () => {
      await this.waitForLoad();

      const result = this.decoder.decodeFrame(uint8Array);
      const {channelData, sampleRate} = result;

      const chunk = {
        channelData,
        sampleRate,
      };
      this.chunks.push(chunk);

      const firstChannelData = channelData[0];
      this.bufferSize += firstChannelData.length;
    })(); */
  }

  async end() {
    /* await this.waitForLoad();

    let sampleRate = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (sampleRate === 0) {
        sampleRate = chunk.sampleRate;
      } else {
        if (sampleRate !== chunk.sampleRate) {
          throw new Error('sample rate mismatch');
        }
      }
    }

    // create audio buffer from chunks
    const audioBuffer = new AudioBuffer({
      length: this.bufferSize,
      sampleRate,
      numberOfChannels: 1,
    });
    let offset = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      const {channelData} = chunk;
      const firstChannelData = channelData[0];
      audioBuffer.copyToChannel(firstChannelData, 0, offset);
      offset += firstChannelData.length;
    }

    // XXX encode to MP3
    const wavBuffer = audioBufferToWav(audioBuffer);
    const wavBlob = new Blob([wavBuffer], {
      type: 'audio/wav',
    }); */

    this.opusTransformStreamWriter.close();

    const mp3Buffers = await this.mp3BuffersOutputPromise;
    const mp3Blob = new Blob(mp3Buffers, {
      type: 'audio/mpeg',
    });

    await this.speechQueue.waitForTurn(async () => {
      const text = await transcribe(mp3Blob);
      // console.log('discord transcribed', {text});
      this.dispatchEvent(new MessageEvent('speech', {
        data: text,
      }));
    });
  }

  destroy() {
    (async () => {
      await this.waitForLoad();

      this.decoder.free();
    })();
  }
}

//

export class DiscordOutput extends EventTarget {
  constructor({
    sampleRate = 48000,
  } = {}) {
    super();

    this.sampleRate = sampleRate;

    this.speechQueue = new QueueManager();

    this.streams = new Map();
  }

  pushUserTextMessage(username, text) {
    this.dispatchEvent(new MessageEvent('usermessage', {
      data: {
        username,
        text,
      },
    }));
  }

  pushStreamStart(username, streamId) {
    let stream = this.streams.get(streamId);
    if (!stream) {
      const {
        sampleRate,
        speechQueue,
      } = this;

      stream = new DiscordOutputStream({
        sampleRate,
        speechQueue,
      });
      stream.addEventListener('speech', e => {
        const text = e.data;

        this.dispatchEvent(new MessageEvent('usermessage', {
          data: {
            username,
            text,
          },
        }));
      });
      this.streams.set(streamId, stream);
    } else {
      throw new Error('stream already exists for streamId: ' + streamId);
    }
  }

  pushStreamEnd(streamId) {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.end();
      this.streams.delete(streamId);
    } else {
      throw new Error('no stream found for streamId: ' + streamId);
    }
  }

  pushStreamUpdate(streamId, uint8Array) {
    const stream = this.streams.get(streamId);
    if (stream) {
      stream.update(uint8Array);
    } else {
      throw new Error('no stream found for streamId: ' + streamId);
    }
  }

  destroy() {
    for (const stream of this.streams.values()) {
      stream.destroy();
    }
  }
}

//

export class DiscordBotClient extends EventTarget {
  token;
  ws;
  input;
  output;
  constructor({
    token,
  }) {
    super();

    this.token = token;

    this.ws = null;
    this.input = null;
    this.output = null;
  }
  async status() {
    const res = await fetch(`${discordBotEndpointUrl}/status`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    const j = await res.json();
    return j;
  }
  async connect({
    channels = [],
    userWhitelist = [],
  }) {
    const channelSpecs = channels.map((channel) => {
      if (typeof channel === 'string') {
        return channel;
      } else if (channel instanceof RegExp) {
        return channel.source;
      } else {
        throw new Error('invalid channel type: ' + JSON.stringify(channel));
      }
    });
    const u = (() => {
      const u = new URL(discordBotEndpointUrl);
      u.searchParams.set('token', this.token);
      u.searchParams.set('channels', JSON.stringify(channelSpecs));
      u.searchParams.set('userWhitelist', JSON.stringify(userWhitelist));
      return u;
    })();
    const ws = new WebSocket(u);
    ws.binaryType = 'arraybuffer';
    const connectPromise = makePromise();
    const readyPromise = makePromise();
    ws.onopen = () => {
      // console.log('opened');
      connectPromise.resolve();
    };
    ws.onmessage = e => {
      // console.log('got message', e.data);

      if (e.data instanceof ArrayBuffer) {
        const arrayBuffer = e.data;
        const uint8Array = new Uint8Array(arrayBuffer);
        const o = zbdecode(uint8Array);
        // console.log('got binary message', o);
        const {
          method,
          args,
        } = o;
        switch (method) {
          case 'voicedata': {
            const {
              // userId,
              streamId,
              uint8Array,
            } = args;
            this.output.pushStreamUpdate(streamId, uint8Array);
            break;
          }
          default: {
            console.warn('unhandled binary method', method);
            break;
          }
        }
      } else {
        const j = JSON.parse(e.data);
        const {
          method,
          args,
        } = j;
        switch (method) {
          case 'ready': {
            readyPromise.resolve();
            break;
          }
          case 'channelconnect': {
            this.dispatchEvent(new MessageEvent('channelconnect', {
              data: args,
            }));
            break;
          }
          case 'voicestart': {
            const {
              userId,
              username,
              streamId,
            } = args;
            console.log('voice start', userId, username, streamId);
            this.output.pushStreamStart(username, streamId);
            break;
          }
          case 'voiceend': {
            const {
              userId,
              streamId,
            } = args;
            console.log('voice end', userId, streamId);
            this.output.pushStreamEnd(streamId);
            break;
          }
          case 'voiceidle': {
            const {
              streamId,
            } = args;
            this.input.cancelStream(streamId);
            break;
          }
          case 'text': {
            const {
              userId,
              username,
              text,
            } = args;
            console.log('text message', {
              userId,
              username,
              text,
            });
            this.output.pushUserTextMessage(username, text);
            break;
          }
          default: {
            console.warn('unhandled json method', method);
            break;
          }
        }
      }
    };
    ws.onerror = err => {
      console.warn(err);
      connectPromise.reject(err);
    };
    this.ws = ws;

    this.input = new DiscordInput({
      ws: this.ws,
    });
    this.output = new DiscordOutput();

    await connectPromise;
    await readyPromise;
  }

  destroy() {
    this.ws && this.ws.close();
    this.output &&this.output.destroy();
  }
}