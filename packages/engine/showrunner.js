import {
  aiProxyHost,
} from "./endpoints.js";
import { getCleanJwt } from "./util.js";
// import {
//   EventStreamParseStream,
// } from './ai-agent/utils/event-stream-parser.js';

//

const defaultPrompt = `\
You are an AI showrunner for an anime TV show.
Your job is to generate the parts of the show that the user asks for.
Always respond with a function call.

# Plot summary
An anime about kids going on an adventure up the virtual Street while living a double life at school.
The kids live in a world of both modern technology and magic. There are strange rules in the world.
The story is emotionally impactful and moving, being relatable to kids going through tough times. It should not be afraid to tackle dark themes.
The cast is biased to characters around 13 years old, but not entirely. There should be parents, families, teachers, and other adults in the story.
The episode should be about 22 minutes in length.
The plot should be suspenseful, mysterious, and with witty plot twists.
At the end of the episode, the main character shares a strange lesson they learned, which makes the user second-guess the entire episode.
`;

//

const functions = [
  {
    name: 'generate_character',
    description: 'Generate a character',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the characteer, first and last',
          minLength: 2,
        },
        gender: {
          type: 'string',
          description: 'Gender of the character',
          minLength: 2,
        },
        age: {
          type: 'string',
          description: 'Age of the character',
          minLength: 2,
        },
        biography: {
          type: 'string',
          description: 'Bio of the character, a few paragraphs long',
          minLength: 2,
        },
        inventory: {
          type: 'array',
          description: 'Inventory of the character, e.g. a sword, a book, a phone',
          items: {
            type: 'string',
            minLength: 2,
          },
        },
        relationships: {
          type: 'object',
          description: 'Character relationships',
          properties: {
            name: {
              type: 'string',
              description: 'Related character name',
              minLength: 2,
            },
            relationship: {
              type: 'string',
              description: 'Relationship with the character, e.g. mother, friend',
              minLength: 2,
            },
          },
          required: ['name', 'relationship'],
        },
      },
      required: ['name', 'gender', 'age', 'biography', 'relationships', 'inventory'],
    },
  },
  {
    name: 'generate_episode',
    description: 'Generate an episode template',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the episode',
          minLength: 2,
        },
        tagline: {
          type: 'string',
          description: 'Tagline of the episode',
          minLength: 2,
        },
        plotSummary: {
          type: 'string',
          description: 'Plot summary of the episode, about a paragraph long',
          minLength: 2,
        },
      },
      required: ['name', 'tagline', 'plotSummary'],
    },
  },
  {
    name: 'generate_setting',
    description: 'Generate a scene location',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the location',
          minLength: 2,
        },
        description: {
          type: 'string',
          description: 'Description of the location, about a paragraph long',
          minLength: 2,
        },
        portals: {
          type: 'array',
          description: 'Names of other locations to which this location is connected',
          items: {
            type: 'string',
            minLength: 2,
          },
        }
      },
      required: ['name', 'description', 'portals'],
    },
  },
  {
    name: 'generate_subplot',
    description: `\
Generate a subplot for an episode.
There should be (A,B,C,etc) subplots for each episode.
`,
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Short name for the subplot that can be refernced later',
          minLength: 2,
        },
        summary: {
          type: 'string',
          description: 'Summary of the subplot, a few paragraphs long',
          minLength: 2,
        },
        storyBeats: {
          type: 'array',
          description: 'Short explanation of the story beat, the setting, the characters involved, and its contribution to the plot.',
          items: {
            type: 'string',
            minLength: 2,
          },
        },
      },
      required: ['name', 'summary', 'storyBeats'],
    },
  },
  {
    name: 'generate_storyboard_panel',
    description: 'Generate a storyboard panel. Storyboards should be mostly dialogue.',
    parameters: {
      type: 'object',
      properties: {
        object: {
          type: 'string',
          description: 'Focal character/object. MUST be one of the given options.',
        },
        action: {
          type: 'string',
          description: 'Action performed by the focal character/object. MUST be one of the given options.',
          enum: [
            'speak',
            // 'lookAt',
            'moveTo',
            'drop',
            'pickUp',
          ],
        },
        value: {
          "oneOf": [
            {
              "type": "object",
              "properties": {
                "dialog": {
                  "type": "string"
                }
              },
              "description": "Used when action is 'speak'"
            },
            {
              "type": "object",
              "properties": {
                "target": {
                  "type": "string"
                }
              },
              // "description": "Used when action is 'lookAt', 'moveTo'"
              "description": "Used when action is 'moveTo'"
            },
            {
              "type": "object",
              "properties": {
                "item": {
                  "type": "string"
                }
              },
              "description": "Used when action is 'drop' or 'pickUp'"
            }
          ],
          "description": "Parameter for object performing the action",
        },
      },
      required: ['target', 'action', 'argument'],
    },
  },
  {
    name: 'done',
    description: 'Signal that you are done',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

//

// const capitalize = (s) => s[0].toUpperCase() + s.slice(1);
/* const stringify = (character) => {
  const lines = [];
  for (const [key, value] of Object.entries(character)) {
    const line = `${capitalize(key)}: ${value}`;
    lines.push(line);
  }
  return lines.join('\n');
}; */

//

const makeGenerator = (systemMessage, functions, options) => async (userMessage, oldMessages = [], function_call = '') => {
  const {
    // modelName = 'gpt-4-0613',
    modelName = 'gpt-3.5-turbo-16k-0613',
  } = (options ?? {});

  const messages = [
    {
      role: 'system',
      content: systemMessage,
    },
    ...oldMessages,
    {
      role: 'user',
      content: userMessage,
    },
  ];
  const abortController = new AbortController();
  const signal = abortController.signal;

  const body = {
    model: modelName,
    messages,
    // stop: ['\n'],
    // temperature: 1.25,
    // stream: true,
  };
  if (functions) {
    body.functions = functions;
  }
  if (function_call) {
    body.function_call = {
      name: function_call,
    };
  }
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
    const content = message?.content;
    const functionName = message?.function_call?.name;
    const argsString = message?.function_call?.arguments;
    if (!functionName || !argsString) {
      console.warn('missing function call', {message, content, functionName, argsString});
      debugger;
    }
    try {
      const result = JSON.parse(argsString);
      return {
        name: functionName,
        result,
        messages: [
          ...oldMessages,
          message,
        ],
      };
    } catch (err) {
      console.warn('got error parsing args string', err, 'retrying', i);
    }
  }
  throw new Error('failed to parse args string');
};

