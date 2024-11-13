import {
  aiProxyHost,
} from "../../endpoints.js";
import { getCleanJwt } from "../../utils/jwt-util.js";

export const keys = [
  'avatarName',
  'name',
  'description',
  'personality',
  'scenario',
  'firstMessage',
  'messageExample',
];

export const characterCardGenerator = async (o) => {
  // const modelName = 'gpt-4';
  const modelName = 'gpt-3.5-turbo';

  //

  // const missingKeys = keys.filter(k => !o[k]);

  const generateValue = async k => {
    const messages = [
      {
        role: 'system',
        content: `\
You are a "Tavern Character Card" generator. Tavern character cards represent a description of an AI NPC configured by the user. Character cards have the following properties:

# Tavern Characer Card Specification (v1)

## avatarName
The name of the character's avatar.

## name
Used to identify a character.

## description
Description of the character.

## personality
A short summary of the character's personality. About 2-3 sente

## scenario
The current context and circumstances to the conversation. About 1 paragraph.

## firstMessage
First message sent by the chatbot, also known as greeting. Abot 1-2 sentences.

## messageExample
Example conversations the character might be part of. Make sure to use the action character's name.
E.g.
Adrian: "Hello, how are you?"
Zoe: "I'm feeling on top of the world!"
Adrian: "I guess that's good, if you're not the world."

# Instructions

Generate the components of a character card, as asked for by the user.
`,
      },
      {
        role: 'user',
        content: `\
# Character context

${keys.map(k => {
  const v = o[k];
  return v ? `\
## ${k}
${v || ''}
` : null;
}).filter(l => l !== null).join('\n')}

# Instructions

Reply with a made-up value string for the ${JSON.stringify(k)} property of the above character context. Finish your output with a new line.
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

//

/* export const nameGenerator = makeGenerator(`\
  You are a level name generator for an anime RPG video game.
  The user will enter a level description.
  Respond to each message with a relevant, interesting, unique level name.
  Do not respond with an empty string or a placeholder.
  Do not describe the level.
  Try to avoid cliched tropes.
  If the user says nothing, make something up anyway.
  `, [
  {
    name: 'respond',
    description: 'Respond to the user',
    parameters: {
      type: 'object',
      properties: {
        levelDescription: {
          type: 'string',
          description: 'Name of the level',
          minLength: 2,
        },
      },
      required: ['levelDescription'],
    },
  },
]); */