// import {
//   model,
// } from '../constants/model-constants.js';
import { aiProxyHost } from '../endpoints.js';
import { getCleanJwt } from '../utils/jwt-util.js';
// import GPT3Tokenizer from 'gpt3-tokenizer';

class ChatGPTClient extends EventTarget {
  constructor(messages = [], handleChatCompletion) {
    super();

    this.messages = messages;
    this.#handleChatCompletion = handleChatCompletion;
  }
  #handleChatCompletion;

  export() {
    return structuredClone({
      messages: this.messages,
    });
  }
  toString() {
    return this.messages.map((m) => m.content).join('');
  }
  async send(text = 'Hello!') {
    const message = {
      role: 'user',
      content: text,
    };
    this.messages.push(message);

    const j = await this.#handleChatCompletion(this.messages);
    console.log('got j', j);
    // const res = await fetch('/api/ai/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: 'gpt-3.5-turbo',
    //     messages: this.messages,
    //   }),
    // });
    // if (res.ok) {
    //   const j = await res.json();
    // console.log('got json', j);
    const { choices } = j;
    if (choices.length > 0) {
      const { message } = choices[0];
      this.messages.push(message);

      this.dispatchEvent(
        new MessageEvent('message', {
          data: message,
        })
      );

      return message.content.trim();
    } else {
      console.warn('chatgpt error 1', j, res);
      throw new Error('chatgpt error');
    }
    // } else {
    //   console.warn('chatgpt error 2', res);
    //   throw new Error('chatgpt error');
    // }
  }
  pop(n = 1) {
    for (let i = 0; i < n; i++) {
      this.messages.pop();
    }
  }
}

/* export function makeGenerateFn() {
  async function generate(params = {}) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: 'Bearer ' + String(OPENAI_API_KEY),
      },
      body: JSON.stringify(params),
    };
    try {
      const response = await fetch(
        `https://${aiProxyHost}/api/ai/completions`,
        requestOptions
      );
      if (response.status !== 200) {
        // console.log(response.statusText);
        // console.log(response.status);
        console.log(await response.text());
        throw new Error("OpenAI API Error: " + response.status + " " + response.statusText);
      }

      const data = await response.json();
      // console.log("choices:", data);
      const {choices} = data;
      if (choices.length !== params.n) {
        throw new Error('ai api error: ' + choices.length + ' choices returned, expected ' + params.n);
      }
      if (choices.length === 0) {
        throw new Error('ai api error: no choices returned');
      } else if (choices.length === 1) {
        return choices[0].text;
      } else {
        return choices.map(c => c.text);
      }
    } catch (e) {
      console.warn('OpenAI API Error', e);
      // return "returning from error";
      throw e;
    }
  }
  async function openaiRequest(prompt, stop, opts) {
    const {
      max_tokens = 256,
      n = 1,
    } = opts ?? {};
    return await generate({
      model,
      prompt,
      stop,
      // top_p: 1,
      // frequency_penalty: needsRepetition ? 0.1 : 0.4,
      // presence_penalty: needsRepetition ? 0.1 : 0.4,
      // temperature: 0.85,
      max_tokens,
      n,
      // best_of: 1,
    });
  }
  return openaiRequest;
} */
export function makeEmbedFn() {
  async function embed(input) {
    const embeddingModel = `text-embedding-ada-002`;
    // console.log('embed ai', {input});
    const jwt = getCleanJwt();
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
        // Authorization: "Bearer " + String(OPENAI_API_KEY),
      },
      body: JSON.stringify({
        input,
        model: embeddingModel,
      }),
    };
    try {
      const response = await fetch(
        `https://${aiProxyHost}/api/ai/embeddings`,
        requestOptions
      );
      if (response.status !== 200) {
        // console.log(response.statusText);
        // console.log(response.status);
        console.log(await response.text());
        throw new Error(
          'OpenAI API Error: ' + response.status + ' ' + response.statusText
        );
      }

      const data = await response.json();
      return data?.data?.[0].embedding;
    } catch (e) {
      console.warn('OpenAI API Error', e);
      // return "returning from error";
      throw e;
    }
  }
  return embed;
}
const makeChatFn = () => {
  async function handleChatCompletion(
    messages = [{ role: 'user', content: 'Hello!' }]
  ) {
    const jwt = getCleanJwt();
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
        // Authorization: 'Bearer ' + String(OPENAI_API_KEY),
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
      }),
    };
    try {
      const response = await fetch(
        `https://${aiProxyHost}/api/ai/chat/completions`,
        requestOptions
      );
      if (response.status !== 200) {
        // console.log(response.statusText);
        // console.log(response.status);
        console.log(await response.text());
        throw new Error(
          'OpenAI API Error: ' + response.status + ' ' + response.statusText
        );
      }

      const data = await response.json();
      // console.log("chat choices:", data);
      // const {choices} = data;
      // if (choices.length !== params.n) {
      //   throw new Error('ai api error: ' + choices.length + ' choices returned, expected ' + params.n);
      // }
      return data;
      // return choices[0];
      /* if (choices.length === 0) {
        throw new Error('ai api error: no choices returned');
      } else if (choices.length === 1) {
        return choices[0].message;
      } else {
        return choices.map(c => c.text);
      } */
    } catch (e) {
      console.warn('OpenAI API Error', e);
      // return "returning from error";
      throw e;
    }
  }
  return (messages) => {
    const chat = new ChatGPTClient(messages, handleChatCompletion);
    return chat;
  };
};
export function generateChatResponse() {
  async function chat(messages) {
    const jwt = getCleanJwt();
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
      }),
    };
    try {
      const response = await fetch(
        `https://${aiProxyHost}/api/ai/chat/completions`,
        requestOptions
      );
      if (response.status !== 200) {
        console.log(await response.text());
        throw new Error(
          'OpenAI API Error: ' + response.status + ' ' + response.statusText
        );
      }
      const data = await response.json();
      return data;
    } catch (e) {
      console.warn('OpenAI API Error', e);
      throw e;
    }
  }
  return chat;
}
/* const makeTokenizeFn = () => {
  // console.log('makeTokenizeFn tokenizer', GPT3Tokenizer);
  const GPT3TokenizerCons = GPT3Tokenizer?.default ?? GPT3Tokenizer;
  const tokenizer = new GPT3TokenizerCons({
    type: 'gpt3',
  });
  function tokenize(s) {
    const encoded = tokenizer.encode(s);
    return encoded.text;
  }
  return tokenize;
}; */

const defaultModelType = 'openai';
// const defaultModelName = 'gpt-4-0613';
// const defaultModelName = 'gpt-3.5-turbo-0613';
const defaultModelName = 'gpt-3.5-turbo-16k';
export class AiClient {
  constructor({
    modelType = defaultModelType,
    modelName = defaultModelName,
  } = {}) {
    if (!modelType || !modelName) {
      debugger;
      throw new Error('ai client requires modelType and modelName');
    }

    this.modelType = modelType;
    this.modelName = modelName;

    // this.generate = makeGenerateFn();
    // this.embed = makeEmbedFn();
    // this.createChat = makeChatFn();
    // this.tokenize = makeTokenizeFn();
    // this.createResponse = generateChatResponse();
  }

  setLlmModel({ modelType, modelName }) {
    this.modelType = modelType;
    this.modelName = modelName;
  }
}
