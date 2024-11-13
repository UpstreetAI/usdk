// import TimeAgo from 'javascript-time-ago';
// import en from 'javascript-time-ago/locale/en';
// import {
//   Fountain,
// } from 'fountain-js';

import {
  jsonParse,
  shuffle,
  // cleanLowercase,
  uniqueArray,
  underline,
} from '../../../../util.js';
// import {
//   aiProxyHost,
// } from '../../endpoints.js';
import {
  Message,
} from '../../message.js';
// import {
//   Lore,
// } from './lore.js';
// import {
//   getParsedMessagesFromString,
// } from './runtime/story-message-runtime.jsx';
// import {
//   StoryMessage,
// } from './story-message.js';
import StoryMessageRuntime from './story-message-runtime.jsx';
import {
  fetchChatCompletion,
} from '../../../../utils/fetch.js';
import {
  aiModelModes,
  choicesModes,
} from '../../../../managers/story/story-manager.js';
import {
  EventStreamParseStream,
  modelTypeContentFns,
} from '../../../../ai-agent/utils/event-stream-parser.js';

// import {
//   createThread,
//   // createThreadAndRun,
//   pushThreadMessage,
//   continueThread,
// } from '../../agent-threads.js';
import {
  Completion,
} from '../../completion.js';
// import {
//   embed,
// } from '../../embedding.js';
// import {
//   advanceModeExecuteFilterFns,
// } from '../story/story-manager.js';
// import {
//   QueueManager,
// } from '../../managers/queue/queue-manager.js'
// import {
//   createAssistant,
// } from '../../agents.js';
// import { ReadWriteQueueManager } from '../queue/queue-manager.js';

//

// TimeAgo.addDefaultLocale(en);
// const timeAgo = new TimeAgo('en-US');

// const maxNumRetries = 5;
// const fakeMessages = [
//   `Hey, what's up?`,
//   `Wanna come over to my place?`,
//   `Have you heard the news?`,
// ];

/* export const showrunnerInspiration = `\
You are inspired by Dan Harmon's story circle.
The steps of the story circle are:
1. You - A character in their zone of comfort
2. Need - wants something
3. Go! - so they enter an unfamiliar situation
4. Struggle - to which they have to adapt
5. Find - in order to get what they want
6. Suffer - yet they have to make a sacrifice
7. Return - before they return to their familiar situation
8. Change - having changed fundamentally
(And then we repeat the cycle again)

Additionally, you are inspired by Trey Parker and Matt Stone of South Park.
Each story beat should imply the next, as in this happens, therefore this happens, but this happens, therefore this happens.
`; */

//

export class StoryCompleter extends EventTarget {
  constructor({
    messages = [],
    loreManager,
    critic,
  }) {
    super();

    if (!loreManager) {
      console.warn('missing arguments', {
        loreManager,
        critic,
      });
      debugger;
    }

    this.isStoryCompleter = true;

    this.#messages = messages;
    this.#loreManager = loreManager;
    this.#messageRuntime = messageRuntime;
    this.#critic = critic;

    // this.#listen();
  }
  #messages;
  #loreManager;
  #messageRuntime;
  #critic;

  #getInstructions() {
    const lore = this.#loreManager.getLore();
    const actors = lore.getActors();
    const characterActors = actors.filter(a => a.type === 'character');
    const objectActors = actors.filter(a => a.type === 'object');

    let locationNames = lore.getLocations().map(l => l.name);
    if (locationNames.length === 0) {
      locationNames = ['Location name'];
    }
    let characterNames = characterActors.map(a => a.spec.name);
    if (characterNames.length === 0) {
      characterNames = ['Firstname Lastname'];
    }
    let objectNames = objectActors.map(a => a.spec.name);
    if (objectNames.length === 0) {
      objectNames = ['Character or prop name'];
    }

    // let candidateMessageTypesArray = (characterActors.concat(objectActors)).length > 1 ?
    //   messageTypesArray.slice()
    // :
    //   messageTypesArray.filter(messageType => !messageType.targetArgRequired);
    // const {storyManager} = this.#engine;
    
    // if (storyManager.storyChoices.getModeIndex() < choicesModes.indexOf('None')) {
    //   candidateMessageTypesArray.concat(messageTypesAux['choice point']);
    // }

