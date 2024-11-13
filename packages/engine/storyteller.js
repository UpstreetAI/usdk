// import {
//   IoBus,
// } from '../../../../pages/components/io-bus/IoBus.js';
// import {IoBus} from '../../../../pages/components/io-bus/IoBus.js';
import GPT3Tokenizer from 'gpt3-tokenizer';
// import {
//   OPENAI_API_KEY,
// } from '../../constants/auth.js';

//

export const characterKeys = [
  'name',
  'voice',
  'voicePack',
  'bio',
];

//

const makeTokenizeFn = () => {
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
};
const tokenize = makeTokenizeFn();

//

class ChatGPTClient extends EventTarget {
  constructor() {
    super();

    this.messages = [];
  }
  export() {
    return structuredClone({
      messages: this.messages,
    });
  }
  toString() {
    return this.messages.map(m => m.content).join('');
  }
  pushMessage(text, role = 'user') {
    const message = {
      role,
      content: text,
    };
    this.messages.push(message);
    return message;
  }
  async send(text = 'Hello!') {
    const message = this.pushMessage(text, 'user');

    // drop initial message
    const getNumTokens = () => {
      const tokens = tokenize(JSON.stringify(this.messages));
      return tokens.length;
    };
    while (getNumTokens() >= 4096) {
      this.messages.shift();
    }

    const res = await fetch('/api/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: this.messages,
      }),
    });
    if (res.ok) {
      const j = await res.json();
      // console.log('got json', j);
      const {choices} = j;
      if (choices.length > 0) {
        const {message} = choices[0];
        this.messages.push(message);

        this.dispatchEvent(new MessageEvent('message', {
          data: message,
        }));

        return message.content;
      } else {
        console.warn('chatgpt error 1', j, res);
        throw new Error('chatgpt error');
      }
    } else {
      console.warn('chatgpt error 2', res);
      throw new Error('chatgpt error');
    }
  }
  pop(n = 1) {
    for (let i = 0; i < n; i++) {
      this.messages.pop();
    }
  }
}

//