export const makeMessage = (name, args) => {
  return {
    role: 'assistant',
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify(args),
    },
  };
};

export class Showrunner {
  constructor() {}
  async generateCharacters({
    prompt = defaultPrompt,
    messages = [],
    maxCharacters = 10,
  } = {}) {
    const characterGenerator = makeGenerator(prompt, functions);
    const characters = [];
    for (let i = 0; i < maxCharacters; i++) {
      const {
        result: newCharacter,
        messages: newMessages,
      } = await characterGenerator('Generate a character', messages, 'generate_character');
      console.log('got character', newCharacter);
      if (!newCharacter) break;
      characters.push(newCharacter);

      messages = newMessages;
    }
    return {
      characters,
      messages,
    };
  }
  async generateEpisode({
    prompt = defaultPrompt,
    messages = [],
  } = {}) {
    const episodeGenerator = makeGenerator(prompt, functions);
    const {
      result: episode,
      messages: newMessages,
    } = await episodeGenerator('Generate an episode template', messages, 'generate_episode');

    messages = newMessages;

    return {
      episode,
      messages,
    };
  }
  async generateSettings({
    prompt = defaultPrompt,
    messages = [],
    maxSettings = 8,
  } = {}) {
    const settingGenerator = makeGenerator(prompt, functions);
    const settings = [];
    for (let i = 0; i < maxSettings; i++) {
      const {
        result: newSetting,
        messages: newMessages,
      } = await settingGenerator('Generate a setting', messages, 'generate_setting');
      console.log('got setting', newSetting, messages);
      if (!newSetting) break;

      settings.push(newSetting);

      messages = newMessages;
    }

    return {
      settings,
      messages,
    };
  }
  async generatePlots({
    prompt = defaultPrompt,
    messages = [],
    count = 3,
  } = {}) {
    const plotGenerator = makeGenerator(prompt, functions);
    const plots = [];
    for (let i = 0; i < count; i++) {
      const {
        result: newPlot,
        messages: newMessages,
      } = await plotGenerator('Generate a plot', messages, 'generate_subplot');
      console.log('got plot', newPlot);
      if (!newPlot) break;

      plots.push(newPlot);

      messages = newMessages;
    }

    return {
      plots,
      messages,
    };
  }
  async generateStoryboardPanels({
    prompt = defaultPrompt,
    plot,
    messages,
  } = {}) {
    // Create the scene generator
    const storyboardPanelGenerator = makeGenerator(prompt, functions);

    // Generate storyboard panels for each story beat in the plot
    const storybardPanels = [];
    for (const storyBeat of plot.storyBeats) {
      const localStorybardPanels = [];
      let localMessags = [
        ...messages,
      ];
      for (let i = 0;; i++) {
        const {
          name,
          result: storybardPanel,
          messages: newMessages,
        } = await storyboardPanelGenerator(`\
Generate the next storyboard panel for the following story beat:
${storyBeat.name}
Signal when you are done generating all storyboard panels for this story beat`, localMessags);
        console.log('got storybard panel', i, name, storybardPanel, newMessages);
        if (name === 'done') {
          break;
        }
        if (!storybardPanel?.object) {
          continue;
        }

        localStorybardPanels.push(storybardPanel);

        localMessags = newMessages;
      }
      storybardPanels.push(localStorybardPanels);

      const s = localStorybardPanels.map(panel => {
        return `${panel.object} ${panel.action} ${(
          panel.value.dialog ??
          panel.value.target ??
          panel.value.item
        )}`;
      }).join('\n');
      console.log('finished storyboard', plot, localStorybardPanels, s);
    }
    return {
      storybardPanels,
      messages,
    };
  }
}