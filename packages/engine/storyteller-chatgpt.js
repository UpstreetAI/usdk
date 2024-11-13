// import {
//   VoiceEndpointVoicer,
// } from './audio/voice-output/voice-endpoint-voicer.js';
import {OPENAI_API_KEY} from './constants/auth.js';

// helper methods

const parseScriptLine = (line) => {
  const match = line.match(/^([a-zA-Z]+)\((.+?)\)\s*$/);
  if (match) {
    const label = match[1];
    const args = JSON.parse('[' + match[2] + ']');
    return {
      label,
      args,
    };
//   const label = match[0];
//   const argString = line.match(/\(([^)]+)\)/)[1];
//   const args = argString.split(',').map(arg => {
//     const trimmedArg = arg.trim();
//     if (trimmedArg.startsWith("'") || trimmedArg.startsWith("[")) {
//       return JSON.parse(trimmedArg.replace(/'/g, '"'));
//     } else {
//       return trimmedArg;
//     }
//   });

//   return {
//     label,
//     args,
//   };
// } else {
//   return null;
  } else {
    return null;
  }
};

// emotions

// const emotions = [
//   'angry',
//   'surprise',
//   'joy',
//   'surprise',
//   'sorrow',
//   'fun',
// ];

// // camera

// const shots = [
//   'establishing shot',
//   'master shot',
//   'wide shot',
//   'full shot',
//   'cowboy shot',
//   'medium shot',
//   'medium close-up',
//   'close-up',
//   'extreme close-up',
// ];
// const framings = [
//   'single shot',
//   'two shot',
//   'crowd shot',
//   'over the shoulder shot',
//   'point of view shot',
//   'insert shot',
// ];
// const angles = [
//   'low angle',
//   'high angle',
//   'overhead angle',
//   'dutch angle',
//   'eye level',
//   'shoulder level',
//   'knee level',
//   'ground level',
// ];

// scene

export const makePersonality = ({
  characters,
  setting,
  prompt,
}) => {
  return `\
You are a script writing AI for a new anime.
You will write dialogue between characters, in movie script format.
You are writing your first episode should be 30 minutes long, or about 30 pages.
Each scene should incluede at least 20 lines of dialogue. Each scene must contribute an important plot point to the story
Do not include irrelevant/random scenes.
The script should be unexpected, full of plot twists and surprises.
The themes are friendship, coming of age, and the meaning of life.
The show should be witty, and have a similar pacing to Rick and Morty.
Most of the lines should be dialogue between the characters, not narration.
The characters should be interesting and relatable, not just flat stereotypes. They should have their own motivations. Invent interesting details about the character's personalities and express them through how the characters behave.

# Format

Here are the allowed values for each type:

Shots = [
  "establishing shot",
  "master shot",
  "wide shot",
  "full shot",
  "cowboy shot",
  "medium shot",
  "medium close up shot",
  "close up shot",
  "extreme close up shot",
];
Frames = [
  "single shot",
  "two shot",
  "crowd shot",
  "over the shoulder shot",
  "point of view shot",
  "insert shot",
];
Angles = [
  "low angle",
  "high angle",
  "overhead angle",
  "dutch angle",
  "eye level",
  "shoulder level",
  "knee level",
  "ground level",
];
Emotions = [
  "angry",
  "surprise",
  "joy",
  "sorrow",
  "fun",
];

The script follows a strict format.
Each line of output will be one of the following.
You will not output any other type of lines. Every line must match one of these formats.
It is ok for a character to say multiple lines in a row.

title(name: string, description: string) // e.g. "Forest of the Blue Sky", Our friends finally made it to the end of the road. But can they survive the trials that await them in the mysterious "Forest of the Blue Sky"?
say(character: string, text: string, emotionVector: [Emotions][6]) // e.g. character says a line of dialogue, emotion is [1, 0, 0, 0, 0, 0]
do(character: string, action: string) // e.g. character performs an action, e.g. "do('Aikiko', 'yawns at the thought of another long day')"
image(text: string) // e.g. add an image to the scene; eg. image("a white cat yawning by a spiky fence")
camera(shot: Shots, framing: Framings, angle: Angles, srcTarget: string?, dstTarget: string?) // e.g. camera("medium shot", "over the shoulder shot", "dutch angle", "Genoise", "large tree") would mean capture the subject from the waist up, with the camera angled to imply tension, and the camera is positioned behind the character Genoise, looking at the large tree
quest(name: string, objectives: string[]) // e.g. quest("Assoult on the Mother Tree", ["Find the Mother Tree", "Plant viral seeds", "Escape the forest"])
objectiveComplete(name: string, description: string) // e.g. objectiveComplete("Plant viral seeds", "Life is given")
objectiveFailed(name: string, description: string) // e.g. objectiveFailed("Plant viral seeds", "The forest will never be the same")

Do not use the above examples; they are only there to show you the format.

# Setting
${prompt ?? setting}

# Character names
Only the following characters may appear in the script. The name strings must match exactly in the commands.
${characters.map(c => JSON.stringify(c.name)).join('\n')}

# Character biographies
${characters.map(c => {
  return `${c.name} - ${c.bio}`;
}).join('\n')}

Reply each time with one line of the script.`;
};