const makePrefix = ({
  setting,
  characters,
  prompt,
  lines,
}) => {
  // Include all dialogue between characters, in movie script format.
  // Include detailed physical descriptions of everything, including characters and settings, as well as camera directions.
  return `\
# Task
Write a script of the first episode of a new slice-of-life topical anime, similar to South Park or Rick and Morty, but with shonen anime vibes.
The episode should be 30 minutes long, or about 30 pages.

# Setting
${setting}

# Character names
${characters.map(c => c.name).join('\n')}

# Character bios
${characters.map(c => {
  return `${c.name} - ${c.bio}`;
}).join('\n')}

# Episode theme
${prompt}

The episode should revolve around the above theme. It should be funny, but also have a serious message.

# Script format
\`\`\`
{"type": "characterLine", "name": "<character name goes here, e.g. ${characters[0].name} or another name from above>", "text": "<dialogue goes here>"},
{"type": "directions", "directions": "<stage directions go here>"},
\`\`\`

# Instructions
"type" must be one of ["characterLine", "directions"]
Start the script with a "characterLine"
Most of the lines should be "characterLine". Don't use more than one "directions" line at a time
Do not finish the scene until I tell you to

${lines.length > 0 ? `\
# Current script; continue from here
\`\`\`
${lines.map(line => Stringify_WithSpaces(line) + ',').join('\n')}
\`\`\`

Stay on topic with the theme of the episode.

Write 5 more lines.` : 'Start writing the script JSON. Write 5 lines.'}`;
}

function Stringify_WithSpaces(obj) {
	let result = JSON.stringify(obj, null, 1); // stringify, with line-breaks and indents
	result = result.replace(/^ +/gm, " "); // remove all but the first space for each line
	result = result.replace(/\n/g, ""); // remove line-breaks
	result = result.replace(/{ /g, "{").replace(/ }/g, "}"); // remove spaces between object-braces and first/last props
	result = result.replace(/\[ /g, "[").replace(/ \]/g, "]"); // remove spaces between array-brackets and first/last items
	return result;
}

const imaginairyUrl = `https://local-image.webaverse.com`;
const genImage = async (prompt) => {
  const fd = new FormData();
  fd.append('prompt_texts', prompt);
  // fd.append('negative_prompt', '');
  // fd.append('width', 256);
  // fd.append('height', 256);
  fd.append('width', 512);
  fd.append('height', 512);

  const res = await fetch(`${imaginairyUrl}/imagine`, {
    method: 'POST',
    body: fd,
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const img = await loadImage(url);
  img.style.cssText = `\
    position: absolute;
    z-index: 1;
  `;

  return img;
};

//

//       chatGptClient.pushMessage(`\
// Roleplay as an anime girl from a sci fi anime. She is an adventurer with a huge sword. She is feisty and funny, and likes puns.
// After that, you must always reply in character, and never break character for any reason.
// Tell me when you are ready to start!
// `);
//         text = `\
// Write a script of the first episode of a new anime. The episode should be 30 minutes long, or about 30 pages.
// Include all dialogue between characters, in movie script format.
// Most of the script should be dialogue between the characters.
// Include detailed physical descriptions of everything, including characters and settings, as well as camera directions.
// The script should follow a consistent narrative structure.

// Each line of the script should start with either \`IMAGE:\` or \`TEXT:\` (without the backticks).
// The type of line determines the content it contains.
// IMAGE: lines should contain literal descriptions of the characters and setting of the scene
// IMAGE: lines are NOT part of the script
// IMAGE: lines should NOT contain any character or place names, only dry literal descriptions (i.e. use "blond girl holding a sword", not "Melissa holding a sword")
// IMAGE: lines should be detailed and consistent with the story, but should NOT contain any names characters or places, only descriptions
// TEXT: lines contain the main transcript, including dialogue and narration
// TEXT: lines are the main lines of the script, written in third person omniscient perspective
// Before each TEXT: line, add an IMAGE: line describing the action in the scene
// Make sure to have an IMAGE: line every few sentences. Don't write long TEXT: paragraphs without any IMAGE: lines

// Here is your prompt:
// ${text}

// Keep going until I tell you to stop. Start scene one now. Action!
// `;

export class StoryTeller extends EventTarget {
  constructor({
    setting,
    characters,
    prompt,
    chatManager,
    playersManager,
    npcManager,
    hupsManager,
  }) {
    super();

    this.setting = setting;
    this.characters = characters;
    this.prompt = prompt;
    this.chatManager = chatManager;
    this.playersManager = playersManager;
    this.npcManager = npcManager;
    this.hupsManager = hupsManager;

    this.lines = [];
    this.imagePromptLines = [];

    this.messageTick = 0;
    this.reloadingImage = false;
    this.reloadImageQuery = '';

    this.#reset();
  }
  #reset() {
    this.chatGptClient = new ChatGPTClient();
    this.first = true;
    this.abortController = null;
  }
  async next(signal) {
    const {
      setting,
      characters,
      prompt,
      lines,
    } = this;

    const prefix = makePrefix({
      setting,
      characters,
      prompt,
      lines,
    });

    const characterLineStrings = [];
    const p = this.first ? prefix : 'keep going';
    // console.log('got prompt 1', p);
    const response = await this.chatGptClient.send(p);
    console.log('post response', signal.aborted);
    if (signal.aborted) return;

    // console.log('got live response', {
    //   p,
    //   response,
    // });
    this.first = false;
    const responseLines = response.split(/\n+/);
    for (let i = 0; i < responseLines.length; i++) {
      const text = responseLines[i];
      if (/\S/.test(text)) {
        characterLineStrings.push(text);
      }
    }
    // console.log('got character lines', characterLineStrings);

    // for (let i = 0; i < characters.length; i++) {
    // for (let i = 0; i < 2; i++) {
    //   const text = `${characters[i].name}: Hello everyone! Are you all ready to die?`;
    //   characterLineStrings.push(text);
    //   this.lines.push(text);
    // }

    const rejectedLines = [];
    const scriptLines = characterLineStrings.map(line => {
      // const match = line.match(/^(?:(.+?):\s*)?([\s\S]*),?\s*$/);
      // match the json line
      const match = line.match(/^(.*?),*\s*$/);
      const jsonString = match ? match[1] : '';
      let json = null;
      try {
        if (!/^\s*(?:\[|\])\s*$/.test(jsonString)) {
          json = JSON.parse(jsonString);
        } else {
          // nothing, skip the line
        }
      } catch(err) {
        console.warn('skipping invalid json', {
          jsonString,
        });
        // debugger;
      }
      if (json) {
        // const name = match ? (match[1] ?? '') : '';
        // const text = match ? (match[2] ?? '') : '';
        const {
          name,
          text,
          directions,
        } = json;
        if (typeof name === 'string' && typeof text === 'string') {
          const nameLowercase = name.toLowerCase();
          let character = nameLowercase ?
            characters.find(c => c.name.toLowerCase().includes(nameLowercase))
          : null;

          const localPlayer = this.playersManager.getLocalPlayer();

          return character ? {
            type: 'characterLine',
            character,
            text,
          } : {
            type: 'characterLine',
            character: (() => {
              const result = {};
              for (const key of characterKeys) {
                result[key] = localPlayer.playerSpec[key];
              }
              return result;
            })(),
            text,
          };
        } else if (typeof directions === 'string') {
          return {
            type: 'directions',
            text: directions,
          };
        } else {
          rejectedLines.push(line);
          return null;
        }
      } else {
        rejectedLines.push(line);
        return null;
      }
    }).filter(m => m !== null);
    console.log('got script lines', scriptLines);
    return scriptLines;
  }
  start() {
    if (this.abortController) {
      console.warn('aborting previous run');
      debugger;
    }
    this.abortController = new AbortController();
    return this.run(this.abortController.signal);
  }
  async run(signal) {
    let messagesPreloadPromise = null;
    const preloadWatermark = 3; // message distance before we generate more script
    const _ensurePreload = () => {
      if (!messagesPreloadPromise) {
        messagesPreloadPromise = this.next(signal);
      }
    };
    _ensurePreload();

    for (;;) {
      const messages = await messagesPreloadPromise;
      console.log('post message', signal.aborted);
      if (signal.aborted) return;
      messagesPreloadPromise = null;

      const lineMessages = messages.filter(m => m.type === 'characterLine');
      if (lineMessages.length > 0) {
        for (let i = 0; i < lineMessages.length; i++) {
          const distanceToPreloadWatermark = lineMessages.length - i;
          if (distanceToPreloadWatermark <= preloadWatermark) {
            _ensurePreload();
          }

          const m = lineMessages[i];
          const {
            character,
            text,
          } = m;
          let player = Array.from(this.npcManager.npcPlayers.values()).find(p => {
            return p.name === character.name;
          }) ?? null;
          if (!player) {
            const localPlayer = this.playersManager.getLocalPlayer();
            if (localPlayer.playerSpec.name === character.name) {
              player = localPlayer;
            }
          }
          if (player) {
            this.pushLine({
              type: 'characterLine',
              name: character.name,
              // character,
              text,
            });

            // console.log('add player message 1');
            this.chatManager.addPlayerMessage(player, text);
            await new Promise((accept, reject) => {
              // const timeout = setTimeout(() => {
              //   accept();
              // }, 1000);
              // const listener = () => {
              //   clearTimeout(timeout);
              //   accept();
              // };
              this.hupsManager.addEventListener('voiceend', e => {
                // console.log('got voice end', e);
                const {
                  character: endedCharacter,
                } = e.data;
                // console.log('got end', endedCharacter, player, character);
                if (endedCharacter === player) {
                  accept();
                }
              });
            });
            console.log('post character line', signal.aborted);
            if (signal.aborted) return;
          } else {
            console.warn('skipping missed player:', character.name);
          }
        }
      } else {
        _ensurePreload();

        for (const message of messages) {
          this.pushLine(message);
        }
      }
    }
  }
  pushLine(l) {
    this.lines.push(l);
    this.imagePromptLines.push(l);

    // every 3 lines, change the image
    if ((this.messageTick++) % 3 === 0) {
      if (!this.reloadingImage) {
        this.reloadingImage = true;

        const prompt = `\
# Task
Write a generative image AI prompt for a storyboard, describing the characters, setting, style, and other details that would be present in the storyboard.

# Prompt examples
Blond haired anime girl with a long sword cutting a tree in a sunny grassy field, lush vegetation, blue sky
Dark forst bog path with thorns and branches, full moon at midnight, small swamp creatures, spooky
A boy and a girl walk down a Japanese school path with sakura trees in Tokyo, marketplace in the background

# Storyboard script
${this.imagePromptLines.map(l => {
  if (l.type === 'characterLine') {
    return `${l.name}: ${l.text}`;
  } else if (l.type === 'directions') {
    return l.text;
  } else if (l.type === 'image') {
    return `Image prompt: ${l.url}`;
  } else {
    return '';
  }
}).filter(l => !!l).join('\n')}

# Prompt
Write a new prompt matching the last panel of the above scene:`;

        (async () => {
          return; // XXX image generation disabled

          const chatGptClient = new ChatGPTClient();

          // const size = 1024;
          const size = 256;

          let response = await chatGptClient.send(prompt);
          response = response.trim();
          console.log('got image prompt', {
            prompt,
            response,
          });
          this.imagePromptLines.push({
            type: 'image',
            prompt: response,
          });

          // const dalleUrl = `/api/ai/images/generations`;
          // const res2 = await fetch(dalleUrl, {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //     // 'Authorization': `Bearer ${OPENAI_API_KEY}`,
          //   },
          //   body: JSON.stringify({
          //     prompt: response,
          //     n: 1,
          //     size: `${size}x${size}`,
          //   }),
          // });

          // const json = await res.json();
          // // const {
          // //   data: {
          // //     url: url2,
          // //   },
          // // } = json;
          // const url2 = json?.data?.[0]?.url;
          // if (!url2) {
          //   debugger;
          // }

          // const res2 = await fetch(url2);
          // const blob = await res2.blob();

          const imaginairyUrl = `https://local-image.webaverse.com`;

          const fd = new FormData();
          const suffix = ', studio ghibli style, anime style, beautiful';
          fd.append('prompt_texts', response + suffix);
          fd.append('width', size);
          fd.append('height', size);

          const res = await fetch(`${imaginairyUrl}/imagine`, {
            method: 'POST',
            body: fd,
          });
          console.log('res 1', res.ok, res.status);
          const blob = await res.blob();
          // console.log('res 2', )

          // const url = URL.createObjectURL(blob);
          // const img = await loadImage(url);
          // console.log('res 2', img);
          // URL.revokeObjectURL(url);
          // img.style.cssText = `\
          //   position: absolute;
          //   z-index: 1;
          // `;
          const imageBitmap = await createImageBitmap(blob, {
            imageOrientation: 'flipY',
          });
          
          this.dispatchEvent(new MessageEvent('imageUpdate', {
            data: {
              imageBitmap,
            },
          }));

          // document.body.appendChild(img);
        })().finally(() => {
          this.reloadingImage = false;
        });
      }
    }
  }
  stop() {
    const oldAbortController = this.abortController;
    if (oldAbortController) {
      oldAbortController.abort('stopped');
      this.abortController = null;
      return true;
    } else {
      return false;
    }
  }
  addLocalMessage(player, message) {
    const stopped = this.stop();

    this.pushLine({
      type: 'characterLine',
      name: player.playerSpec.name,
      text: message,
    });

    this.#reset();

    stopped && this.start();
  }
}