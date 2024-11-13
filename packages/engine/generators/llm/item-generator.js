import {
  aiProxyHost,
} from "../../endpoints.js";
import { getCleanJwt } from "../../utils/jwt-util.js";

export const keys = [
  'name',
  'description',
];

export const itemGenerator = async (o) => {
  // const modelName = 'gpt-4';
  const modelName = 'gpt-3.5-turbo';

  //

  // const missingKeys = keys.filter(k => !o[k]);

  const generateValue = async k => {
    const messages = [
      {
        role: 'system',
        content: `\
You are an item generator for an AI-powered TV show video game. You can generate items from the past, present and future. Items have the following properties:

## name
The name of the item.

## description
Description of the item.

# Instructions

Generate the name and description for the item, as asked for by the user.
`,
      },
      {
        role: 'user',
        content: `\
# Item context

${keys.map(k => {
  const v = o[k];
  return v ? `\
## ${k}
${v || ''}
` : null;
}).filter(l => l !== null).join('\n')}

# Instructions

Reply with a made-up value string for the ${JSON.stringify(k)} property of the above item context. Finish your output with a new line.
`,
      },
    ];

    //

    const abortController = new AbortController();
    const signal = abortController.signal;

    //

    const body = {
      model: modelName,
      messages,
      stop: ['\n'],
    };
    const jwt = getCleanJwt();
    const opts = {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },

      body: JSON.stringify(body),

      signal,
    };

    const numRetries = 3;
    for (let i = 0; i < numRetries; i++) {
      const response = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, opts);
      if (signal.aborted) return null;

      const json = await response.json();
      const message = json.choices[0].message;
      const {content} = message;
      return content;

      // console.log('got message', {
      //   content,
      // });
      // debugger;

      // const r = /^##\s*(.*?)\n(.*)/gm;
      // const results = {};
      // for (;;) {
      //   const match = r.exec(content);
      //   if (!match) {
      //     break;
      //   }
      //   const k = match[1];
      //   const v = match[2];
      //   results[k] = v;
      // }
      // return results;
    }
  };

  o = structuredClone(o);
  for (const k of keys) {
    if (!o[k]) {
      o[k] = await generateValue(k);
      // console.log('got v', {k, v: o[k]});
    }
  }
  return o;
};
