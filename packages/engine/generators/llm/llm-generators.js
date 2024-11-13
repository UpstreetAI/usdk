import {
  aiProxyHost,
} from "../../endpoints.js";
import { getCleanJwt } from "../../utils/jwt-util.js";

const makeGenerator = (systemMessage, functions) => async (userMessage) => {
  // console.log('generator', {systemMessage, userMessage, functions}, new Error().stack);

  // if (typeof systemMessage !== 'string' || typeof userMessage !== 'string') {
  //   debugger;
  // }

  // const modelName = 'gpt-4';
  const modelName = 'gpt-4-0613';
  // const modelName = 'gpt-3.5-turbo';
  // const modelName = 'gpt-3.5-turbo-0613';

  const messages = [
    {
      role: 'system',
      content: systemMessage,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];
  const abortController = new AbortController();
  const signal = abortController.signal;

  // stream the response via server sent events (EventSource)
  const body = {
    model: modelName,
    messages,
    // stop: ['\n'],
    // temperature: 1.25,
    // stream: true,
  };
  if (functions) {
    body.functions = functions;
    body.function_call = {
      name: functions[0].name,
    };
  } else {
    body.stream = true;
  }
  const jwt = getCleanJwt();
  // console.log('body', body);
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
    const argsString = message.function_call.arguments;
    console.log('got args string', {argsString});
    try {
      const args = JSON.parse(argsString);
      const value = args[Object.keys(args)[0]];
      return value;
    } catch(err) {
      console.warn('got error parsing args string', err, 'retrying', i);
    }
  }
  throw new Error('failed to parse args string');
};

//

export const nameGenerator = makeGenerator(`\
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
]);
export const descriptionGenerator = makeGenerator(`\
You are a level describer for an anime RPG video game.
The user will enter a level name.
Respond to each message with a description of what a level with that name might look like.
Respond with only a few sentences max.
Do not respond with an empty string or a placeholder.
Try to avoid cliched tropes.
Do not repeat the name in the description.
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
          description: 'Description of the level',
          minLength: 2,
        },
      },
      required: ['levelDescription'],
    },
  },
]);
export const musicPromptGenerator = makeGenerator(`\
You are an AI music prompt generator for an anime RPG video game.
The user will enter a level name and possibly a description.
Respond to each message with a single-sentence prompt for the background music for the level.
Do not respond with an empty string or a placeholder.
You can mention the style, instruments, mood, artist, etc. Use simple words. Be literal, not poetic. Do not mention the name of the level.
If the user says nothing, make something up anyway.
`, [
  {
    name: 'respond',
    description: 'Respond to the user',
    parameters: {
      type: 'object',
      properties: {
        levelMusicPrompt: {
          type: 'string',
          description: 'AI prompt for the level music',
          minLength: 2,
        },
      },
      required: ['levelMusicPrompt'],
    },
  },
]);
export const levelImagePromptGenerator = makeGenerator(`\
You are an AI image prompt generator for an anime RPG video game.
The user will enter a level name and description.
Respond to each message with a single-sentence prompt for the visual description of the level.
Do not respond with an empty string or a placeholder.
Descrive the image, do not write instructions. Use simple words. Be literal. Do not be metaphotical or poetic. Do not mention the name of the level.
If the user says nothing, make something up anyway.
`, [
  {
    name: 'respond',
    description: 'Respond to the user',
    parameters: {
      type: 'object',
      properties: {
        levelVisualDescription: {
          type: 'string',
          description: 'Visual description of the level',
          minLength: 2,
        },
      },
      required: ['levelVisualDescription'],
    },
  },
]);
export const itemGenerator = makeGenerator(`\
You are an AI item generator for a video game.
The user will enter a level name and description.
Respond to each message with a list of RPG items that might be found in the level.
Generate 1-5 items per message.
If the user says nothing, make something up anyway.
`, [
  {
    name: 'respond',
    description: 'Respond to the user',
    parameters: {
      type: 'object',
      properties: {
        items: {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                description: 'Name of the item',
                minLength: 2,
              },
              "description": {
                "type": "string",
                description: 'Description of the item',
                minLength: 2,
              },
              "level": {
                "type": "integer",
                description: 'Level of the item. Integer between 1 and 100.',
                minimum: 1,
                maximum: 100,
              },
            },
            "required": ["name", "level", "previewImage"],
          },
          description: 'Array of item descriptions that might be found in the level',
        },
      },
      required: ['items'],
    },
  },
]);
export const itemImagePromptGenerator = makeGenerator(`\
You are an AI image describer for an anime RPG video game.
The user will enter an item name and description.
Respond to each message with a single-sentence prompt for the visual description of the item.
Do not respond with an empty string or a placeholder.
Descrive the image, do not write instructions. Use simple words. Be literal. Do not be metaphotical or poetic. Do not mention the name of the item.
If the user says nothing, make something up anyway.
`, [
  {
    name: 'respond',
    description: 'Respond to the user',
    parameters: {
      type: 'object',
      properties: {
        levelVisualDescription: {
          type: 'string',
          description: 'Visual description of the level',
          minLength: 2,
        },
      },
      required: ['levelVisualDescription'],
    },
  },
]);
export const avatarGenerator = makeGenerator(`\
You are an AI avatar generator for a video game.
The user will enter a level name and description.
Respond to each message with a list of avatars that might be found in the level.
The avatar's names should be proper names, not descriptions/titles. However, the names should match the vibe of the level.
Generate 1-3 avatars per message.
If the user says nothing, make something up anyway.
`, [
  {
    name: 'respond',
    description: 'Respond to the user',
    parameters: {
      type: 'object',
      properties: {
        avatars: {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "firstLastName": {
                "type": "string",
                description: 'Made up first and last name of the avatar',
                minLength: 2,
              },
              "gender": {
                "type": "string",
                "enum": ["male", "female"],
                description: 'Gender of the avatar'
              },
              "bio": {
                "type": "string",
                description: 'Short biography of the avatar. About a paragraph.',
                minLength: 2,
              },
            },
            "required": ["name", "gender", "bio"],
          },
          description: 'Array of item descriptions that might be found in the level',
        },
      },
      required: ['avatars'],
    },
  },
]);

/*

You are a helpful virtual scene measurement AI model. The user will input a description of an object. You will respond with a single floating point number: the typical height of the object in meters.

Do not respond with any text. Do not respond with multiple numbers. Do not respond with a range. Do not respond with anything other than the single floating point number.

*/