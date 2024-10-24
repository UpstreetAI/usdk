import {
  zbencode,
  zbdecode,
} from 'zjs/encoding.mjs';
import {
  QueueManager,
} from 'queue-manager';
import {
  transcribe,
} from '../../util/audio-perception.mjs';
import {
  createOpusDecodeTransformStream,
  createMp3ReadableStreamSource,
} from 'codecs/audio-client.mjs';
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
    ws = null,
  } = {}) {
    this.ws = ws;

    this.streamSpecs = new Map();
  }

  setWs(ws) {
    this.ws = ws;
  }

  writeText(text, {
    channelId,
    userId,
  } = {}) {
    const m = {
      method: 'writeText',
      args: {
        text,
        channelId,
        userId,
      },
    };
    // console.log('send message', m);
    const s = JSON.stringify(m);
    this.ws.send(s);
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
  cancelStream(args) {
    const {
      streamId,
    } = args;
    const streamSpec = this.streamSpecs.get(streamId);
    if (streamSpec) {
      streamSpec.cancel();
    } else {
      console.warn('no stream found for streamId: ' + streamId);
    }
  }

  sendTyping({
    channelId,
    userId,
  } = {}) {
    const m = {
      method: 'sendTyping',
      args: {
        channelId,
        userId,
      },
    };
    const s = JSON.stringify(m);
    this.ws.send(s);
  }

  destroy() {
    // nothing
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

  pushText(args) {
    // const {
    //   userId,
    //   username,
    //   text,
    //   channelId,
    // } = args;
    this.dispatchEvent(new MessageEvent('text', {
      data: args,
    }));
  }

  pushStreamStart(args) {
    const {
      userId,
      username,
      channelId,
      streamId,
    } = args;
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

        this.dispatchEvent(new MessageEvent('text', {
          data: {
            userId,
            username,
            text,
            channelId,
          },
        }));
      });
      this.streams.set(streamId, stream);
    } else {
      throw new Error('stream already exists for streamId: ' + streamId);
    }
  }

  pushStreamEnd(args) {
    const {
      userId,
      streamId,
    } = args;
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
  ws = null;
  input = new DiscordInput();
  output = new DiscordOutput();
  constructor({
    token,
  }) {
    super();
    this.token = token;
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
    dms = [],
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
      const u = new URL(discordBotEndpointUrl.replace(/^http/, 'ws'));
      u.searchParams.set('token', this.token);
      u.searchParams.set('channels', JSON.stringify(channelSpecs));
      u.searchParams.set('dms', JSON.stringify(dms));
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
    ws.onclose = () => {
      console.warn('discord client closed');
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
          case 'dmconnect': {
            this.dispatchEvent(new MessageEvent('dmconnect', {
              data: args,
            }));
            break;
          }
          case 'guildmemberadd': {
            this.dispatchEvent(new MessageEvent('guildmemberadd', {
              data: args,
            }));
            break;
          }
          case 'guildmemberremove': {
            this.dispatchEvent(new MessageEvent('guildmemberremove', {
              data: args,
            }));
            break;
          }
          case 'text': {
            console.log('text message', args);
            this.output.pushText(args);
            break;
          }
          case 'voicestart': {
            console.log('voice start', args);
            this.output.pushStreamStart(args);
            break;
          }
          case 'voiceend': {
            console.log('voice end', args);
            this.output.pushStreamEnd(args);
            break;
          }
          case 'voiceidle': { // feedback that discord is no longer listening
            console.log('voice idle', args);
            this.input.cancelStream(args);
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
    this.input.setWs(ws);

    await connectPromise;
    await readyPromise;
  }

  destroy() {
    this.ws && this.ws.close();
    this.input.destroy();
    this.output.destroy();
  }
}