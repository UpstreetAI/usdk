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
  telnyxEndpointUrl,
} from '../../util/endpoints.mjs';

//

export class TelnyxClient extends EventTarget {
  apiKey: string;
  ws: WebSocket | null = null;
  constructor({
    apiKey,
  }) {
    super();
    this.apiKey = apiKey;
  }
  async status() {
    const res = await fetch(`${telnyxEndpointUrl}/status`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
    const j = await res.json();
    return j as {
      phoneNumbers: string[],
    };
  }
  async connect({
    phoneNumbers,
  }: {
    phoneNumbers: string[],
  }) {
    const u = (() => {
      const u = new URL(telnyxEndpointUrl.replace(/^http/, 'ws'));
      u.searchParams.set('apiKey', this.apiKey);
      u.searchParams.set('phoneNumbers', JSON.stringify(phoneNumbers));
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
          /* case 'voicedata': {
            const {
              // userId,
              streamId,
              uint8Array,
            } = args;
            this.output.pushStreamUpdate(streamId, uint8Array);
            break;
          } */
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
          /* case 'ready': {
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
          } */
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

    await connectPromise;
    await readyPromise;
  }

  send(text: string, {
    callId,
  }: {
    callId: string,
  }) {
    // XXX finish this
  }

  destroy() {
    this.ws && this.ws.close();
  }
}