// class

export class StoryTellerChatGPT {
  constructor(personality, {
    chatManager,
    playersManager,
    npcManager,
    hupsManager,
    cameraManager,
    ioBus,
  }) {
    this.personality = personality;
    this.chatManager = chatManager;
    this.playersManager = playersManager;
    this.npcManager = npcManager;
    this.hupsManager = hupsManager;
    this.cameraManager = cameraManager;
    this.ioBus = ioBus;

    if (!this.personality || !this.chatManager || !this.playersManager || !this.npcManager || !this.hupsManager || !this.ioBus) {
      debugger;
      throw new Error('missing required argument');
    }

    this.messages = [
      {role: "system", content: this.personality},
    ];

//     this.messages[0].content += `
// You will write ${n} messages at a time.`;

    this.#listen();
    this.#reset();
  }
  /* async nextAsync(signal) {
    const messages = this.messages.slice();

    const response = await fetch( 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },

      body: JSON.stringify({
        messages,
        model: 'gpt-4',
      }),

      signal,
    });
    if (signal.aborted) return;

    const json = await response.json();
    if (signal.aborted) return;

    const message = json.choices?.[0]?.message;

    messages.push(message);

    this.messages = messages;

    return message.content;
  } */
  #listen() {
    this.ioBus.addEventListener('message', e => {
      const {
        type,
        args,
      } = e.data;
      if (type === 'cameraMode') {
        const {
          mode,
        } = args;
        this.enabled = mode === 'cinematic';
      }
    });
  }
  #reset() {
    // this.chatGptClient = new ChatGPTClient();
    // this.first = true;
    this.abortController = null;
  }
  async next(signal) {
    const messages = this.messages.slice();

    const numReplies = 5;

    for (let i = 0; i < numReplies; i++) {
      // console.log('next 1');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },

        body: JSON.stringify({
          messages,
          model: 'gpt-4',
        }),
      });
      // console.log('next 2');
      if (signal.aborted) {
        // console.log('next abort 1');
      }

      if (response.ok) {
        // console.log('next 3');
        const json = await response.json();
        // console.log('next 4');
        if (signal.aborted) {
          // console.log('next abort 2');
        }

        const message = json.choices?.[0]?.message;
        // console.log('got message', message);
        messages.push(message);
        this.messages = messages;
        // console.log('next 5', messages);

        const {content} = message;
        const lines = content.split(/\n+/);
        // console.log('parse lines', {content, lines});
        const parsedLines = lines.map(parseScriptLine)
          .filter(l => l !== null);
        // console.log('next 6', parseScriptLine);
        return parsedLines;

        /* const {
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
        // console.log('post response', signal.aborted);
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
        return scriptLines; */
      } else {
        console.warn('completions api bad status code', response.status);

        await new Promise((accept, reject) => {
          setTimeout(accept, 1000);
        });

        if (signal.aborted) {
          // console.log('next abort 3');
        }

        continue;
      }
    }
    console.warn('too many retries');
    throw new Error('too many retries');
  }
  // async send(content) {
  //   this.messages.push(
  //     {role: "user", content},
  //   );

  //   const message = await this.nextAsync();
  //   return message;
  // }
  start() {
    if (this.abortController) {
      console.warn('aborting previous run');
      debugger;
    }
    this.abortController = new AbortController();
    return this.run(this.abortController.signal);
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
    const {
      name,
    } = player.playerSpec;
    const stopped = this.stop();

    // this.pushLine({
    //   type: 'characterLine',
    //   name: player.playerSpec.name,
    //   text: message,
    // });
    this.messages.push({
      role: 'assistant',
      content: `say(${JSON.stringify(name)}, ${JSON.stringify(message)}, ${JSON.stringify(Array(6).fill(0))})`,
    });

    this.#reset();

    stopped && this.start();
  }
  async run(signal) {
    let messagesPreloadPromise = null;
    // const preloadWatermark = 3; // message distance before we generate more script
    const _ensurePreload = () => {
      if (!messagesPreloadPromise) {
        messagesPreloadPromise = this.next(signal);
      }
    };
    _ensurePreload();

    // console.log('run 1');

    const makeid = (length = 8) => {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      return result;
    };

    for (;;) {
      // console.log('run 2');
      const id = makeid();
      console.log('wait for messages 1', id);
      const messages = await messagesPreloadPromise;
      console.log('wait for messages 2', id);
      // console.log('run 3', messages);
      // console.log('post message', signal.aborted);
      if (signal.aborted) {
        console.log('storyteller aborted');
      }

      messagesPreloadPromise = null;
      _ensurePreload();

      const lineHandlers = {
        async say(line) {
          const {
            args: [
              character,
              text,
              emotion,
            ],
          } = line;
          let player = Array.from(this.npcManager.npcPlayers.values()).find(p => {
            return p.name === character;
          }) ?? null;
          if (!player) {
            const localPlayer = this.playersManager.getLocalPlayer();
            if (localPlayer.playerSpec.name === character) {
              player = localPlayer;
            }
          }
          if (player) {
            this.messages.push({
              role: 'assistant',
              content: `say(${JSON.stringify(character)}, ${JSON.stringify(text)}, ${JSON.stringify(emotion)})`,
            });

            this.chatManager.addPlayerEmotionMessage(player, text, emotion);
            await new Promise((accept, reject) => {
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
            console.warn('skipping missed player:', character, Array.from(this.npcManager.npcPlayers.values()));
          }
        },
        async title(line) {
          const {
            args,
          } = line;
          const [
            name,
            description,
          ]  = args;
          const message = `${name}: ${description}`;
          await this.chatManager.addNarratorMessage({
            name,
            description,
            message,
          });
        },
        async do(line) {
          const {
            args,
          } = line;
          const [
            character,
            action,
          ] = args;
          const message = `${character} ${action}`;
          await this.chatManager.addNarratorMessage({
            name: '',
            description: message,
            message,
          });
        },
        async camera(line) {
          const {
            args,
          } = line;
          const [
            shot,
            framing,
            angle,
            srcTarget,
            dstTarget,
          ] = args;
          const message = [shot, framing, angle, srcTarget, dstTarget].join(', ');
          await this.chatManager.addNarratorMessage({
            name: '',
            description: message,
            message,
          });

          if (this.enabled) {
            let srcTargetObject = null;
            let srcPlayer = Array.from(this.npcManager.npcPlayers.values()).find(p => {
              return p.name === srcTarget;
            }) ?? null;
            if (srcPlayer) {
              srcTargetObject = srcPlayer;
            }

            let dstTargetObject = null;
            let dstPlayer = Array.from(this.npcManager.npcPlayers.values()).find(p => {
              return p.name === dstTarget;
            }) ?? null;
            if (dstPlayer) {
              dstTargetObject = dstPlayer;
            }

            this.cameraManager.setStoryCamera(shot, framing, angle, srcTargetObject, dstTargetObject);
          }
        },
        async quest(line) {
          const {
            args,
          } = line;
          const [
            name,
            objectives,
          ] = args;
          const description = objectives.join(', ');
          const message = `Acquired new quest: ${name}: ${description}`;
          console.log('new quest', objectives);
          debugger;
          await this.chatManager.addNarratorMessage({
            name,
            description,
            message,
          });
        },
        async objectiveComplete(line) {
          const {
            args,
          } = line;
          const [
            name,
            description,
          ] = args;
          const message = `Objective accomplished: ${name}: ${description}`;
          await this.chatManager.addNarratorMessage({
            name,
            description,
            message,
          });
        },
        async objectiveFailed(line) {
          const {
            args,
          } = line;
          const [
            name,
            description,
          ] = args;
          const message = `Objective accomplished: ${name}: ${description}`;
          await this.chatManager.addNarratorMessage({
            name,
            description,
            message,
          });
        },
        async image(line) {
          const {
            args,
          } = line;
          const [
            image,
          ] = args;
          const message = `${image}`;
          await this.chatManager.addNarratorMessage({
            name: '',
            description: message,
            message,
          });
        },
      };

      console.log('got messages', messages);
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const handler = lineHandlers[message.label];
        if (handler) {
          await handler.call(this, message);
        } else {
          console.warn('no handler for message', message);
        }
      }
      console.log('done with messages, looping around...');
    }
  }
}

// client

// globalThis.chatGptClient = new ChatGPTClient(personality, {
//   n: 5,
// });
// m = await chatGptClient.nextAsync();
// console.log(m);