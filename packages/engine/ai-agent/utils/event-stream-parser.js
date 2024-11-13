import { createParser } from 'eventsource-parser';

//

const textDecoder = new TextDecoder();

//

function mergeDelta(source, target) {
  for (const k in source) {
    const v = source[k];
    if (v && typeof v === 'object') {
      let v2 = target[k];
      if (!v2) {
        v2 = {};
        target[k] = v2;
      }
      mergeDelta(v, v2);
    } else {
      if (typeof v === 'string') {
        if (!target[k]) {
          target[k] = '';
        }
        target[k] += v;
      } else {
        target[k] = v;
      }
    }
  }
}

//

const openaiContentFn = data => {
  const choice = data?.choices?.[0];
  if (choice) {
    return choice.delta.content;
  } else {
    console.warn('no choice', data);
  }
};
const openaiToolCallFn = (data, o) => {
  const choice = data?.choices?.[0];
  if (choice) {
    const delta = choice.delta;
    if (delta?.tool_calls) {
      mergeDelta(delta.tool_calls, o);
      return true;
    } else {
      return false;
    }
  } else {
    console.warn('no choice', data);
    return false;
  }
};
const togetherContentFn = data => data.choices[0].text;
export const modelTypeContentFns = {
  'openai': openaiContentFn,
  'together': togetherContentFn,
}
export class EventStreamParseStream extends TransformStream {
  constructor({
    contentFn = openaiContentFn,
    toolCallFn = openaiToolCallFn,
  } = {}) {
    let controller;
    const toolCalls = {};
    let hadToolCall = false;
    const eventStreamParser = createParser(event => {
      if (event.type === 'event') {
        if (event.data !== '[DONE]') { // stream data
          const data = JSON.parse(event.data);
          const {
            error,
          } = data;
          if (!error) {
            const content = contentFn(data);
            if (content) {
              controller.enqueue(content);
            }

            if (toolCallFn(data, toolCalls)) {
              hadToolCall = true;
            }
          } else {
            this.events.dispatchEvent(new MessageEvent('error', {
              data: error,
            }));
          }
        } else { // stream end
          if (hadToolCall) {
            this.events.dispatchEvent(new MessageEvent('tool_calls', {
              data: toolCalls,
            }));
          }
        }
      }
    });

    super({
      transform: (chunk, _controller) => {
        controller = _controller;

        const s = textDecoder.decode(chunk);
        eventStreamParser.feed(s);
      },
    });

    this.events = new EventTarget();
  }
}