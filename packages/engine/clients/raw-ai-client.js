// import {
//   model,
// } from '../constants/model-constants.js';

import {
  aiProxyHost,
} from "../endpoints.js";

export class RawAiClient {
  constructor(/*{
    modelType = '',
    modelName = '',
  } = {}*/) {
    // this.modelType = modelType;
    // this.modelName = modelName;
  }
  createStream(prompt, options = {}) {
    const {
      temperature,
      top_p,
      max_new_tokens,
      repetition_penalty,
      stops,
    } = options;
    
    const ws = new WebSocket(`wss://${aiProxyHost}/api/textgen/api/v1/stream`);
    const stream = new ReadableStream({
      start(controller) {
        ws.addEventListener('open', e => {
          ws.addEventListener('message', e => {
            const s = e.data;
            const j = JSON.parse(s);

            // {"event": "text_stream", "message_num": 139, "text": "!!!!"}
            // {"event": "stream_end", "message_num": 140}

            const {
              event,
            } = j;
            switch (event) {
              case 'text_stream': {
                const {
                  text,
                } = j;
                controller.enqueue(text);
                break;
              }
              case 'stream_end': {
                // ws.close();
                controller.close();
                break;
              }
              default: {
                console.warn('unknown event', event);
              }
            }
          });

          const j = {
            prompt,
            temperature,
            top_p,
            max_new_tokens,
            repetition_penalty,
            stopping_strings: stops,
          };
          // console.log('send j', j);
          ws.send(JSON.stringify(j));
        });
        // ws.addEventListener('close', e => {
        //   console.log('ws close', e);
        // });
        ws.addEventListener('error', err => {
          console.warn('ws error', err);
        });
      },
      cancel(reason) {
        // console.log('stream cancel', reason);
        ws.close();
      },
    });
    return stream;
  }
};