    // const defaultNumExamples = 5;

return `\
You are Script Fountain a specialized GPT designed to write scripts in the Fountain scriptwriting format. It is knowledgeable about fundamental and advanced rules of this format:

# Fountain screenwriting format
The golden rule of Fountain is simple: make it look like a screenplay. But if you’d like a little more guidance than that, here are some very simple syntax rules to remember:

- Scene Headings start with INT, EXT, and the like.
- Character names are in UPPERCASE.
- Character name, newline, then Dialogue.
- Parentheticals are wrapped in (parentheses).
- Transitions end in \`TO:\`

Those are the basics. If you want to get a little more advanced:
- Anything can be a Scene Heading, just start it with a period.
- To make any line a Transition, start it with a greater-than symbol.
- [@User] comments are ignored and are useful for notes.

# Fountain screenwriting format example
\`\`\`
INT. LOCATION - TIME OF DAY

CHARACTER A enters the scene.
CHARACTER B follows behind.

CHARACTER A
Hi, CHARACTER B!

Hi, CHARACTER B!
(waving)
Oh, hi CHARACTER A!

[@username] The characters should go home.
\`\`\`

Wrap Fountain scripts in code blocks (\`\`\`). Dialogue lines must always user the character's full name, without abbreviations. Focus on maintaining screenplay structure, writing scripts containing strong character development and dialogue, while adhering to standard scriptwriting practices and avoiding common mistakes like overwriting or breaking screenplay format.

The majority of lines should be dialogue; avoid long descriptions. There should be NO NARRTOR VO unless the user explicitly lists the narrator as a character.

Continue an existing script if asked to do so. If you cannot fulfill a request, do not apologize, instead write the script in a different way.
`;

