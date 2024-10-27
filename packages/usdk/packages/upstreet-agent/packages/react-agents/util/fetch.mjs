import { zodResponseFormat } from 'openai/helpers/zod';
import { aiProxyHost } from './endpoints.mjs';
import { defaultModel } from 'react-agents/defaults.mjs';

//

const fetchers = new Map(Object.entries({
  openai: async ({
    model,
    messages,
    format,
    stream,
    max_completion_tokens,
    signal,
  }, {
    jwt,
  }) => {
    if (!jwt) {
      throw new Error('no jwt');
    }
    
    if (!format) {
      const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          // 'OpenAI-Beta': 'assistants=v1',
          Authorization: `Bearer ${jwt}`,
        },

        body: JSON.stringify({
          model,
          messages,
          stream,
          max_completion_tokens,
        }),
        signal,
      });
      if (res.ok) {
        const j = await res.json();
        const content = j.choices[0].message.content;
        return content;
      } else {
        const text = await res.text();
        throw new Error('error response in fetch completion: ' + res.status + ': ' + text);
      }
    } else {
      const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          // 'OpenAI-Beta': 'assistants=v1',
          Authorization: `Bearer ${jwt}`,
        },

        body: JSON.stringify({
          model,
          messages,

          response_format: zodResponseFormat(format, 'result'),

          stream,
        }),
        signal,
      });
      if (res.ok) {
        const j = await res.json();
        const s = j.choices[0].message.content;
        const o = JSON.parse(s);
        return o;
      } else {
        const text = await res.text();
        throw new Error('invalid status code: ' + res.status + ': ' + text);
      }
    }
  },
  anthropic: async ({
    model,
    messages,
    format,
    stream,
    max_completion_tokens,
    signal,
  }, {
    jwt,
  }) => {
    const res = await fetch(`https://${aiProxyHost}/api/anthropic/messages`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },

      body: JSON.stringify({
        model,
        max_tokens: max_completion_tokens,
        messages,
        stream,
      }),
      signal,
    });
    if (res.ok) {
      const j = await res.json();
      const text = j.content[0].text;
      return text;
    } else {
      const text = await res.text();
      throw new Error('error response in fetch completion: ' + res.status + ': ' + text);
    }
  },
  together: async ({
  }, {
    jwt,
  }) => {
    // XXX finish this
    return '';
  },
  lambda: async ({
  }, {
    jwt,
  }) => {
    // XXX finish this
    return '';
  },
  ollama: async ({
  }, {
    jwt,
  }) => {
    // XXX finish this
    return '';
  },
}));
export const fetchChatCompletion = async ({
  model = defaultModel,
  messages,
  stream,
  signal,
}, {
  jwt,
}) => {
  const match = model.match(/^(.+?):/);
  if (match) {
    const modelType = match[1];
    const modelName = model.slice(match[0].length);
    const fn = fetchers.get(modelType);
    if (fn) {
      const content = await fn({
        model: modelName,
        messages,
        stream,
        signal,
      }, {
        jwt,
      });
      return content;
    } else {
      throw new Error('invalid model type: ' + JSON.stringify(modelType));
    }
  } else {
    throw new Error('invalid model: ' + JSON.stringify(model));
  }
};

export const fetchJsonCompletion = async ({
  model = defaultModel,
  messages,
  stream,
  max_completion_tokens,
  signal,
}, format, {
  jwt,
}) => {
  const match = model.match(/^(.+?):/);
  if (match) {
    const modelType = match[1];
    const modelName = model.slice(match[0].length);
    const fn = fetchers.get(modelType);
    if (fn) {
      const content = await fn({
        model: modelName,
        messages,
        format,
        stream,
        max_completion_tokens,
        signal,
      }, {
        jwt,
      });
      return content;
    } else {
      throw new Error('invalid model type: ' + JSON.stringify(modelType));
    }
  } else {
    throw new Error('invalid model: ' + JSON.stringify(model));
  }
}