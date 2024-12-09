import { zodResponseFormat } from 'openai/helpers/zod';
import dedent from 'dedent';
// import Together from 'together-ai';
import { aiProxyHost } from './endpoints.mjs';
import { getAiFetch } from './ai-util.mjs';
import { defaultModel } from '../defaults.mjs';
import { NotEnoughCreditsError } from './error-utils.mjs';
import zodToJsonSchemaImpl from 'zod-to-json-schema';

const jsonParse = (s) => {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
};

const fetchChatCompletionFns = {
  openai: async ({ model, messages, format, stream, signal }, {
    jwt,
  }) => {
    if (!jwt) {
      throw new Error('no jwt');
    }

    const response_format = format && zodResponseFormat(format, 'result');

    const aiFetch = getAiFetch();
    const res = await aiFetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        // 'OpenAI-Beta': 'assistants=v1',
        Authorization: `Bearer ${jwt}`,
      },

      body: JSON.stringify({
        model,
        messages,
        response_format,
        stream,
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
  },
  anthropic: async ({ model, max_tokens, messages, format, stream, signal }, {
    jwt,
  }) => {
    if (!jwt) {
      throw new Error('no jwt');
    }

    const response_format = format && zodResponseFormat(format, 'result');
    if (response_format) {
      throw new Error('response_format not supported for anthropic');
    }

    const res = await aiFetch(`https://${aiProxyHost}/api/claude/messages`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },

      body: JSON.stringify({
        model,
        max_tokens,
        messages,
        // response_format,
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
  /* together: async ({ model, messages, format, stream, signal }, {
    jwt,
  }) => {
    if (!jwt) {
      throw new Error('no jwt');
    }

    const response_format = format && zodResponseFormat(format, 'result');

    const togetherEndpointUrl = `https://${aiProxyHost}/api/together`;
    const res = await fetch(`${togetherEndpointUrl}/chat/completions`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },

      body: JSON.stringify({
        model,
        messages,
        response_format,
        stream,
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
  },
  lambdalabs: async ({ model, messages, format, stream, signal }, {
    jwt,
  }) => {
    if (!jwt) {
      throw new Error('no jwt');
    }

    const response_format = format && zodResponseFormat(format, 'result');

    const lambdaEndpointUrl = `https://${aiProxyHost}/api/lambdalabs`;
    const res = await fetch(`${lambdaEndpointUrl}/chat/completions`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },

      body: JSON.stringify({
        model,
        messages,
        response_format,
        stream,
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
  }, */
  openrouter: async ({ model, messages, format, stream, signal }, {
    jwt,
  }) => {
    if (!jwt) {
      throw new Error('no jwt');
    }

    const o = {
      model,
      messages,
      stream,
    };
    const mode = (() => {
      if (format) {
        if (/hermes-3/.test(model)) {
          return 'prompt';
        } else {
          return 'structuredOutput';
        }
      } else {
        return 'none';
      }
    })();
    switch (mode) {
      case 'prompt': {
        // const omit = (o, keys) => {
        //   const r = {};
        //   for (const k in o) {
        //     if (!keys.includes(k)) {
        //       r[k] = o[k];
        //     }
        //   }
        //   return r;
        // };
        // const zodToJsonSchema = (schema) => {
        //   return omit(
        //     zodToJsonSchemaImpl(schema, { $refStrategy: 'none' }),
        //     [
        //       '$ref',
        //       '$schema',
        //       'default',
        //       'definitions',
        //       'description',
        //       'markdownDescription',
        //     ],
        //   );
        // };

        const jsonSchema = zodToJsonSchemaImpl(format);
        // console.log('got json schema', JSON.stringify(jsonSchema, null, 2));
        o.messages = messages.slice().concat([
          {
            role: 'user',
            content: dedent`\
              Your output must match the following JSON schema:
              \`\`\`
            ` + '\n' + JSON.stringify(jsonSchema, null, 2) + '\n' + dedent`\
              \`\`\`
            `,
          },
        ]);
        o.response_format = 'json';
        // process.exit(1);
        break;
      }
      case 'tool': {
        const jsonSchema = zodToJsonSchemaImpl(format);
        const tools = jsonSchema.properties.action.anyOf.map(schema => {
          const { type } = schema;
          if (type === 'object') {
            const name = schema.properties.method.const;
            const description = schema.description || `Execute the ${name} action`;
            const parameters = schema.properties.args;
            return {
              type: 'function',
              function: {
                name,
                description,
                parameters,
              },
            };
          } else {
            return null;
          }
        }).filter(Boolean);
        // console.log('got json schema', tools);
        o.tools = tools;
        o.tool_choice = 'required';
        break;
      }
      case 'structuredOutput': {
        const response_format = format && zodResponseFormat(format, 'result');
        o.response_format = response_format;
        break;
      }
    }

    const openrouterEndpointUrl = `https://${aiProxyHost}/api/openrouter`;
    const u = `${openrouterEndpointUrl}/chat/completions`;
    const res = await fetch(u, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },

      body: JSON.stringify(o),
      signal,
    });
    if (res.ok) {
      const j = await res.json();
      // console.log('got response content', JSON.stringify(j, null, 2));
      const contentString = j.choices[0].message.content;
      if (mode === 'prompt') {
        let content = jsonParse(contentString);
        // try to parse with the zod schema, format
        // try {
        if (content !== null) {
          content = format.parse(content);
        }
        // } catch (e) {
        //   console.error('error parsing content with zod schema', e);
        // }
        return content;
      } else {
        return contentString;
      }
    } else {
      const text = await res.text();
      throw new Error('error response in fetch completion: ' + res.status + ': ' + text);
    }
  },
};

//

export const fetchChatCompletion = async ({
  model = defaultModel,
  messages,
  stream = undefined,
  signal = undefined,
}, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const match = model.match(/^(.+?):/);
  if (match) {
    const modelType = match[1];
    const modelName = model.slice(match[0].length);
    const fn = fetchChatCompletionFns[modelType];
    if (fn) {
      const result = await fn({
        model: modelName,
        messages,
        stream,
        signal,
      }, {
        jwt,
      });
      return result;
    } else {
      throw new Error('invalid model type: ' + JSON.stringify(modelType));
    }
  } else {
    if (res.status === 402) {
      throw new NotEnoughCreditsError();
    }
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const fetchJsonCompletion = async ({
  model = defaultModel,
  messages,
  stream = undefined,
  signal = undefined,
}, format, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const match = model.match(/^(.+?):/);
  if (match) {
    const modelType = match[1];
    const modelName = model.slice(match[0].length);
    const fn = fetchChatCompletionFns[modelType];
    if (fn) {
      const result = await fn({
        model: modelName,
        messages,
        format,
        stream,
        signal,
      }, {
        jwt,
      });
      return result;
    } else {
      throw new Error('invalid model type: ' + JSON.stringify(modelType));
    }
  } else {
    if (res.status === 402) {
      throw new NotEnoughCreditsError();
    }
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};