    /* return `\
Script Fountain is designed to assist users in writing scripts using the Fountain scriptwriting format. It is knowledgeable about fundamental and advanced rules of this format.

The golden rule of Fountain is simple: make it look like a screenplay. But if you’d like a little more guidance than that, here are some very simple syntax rules to remember:

Scene Headings start with INT, EXT, and the like.
Character names are in UPPERCASE.
Dialogue comes right after Character.
Parentheticals are wrapped in (parentheses).
Transitions end in TO:
Those are the basics. If you want to get a little more advanced:

Anything can be a Scene Heading, just start it with a period.
To make any line a Transition, start it with a greater-than symbol.

It focuses on maintaining screenplay structure, helping with character development, dialogue, and scene descriptions, while adhering to standard scriptwriting practices and avoiding common mistakes like overwriting or breaking screenplay format. It encourages creativity while keeping the screenplay coherent and professionally formatted.

Before providing script output, Script Fountain will always wrap the Fountain script content in code blocks (\`\`\`) to maintain formatting.
`; */

/*
${objectMessageTypesArray.length > 0 ? `\
${underline('Object actor actions API')}

${objectMessageTypesArray.map(type => `\
\`\`\`${type.name}\`\`\`
${type.description}
Ex:
\`\`\`
${type.example({
  characterNames,
  objectNames,
  messages: sampleMessages,
})}
\`\`\`
${(() => {
  if (type.args) {
    const args = type.args();
    if (args) {
      return args.map((args2, i) => `\
arg${i + 1} = (${args2.join('|')})
`).join('');
    } else {
      return '';
    }
  } else {
    return '';
  }
})()}\
`).join('\n')}\
` : ''}\
*/

// ## Additional requirements
// Chracters must follow their personality. They should demonstrate that they can have an interesting and accurate conversation on any topic.
// Characters in the script should not repeat themselves. If they have already said something, they should say something new instead.
// The conversation between characters should be intimate, informal, and natural -- e.g. characters should not refer to each others by proper names.
// Remember, DO NOT reply with anything other than AvatarML. No comments, no questions, no other text.
  }

  getMessages() {
    return this.#messages;
  }

  /* async startInspectPlayerMessage({
    localPlayerId,
    playerId,
  }, opts) {
    const lore = this.#loreManager.getLore();
    const localPlayerSpec = lore.getActorById(localPlayerId);
    const remotePlayerSpec = lore.getActorById(playerId);

    const messageRaw = {
      role: 'user',
      content: `\
${localPlayerSpec.spec.name} starts a conversation with ${remotePlayerSpec.spec.name}
Make the response something that is likely to lead to an interesting conversation.
`,
    };
    const triggerMessage = Message.fromRaw(messageRaw, this)
    const completionMessage = await this.#getCompletion([], triggerMessage.getRaw(), opts);
    if (completionMessage) {
      // this.startMessage(completionMessage);
      return completionMessage;
    } else {
      console.warn('failed to get completion message');
    }
  }
  async getInspectTargetMessage({
    localPlayerId,
    targetActor,
  }, opts) {
    const lore = this.#loreManager.getLore();
    const localPlayerSpec = lore.getActorById(localPlayerId);

    const messageRaw = {
      role: 'user',
      content: `\
${localPlayerSpec.spec.name} comments on ${targetActor.spec.name}
`,
    };
    const triggerMessage = Message.fromRaw(messageRaw, this);
    const completionMessage = await this.#getCompletion([], triggerMessage.getRaw(), opts);
    if (completionMessage) {
      // this.startMessage(completionMessage);
      return completionMessage;
    } else {
      console.warn('failed to get completion message');
    }
  } */
  /* async inspectSelf() {
    const loreManager = this.#loreManager;
    const {
      playersManager,
    } = loreManager;
    const lore = loreManager.getLore();
    const localPlayer = playersManager.getLocalPlayer();
    const localPlayerSpec = lore.getActorById(localPlayer.playerId);

    const messageRaw = {
      role: 'user',
      content: `\
${localPlayerSpec.spec.name} thinks to themselves a new topic in line with their personality.
`,
    };
    const completionMessage = await this.#getCompletion(messageRaw);
    if (completionMessage) {
      return completionMessage;
    } else {
      console.warn('failed to get completion message');
    }
  }
  async inspectTarget(sourceActor, targetActor) {
    const messageRaw = {
      role: 'user',
      content: `\
${sourceActor.spec.name} interacts with ${targetActor.spec.name}
`,
    };
    const completionMessage = await this.#getCompletion(messageRaw);
    if (completionMessage) {
      return completionMessage;
    } else {
      console.warn('failed to get completion message');
    }
  } */

  /* #makeExampleOpts() {
    const lore = this.#loreManager.getLore();
    const actors = lore.getActors();

    //

    const characterActorsArray = actors.filter(actor => actor.type === 'character');
    const objectActorsArray = actors.filter(actor => actor.type === 'object');

    //

    let characterNames = characterActorsArray.map((actor, i) => actor.spec.name);
    let objectNames = objectActorsArray.map((actor, i) => actor.spec.name);
    let targetNames = [
      ...characterNames,
      ...objectNames,
    ];
    let messages = fakeMessages.slice();
    characterNames = shuffle(characterNames);
    objectNames = shuffle(objectNames);
    targetNames = shuffle(targetNames);
    messages = shuffle(messages);
    return {
      characterNames,
      objectNames,
      targetNames,
      messages,
    };
  } */
  /* #getContextMessages(opts = {}) {
    const lore = this.#loreManager.getLore();
    const {
      actors = lore.getActors(),
      loreItems = lore.getLoreItems(),
      setting = lore.getSetting(),
      director = lore.getDirector(),
      error,
    } = opts;

    //

    const characterActorsArray = actors.filter(actor => actor.type === 'character');
    const objectActorsArray = actors.filter(actor => actor.type === 'object');
    console.log('object actors', {actors, objectActorsArray});

    //

const systemMessageChunks = [

// system message

`\
AvatarML is a JSON-based language for scripting an AI generated TV shows.
AvatarML is rendered using a game engine to produce the stream for an audience of users. User can interact with the show via chat to steer its direction. I will enter chat messages as they are received.
Your job is to write AvatarML scripts.

# AvatarML specification
Each line of AvatarML is a comma separated list of JSON values.
Lines are separated by a newline character.
Each line specifies an action performed by an actor in the scene.
Actors in the scene can perform different actions.

The general format is:
_actor_name,_action_name,[arg1,arg2,...],_dialogue_message

`,

// actors

`\
## Actors
Actors in the scene include characters, objects (props), and others entities.
ONLY the below actors can appear in the AvatarML script. Users in the chat are NOT actors in the scene.

`,

// character actors

characterActorsArray.length > 0 ? `\
## Character actors

${characterActorsArray.map(({spec: {name = '', description = ''} = {}, memories = []}, i) => `\
Character Name: ${JSON.stringify(name)} 
${description ? `\
Bio: ${description}
` : ''}\
${memories.length > 0 ? `\
Memories:
${memories.map(s => `\
>${s.text} [${s.timestamp}]
`).join('')}\
` : ''}\
`).join('\n')}\

${characterMessageTypesArray.length > 0 ? `\
## Character actor actions API

${characterMessageTypesArray.map(type => `\
### ${type.name}
${type.description}
Ex:
\`\`\`
${type.example(this.#makeExampleOpts())}
\`\`\`
${(() => {
  if (type.args) {
    const args = type.args(this.#makeExampleOpts());
    if (args) {
      return args.map((args2, i) => `\
arg${i + 1} = {${args2.map(a => JSON.stringify(a)).join(',')}}
`).join('');
    } else {
      return '';
    }
  } else {
    return '';
  }
})()}\
`).join('\n')}\
` : ''}\

` : null,

// object actors

objectActorsArray.length > 0 ? `\
## Object actors
These are objects that can be interacted with in the scene.

${objectActorsArray.map(({spec: {name = '', description = ''} = {}}, i) => `\
Object Name: ${JSON.stringify(name)}
${description ? `\
Description: ${description}
` : ''}\
`).join('\n')}\

${objectMessageTypesArray.length > 0 ? `\
## Object actor actions API

${objectMessageTypesArray.map(type => `\
### ${type.name}
${type.description}
Ex:
\`\`\`
${type.example(this.#makeExampleOpts())}
\`\`\`
${(() => {
  if (type.args) {
    const args = type.args(this.#makeExampleOpts());
    if (args) {
      return args.map((args2, i) => `\
arg${i + 1} = {${args2.map(a => JSON.stringify(a)).join(',')}}
`).join('');
    } else {
      return '';
    }
  } else {
    return '';
  }
})()}\
`).join('\n')}\
` : ''}\
` : null,

// setting

setting ? `\
## Setting

${setting}

` : null,

// director

director ? `\
## Director's instructions
${director}

` : null,

// lore

loreItems.length > 0 ? `\
## Lore
Use this lore when worldbuilding:
${loreItems.join('\n')}

` : null,

// additional instructions

`\
# Important notes
- The user will prompt you to generate the next line of AvatarML. Treat the user's messages as direction for the script.
- However, you MUST ALWAYS continue in AvatarML format, as specified above. Do not respond with null.
- DO NOT REPEAT lines or memories that characters have already said.
- If you cannot generate a response, make the character say something witty instead. Your response must adhere to AvatarML format.
`,

].filter(chunk => chunk !== null);
    const systemMessage = systemMessageChunks.join('');
    
    const messages = [
      {
        role: 'system',
        content: systemMessage,
      },
    ]
    .map(raw => Message.fromRaw(raw, this))
    // .concat(this.#messages);
    return messages;
  } */

  //

  /* async #getApiCompletion(messages) {
    const {
      // modelType,
      modelName,
    } = this.aiClient;

    const response = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1',
      },

      body: JSON.stringify({
        model: modelName,
        messages,
        stop: ['\n'],
        // response_format: 'json_object',
      }),
    });

    const j = await response.json();
    const message = j.choices[0].message.content;
    return message;
  } */
  /* async #getActorsWithMemories() {
    const lore = this.#loreManager.getLore();
    const actors = lore.getActors();
    const characterActors = actors.filter(a => a.type === 'character');
    const objectActors = actors.filter(a => a.type === 'object');

    const cleanMemories = memories => {
      // remove empty memories
      memories = memories.map(memory => {
        return {
          // text: Message.fromParsed(memory).toFullText(),
          // text: Message.fromParsed(memory).toText(),
          text: memory.message,
          // created_at: memory.created_at,
          timestamp: timeAgo.format(new Date(memory.created_at)),
        };
      });

      // remove duplicate memories
      memories = uniqueArray(memories, m => m.text);

      // filter out memories with the exact same content as current messages
      const messageContentsSet = new Set();
      for (const m of this.#messages) {
        const parsed = m.getParsed();
        const {message} = parsed;
        messageContentsSet.add(message);
      }
      memories = memories.filter(memory => !messageContentsSet.has(memory.text));

      // return result
      return memories;
    };

    if (this.#messages.length > 0) {
      const embeddingString = this.#messages.map(m => m.getRaw().content).join('\n');
      const embedding = await embed(embeddingString);
      const promises = characterActors.map(async actor => {
        const {
          // id,
          // type,
          spec,
          // object,
        } = actor;
        // console.log('get actor spec name', actor);
        // debugger;
        const name = spec?.name ?? null;
        let memories = await this.#loreManager.characterMemoriesManager.searchMemoriesByEmbedding(embedding, {
          name,
        });
        memories = cleanMemories(memories);
        console.log('actor memories 1', {
          messages: this.#messages.slice(),
          actor,
          memories,
        });
        return {
          ...actor,
          memories,
        };
      });
      const characterActorsWithMemories = await Promise.all(promises);
      return [
        ...characterActorsWithMemories,
        ...objectActors,
      ];
    } else {
      const promises = characterActors.map(async actor => {
        const {
          // id,
          // type,
          spec,
          // object,
        } = actor;
        // console.log('get actor spec name', actor);
        // debugger;
        const name = spec?.name ?? null;
        let memories = await this.#loreManager.characterMemoriesManager.getMemoriesByName(name);
        memories = cleanMemories(memories);
        console.log('actor memories 0', {
          messages: this.#messages.slice(),
          actor,
          memories,
        });
        return {
          ...actor,
          memories,
        };
      });
      const characterActorsWithMemories = await Promise.all(promises);
      return [
        ...characterActorsWithMemories,
        ...objectActors,
      ];
    }
  } */
  #getContextMessages({
    includeLocalPlayer = true,
  } = {}) {
    let messages = [];

    const {playersManager} = this.#loreManager;
    const playersBlacklist = playersManager.getPlayersBlacklist({
      includeLocalPlayer,
    });

    // determine actors
    const lore = this.#loreManager.getLore();

    // // collect user/assistant messages
    // const userAssistantMessages = [];
    // for (let i = 0; i < this.#messages.length; i++) {
    //   const message = this.#messages[i];
    //   const role = message.getRole();
    //   if (role === 'user') {
    //     // userMessages.push(message);
    //     userAssistantMessages.push(message);
    //   } else if (role === 'assistant') {
    //     // assistantMessages.push(message);
    //     userAssistantMessages.push(message);
    //   } else {
    //     console.warn('invalid message role', message);
    //     throw new Error('invalid message role: ' + JSON.stringify(message));
    //   }
    // }
    const userAssistantMessages = this.#messages.slice();

    // special case: if the last message is a parenthetical, ignore it.
    if (userAssistantMessages.length > 0) {
      const lastMessage = userAssistantMessages[userAssistantMessages.length - 1];
      const parsed = lastMessage.getParsed();
      if (parsed) {
        const {
          command,
        } = parsed;
        if (command === 'parenthetical') {
          userAssistantMessages.pop();
        }
      }
    }

    //

    const instructionMessage = {
      role: 'system',
      content: this.#getInstructions(),
    };
    messages.push(instructionMessage);

    //

    let initialUserContent = '';

    // const candidateMessageTypesArray = objectActors.length > 0 ?
    //   messageTypesArray
    // :
    //   messageTypesArray.filter(messageType =>
    //     !messageTypes[messageType].targetArgRequired
    //   );

//     initialUserContent += `\
// Start writing the script in the given format.

// `;

// ${underline('Cast + props')}
  {
    const s = lore.getContent({
      playersBlacklist,
    });
    if (s) {
      initialUserContent += s;
    }
  }
  /* const recentUserMessages = userMessages;
    if (recentUserMessages.length > 0) {
      const s = recentUserMessages.map(m => m.getContent()).join('\n');
      initialUserContent += `\
${underline('Audience chat')}
These are chat messages from the audience. Incorporate this into the script.

${s}

`;
    } */

    /* const critique = this.#critic ? this.#critic.getCritique() : '';
    if (critique) {
      // console.log('inject critique', {
      //   critique
      // });

      initialUserContent += `\
${underline(`Feedback`)}

${critique}

`;
    } */

    //

    const s = uniqueArray(userAssistantMessages.map(m => m.getContent())).join('\n\n');
    if (s) {
      initialUserContent += `\
# Continue the following script
\`\`\`
${s}\
\`\`\`
Do NOT echo these lines back to me. Simply continue with the required code block (\`\`\`) and the next line of the script.
`;
    } else {
      initialUserContent += `\
# Start the script
Write the script, wrapped in a code block (\`\`\`).
`;
    }

    const initialUserMessage = {
      role: 'user',
      content: initialUserContent,
    };
    messages.push(initialUserMessage);

    //

    // const content = messages.map(m => m.content).join('\n');
    // messages = [
    //   {
    //     role: 'user',
    //     content,
    //   }
    // ];

    //

    return messages;
  }
  #bindMessage(message) {
    if (message.getRole() === 'assistant') {
      const lore = this.#loreManager.getLore();
      if (message.bindLore(lore)) {
        return true;
      } else {
        console.warn('could not bind lore to message', {
          content: message.getContent(),
          message,
          lore,
        });
        return false;
      }
    }

    return parsedMessages;
  }
  async * complete({
    prompt,
    model = aiModelModes,
    includeLocalPlayer,
    limit,
    signal,
  } = {}) {
    if (typeof limit !== 'number') {
      console.warn('no limit', {limit});
      debugger;
    }
    if (limit === 0) {
      console.warn(`Cannot generate limit = 0 messages. This call is pointless and probably a bug. Returning early.`);
      return;
    }

    //

    const match = model.match(/^(.+?):/);
    if (!match) {
      throw new Error('invalid model: ' + JSON.stringify(model));
    }
    const modelType = match[1];

    const messages = [
      ...this.#getContextMessages({
        includeLocalPlayer,
      }),
    ];
    if (prompt) {
      if (typeof prompt === 'string') {
        prompt = {
          role: 'user',
          content: prompt,
        };
      }
      messages.push(prompt);
    }

    // const messagesAcc = this.#messages.slice();

    //

    const completion = new Completion({
      promptMessages: messages,
    });
    this.dispatchEvent(new MessageEvent('completion', {
      data: {
        completion,
      },
    }));

    //

    const res = await fetchChatCompletion({
      model,
      messages,
      stream: true,
      signal,
    });

    //

    const self = this;
    async function* internalGenerator() {
      // collect the result stream
      let result = '';
      // pipe the body to the event stream parser
      const contentFn = modelTypeContentFns[modelType];
      const eventStreamParser = new EventStreamParseStream({
        contentFn,
      });
      res.body.pipeThrough(eventStreamParser);

      let foundCodeBlock = false;
      const parseMessages = (opts) => {
        const messages = [];

        let codeBlockMatch;
        while (codeBlockMatch = result.match(/\`\`\`([^\n]*)\n/)) {
          result = result.slice(codeBlockMatch.index + codeBlockMatch[0].length);
          foundCodeBlock = true;
        }

        if (foundCodeBlock) {
          const {
            parsedMessages,
            remainderString,
          } = StoryMessageRuntime.getParsedMessagesFromString(result, opts);
          for (const parsedMessage of parsedMessages) {
            const {
              content,
            } = parsedMessage;

            // create raw message
            const id = crypto.randomUUID();
            const role = 'assistant';
            const rawMessage = {
              id,
              role,
              content,
            };
            // create message
            const message = Message.fromRaw(rawMessage);
            // bind message
            if (self.#bindMessage(message)) {
              messages.push(message);
              completion.addMessage(rawMessage);
            } else {
              // binding failed, so short circuit
              return {
                done: true,
                messages,
              };
            }
          }
          result = remainderString;

          return {
            done: false,
            messages,
          };
        } else {
          return {
            done: false,
            messages: [],
          };
        }
      };

      // read the event stream
      const reader = eventStreamParser.readable.getReader();
      for (;;) {
        const {done, value} = await reader.read();
        if (signal?.aborted) return;
        if (done) {
          break;
        } else {
          result += value;
          const {
            done: done2,
            messages: messages2,
          } = parseMessages({
            final: false,
          });
          for (const message of messages2) {
            yield message;
            if (signal?.aborted) return;
          }
          if (done2) {
            break;
          }
        }
      }

      if (result) {
        const {
          // done,
          messages,
        } = parseMessages({
          final: true,
        });
        for (const message of messages) {
          yield message;
          if (signal?.aborted) return;
        }
      }
    }

    const generatorFn = internalGenerator();
    for (let i = 0; i < limit; i++) {
      // read the next message from the stream
      const {
        done,
        value: message,
      } = await generatorFn.next();
      if (!done) {
        /* // handle insert fns
        {
          let insertDone = false;
          for (let j = 0; j < insertFns.length; j++) {
            const insertFn = insertFns[j];
            const {
              done: done2,
              messages: insertMessages,
            } = await insertFn({
              messages: messagesAcc,
              message,
            });
            for (let k = 0; k < insertMessages.length && i < limit; k++, i++) {
              const insertMessage = insertMessages[k];
              messagesAcc.push(insertMessage);

              // note: not pushed to the completion since it's not a real message

              yield insertMessage;
              if (signal?.aborted) return;
            }
            if (done2) {
              insertDone = true;
              break;
            }
          }
          if (insertDone) {
            break;
          }
        } */

        // yield message
        yield message;
        if (signal?.aborted) return;
      } else {
        break;
      }
    }

    completion.end();
  }
}