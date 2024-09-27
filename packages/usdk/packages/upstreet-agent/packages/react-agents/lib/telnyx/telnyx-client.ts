import {
  zbencode,
  zbdecode,
} from '../../lib/zjs/encoding.mjs';
// import {
//   QueueManager,
// } from '../../util/queue-manager.mjs';
// import {
//   OpusDecoder,
// } from 'opus-decoder';
// import {
//   whisperTranscribe,
// } from '../clients/whisper-client.js';
// import {
//   transcribe,
// } from '../../util/audio-perception.mjs';
// import audioBufferToWav from 'audiobuffer-to-wav';
// import {
//   createOpusDecodeTransformStream,
//   createMp3ReadableStreamSource,
// } from '../../lib/multiplayer/public/audio/audio-client.mjs';
// import {
//   makePromise,
//   makeId,
// } from '../../util/util.mjs';
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
    console.log('get status', {
      apiKey: this.apiKey,
    });
    const res = await fetch(`${telnyxEndpointUrl}/status`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
    if (res.ok) {
      const j = await res.json();
      return j as {
        phoneNumbers: string[],
      };
    } else {
      const text = await res.text();
      throw new Error('invalid status code: ' + res.status + ': ' + text);
    }
  }
  async connect({
    phoneNumbers,
  }: {
    phoneNumbers: string[],
  }) {
    const u = (() => {
      const u = new URL(telnyxEndpointUrl.replace(/^http/, 'ws'));
      u.searchParams.set('apiKey', this.apiKey);
      phoneNumbers.length > 0 && u.searchParams.set('phoneNumbers', JSON.stringify(phoneNumbers));
      return u;
    })();
    const ws = new WebSocket(u);
    ws.binaryType = 'arraybuffer';
    ws.addEventListener('message', (e) => {
      // console.log('message', e.data);

      const body = JSON.parse(e.data);
      if (body.data) {
        // if it's a webhook
        const { event_type: eventType, payload } = body.data;
        switch (eventType) {
          case 'message.received': {
            const { text, media, from, to } = payload;
            console.log('got text message', {
              text,
              media,
              from,
              to,
            });
            // const o = {
            //   method: 'message',
            //   args: {
            //     to: from.phone_number,
            //     text: text && `Reply: ${text}`,
            //     media_urls: media.map((m) => m.url),
            //   },
            // };
            break;
          }
          case 'call.initiated': {
            const callControlId = payload.call_control_id;
            console.log('got call start', {
              callControlId,
            });
            const o = {
              method: 'answerCall',
              args: {
                call_control_id: callControlId,
              },
            };
            console.log('answer call with', o);
            ws.send(JSON.stringify(o));
            break;
          }
          case 'call.answered':
          case 'call.hangup': {
            console.log('got call meta', {
              eventType,
              payload,
            });
            break;
          }
          default: {
            console.log('unhandled', eventType);
            throw new Error('unhandled: ' + eventType);
          }
        }
      } else {
        // if it's a stream
        const { event: eventType } = body;
        switch (eventType) {
          case 'media': {
            const { media } = body;
            const { chunk, payload, timestamp, track } = media;
            console.log('got media', payload);
            break;
          }
          default: {
            console.log('unhandled', eventType);
            throw new Error('unhandled: ' + eventType);
          }
        }
      }
    });
    ws.addEventListener('close', () => {
      console.log('telnyx ws closed');
    });
    this.ws = ws;

    await new Promise((resolve, reject) => {
      const handleOpen = () => {
        resolve(null);
        cleanup();
      };
      const handleClose = () => {
        reject(new Error('WebSocket connection closed'));
        cleanup();
      };
      const cleanup = () => {
        ws.removeEventListener('open', handleOpen);
        ws.removeEventListener('close', handleClose);
      };
      ws.addEventListener('open', handleOpen);
      ws.addEventListener('close', handleClose);
    });
  }
  send(text: string, mediaUrls: string[] = [], {
    fromPhoneNumber,
    toPhoneNumber,
  }: {
    fromPhoneNumber: string,
    toPhoneNumber: string,
  }) {
    const o = {
      method: 'message',
      args: {
        from: fromPhoneNumber,
        to: toPhoneNumber,
        text: text ? text : undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      },
    };
    this.ws.send(JSON.stringify(o));
  }
  call({
    toPhoneNumber,
    fromPhoneNumber,
  }: {
    toPhoneNumber: string,
    fromPhoneNumber: string,
  }) {
    console.log('call 1', {
      toPhoneNumber,
      fromPhoneNumber,
    });
    this.ws.send(
      JSON.stringify({
        method: 'call',
        args: {
          from: fromPhoneNumber,
          to: toPhoneNumber,
        },
      }),
    );
    console.log('call 2');
  }
  destroy() {
    this.ws && this.ws.close();
  }
}