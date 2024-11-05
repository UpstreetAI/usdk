import {
  telnyxEndpointUrl,
} from '../../util/endpoints.mjs';

//

export type TelnyxMessageArgs = {
  fromPhoneNumber: string;
  toPhoneNumber: string;
  text: string;
  media: object[],
};
export type TelnyxVoiceArgs = {
  fromPhoneNumber: string;
  toPhoneNumber: string;
  data: Uint8Array;
};
type CallSpec = {
  fromPhoneNumber: string,
  toPhoneNumber: string,
  metadata?: any,
};

//

export const getTelnyxCallConversationHash = ({
  fromPhoneNumber,
  toPhoneNumber,
}: {
  fromPhoneNumber: string,
  toPhoneNumber: string,
}) => `telnyx:call:${fromPhoneNumber}:${toPhoneNumber}`;

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
    phoneNumber,
  }: {
    phoneNumber?: string,
  } = {}) {
    const u = (() => {
      const u = new URL(telnyxEndpointUrl.replace(/^http/, 'ws'));
      u.searchParams.set('apiKey', this.apiKey);
      phoneNumber && u.searchParams.set('phoneNumber', phoneNumber);
      return u;
    })();
    const ws = new WebSocket(u);
    ws.binaryType = 'arraybuffer';
    const calls = new Map<string, CallSpec>(); // call_control_id -> CallSpec
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
            const fromPhoneNumber = from.phone_number;
            const toPhoneNumber = to[0].phone_number;
            this.dispatchEvent(
              new MessageEvent<TelnyxMessageArgs>('message', {
                data: {
                  fromPhoneNumber,
                  toPhoneNumber,
                  text,
                  media,
                },
              })
            );
            break;
          }
          case 'call.initiated': {
            const callControlId = payload.call_control_id;
            let from = '';
            let to = '';
            if (payload.direction === 'incoming') {
              from = payload.to;
              to = payload.from;
            } else if (payload.direction === 'outgoing') {
              from = payload.from;
              to = payload.to;
            } else {
              console.warn('unhandled direction: ' + JSON.stringify(payload.direction));
              throw new Error('unhandled direction: ' + JSON.stringify(payload.direction));
            }
            console.log('got call start', {
              callControlId,
              from,
              to,
            });
            const o = {
              method: 'answerCall',
              args: {
                from,
                to,
                call_control_id: callControlId,
              },
            };
            console.log('answer call with', o);
            ws.send(JSON.stringify(o));
            break;
          }
          case 'call.answered': {
            console.log('got call.answered', {
              eventType,
              payload,
            });
            const {
              call_control_id,
              client_state,
            } = payload;
            const j = JSON.parse(atob(client_state));
            const callSpec: CallSpec = {
              fromPhoneNumber: j.from,
              toPhoneNumber: j.to,
            };
            calls.set(call_control_id, callSpec);
            break;
          }
          case 'call.hangup': {
            console.log('got call.hangup', {
              eventType,
              payload,
            });
            const {
              call_control_id,
            } = payload;
            if (calls.has(call_control_id)) {
              calls.delete(call_control_id);
            } else {
              console.warn('no call spec for call_control_id: ' + call_control_id);
            }
            break;
          }
          default: {
            console.log('unhandled webhook event: ' + JSON.stringify(eventType));
            throw new Error('unhandled webhook event: ' + JSON.stringify(eventType));
          }
        }
      } else {
        // if it's a stream
        const { event: eventType } = body;
        switch (eventType) {
          case 'start': {
            console.log('stream start', body);
            // bind the stream to the call
            const {
              start,
              stream_id,
            } = body;
            const {
              call_control_id,
            } = start;
            const callSpec = calls.get(call_control_id);
            if (callSpec) {
              callSpec.metadata = {
                stream_id,
              };
            } else {
              console.warn('no call spec for call_control_id: ' + call_control_id);
            }
            break;
          }
          case 'media': {
            // console.log('media', body);
            const { stream_id, media } = body;
            const { chunk, payload, timestamp, track } = media;

            // find the matching call spec
            let callSpec: CallSpec | undefined;
            for (const cs of calls.values()) {
              if (cs.metadata?.stream_id === stream_id) {
                callSpec = cs;
                break;
              }
            }
            if (callSpec) {
              const {
                fromPhoneNumber,
                toPhoneNumber,
              } = callSpec;
              const buffer = Buffer.from(payload, 'base64');
              const uint8Array = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
              const o = {
                fromPhoneNumber,
                toPhoneNumber,
                data: uint8Array,
              };
              console.log('dispatch voice', o);
              this.dispatchEvent(
                new MessageEvent<TelnyxVoiceArgs>('voice', {
                  data: o,
                })
              );
            } else {
              console.warn('no call spec for stream_id: ' + stream_id);
            }
            break;
          }
          default: {
            console.warn('unhandled stream event: ' + JSON.stringify(eventType));
            throw new Error('unhandled stream event: ' + JSON.stringify(eventType));
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
  text(text: string | undefined, mediaUrls: string[] | undefined, {
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
        media_urls: mediaUrls?.length > 0 ? mediaUrls : undefined,
      },
    };
    console.log('send text to ws', o);
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