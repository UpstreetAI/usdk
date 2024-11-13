// import * as THREE from 'three';
import React from 'react';
import classnames from 'classnames';
import {
  Fountain,
} from 'fountain-js';
import {
  sayCommandType,
  normalizeName,

  narratePreloadMessage,
  narrateExecuteMessage,

  fakePlayMessage,
} from '../../util.js';

// import {
//   emotes,
// } from '../../../emote/emotes.js';
// import {
//   emotions,
// } from '../../../emote/emotions.js';

// import {
//   AutoVoiceEndpoint,
//   VoiceEndpointVoicer,
// } from '../../../../audio/voice-output/voice-endpoint-voicer.js';
// import {
//   AudioInjectWorkletNode,
// } from '../../../../audio/inject-worklet-node.js';

// import {
//   chooseRandom,
//   spliceRandom,
//   chooseRandomArray,
//   escapeRegexString,
//   // jsonParse,
//   letterAt,
// } from '../../../../util.js';
// import {
//   Message,
// } from './message.js';
import {
  LoreBinding,
} from '../../lore.js';
import {
  // storyCameraShots,
  // storyCameraFrames,
  // storyCameraAngles,
  advanceModes,
} from '../../../story/story-manager.js';
// import {
//   AutoVoiceEndpoint,
//   VoiceEndpointVoicer,
// } from '../../audio/voice-output/voice-endpoint-voicer.js';
// import {
//   AudioInjectWorkletNode,
// } from '../../audio/inject-worklet-node.js';
// import {
//   angleTypes,
//   angleTypeFns,
// } from '../../managers/auto-camera/auto-camera-manager.js';

//

/* const monoActionNames = [
  'enters',
  'exits',
  'looks around',
  'sits',
  'stands up',
  'lies down',
  // 'walks',
  // 'runs',
  // 'jumps',
  // 'emotes',
  // 'emotions',
  
  'nods',
  'shakes head',
  'smiles',
  'frowns',
  'gasps',
  'cries',

  // 'alert',
  // 'angry',
  // 'embarrassed',
  // 'headNod',
  // 'headShake',
  // 'sad',
  // 'surprise',
  // 'victory',

  'sighs',
  'dances',
  'laughs',
  'winks',
  'smirks',
];

const biAnyActionNames = [
  'examines',
  'touches',
  // 'interacts with',
  'smiles at',
  'frowns at',
  'walks to',
  'walks through',
  'walks up to',
  'walks over to',
  'wanders through',
  'runs to',
  'runs through',
  'runs up to',
  'runs over to',
  'runs from',
  'sneaks to',
  'nudges',
  'attacks',
  'punches',
  'kicks',
  'sits on',
  'sits down next to',
  'stands on',
  'stands next to',
  'lies down next to',
  'jumps on',
  'jumps over',
  'jumps up to',
  'jumps down from',
  'lands on',
  'lies down on',
  'climbs on',
  'climbs up',
  'climbs down',
  'points at',
  'looks at',
  'stares at',
  'hears',
  'holds up',
  'pets',
  'notices',
  'sees',
  'watches',
  'pushes',
  'pulls',
  'talks to',
  'whispers to',
  'listens to',
  'yells at',
  'waves to',
  'hugs',
  'kisses',
];
const biObjectActionNames = [
  'uses',
  'reads',  
  'drinks',
  'eats',
  'wears',
  'throws',
  'catches',
  'takes',
  'gives',
  'grabs',
  'picks up',
  'puts down',
  'drops',
  'turns on',
  'turns off',
  'opens',
  'closes',
];
const biLocationActionNames = [
  'enters',
  'exits',
]; */

// const cameraAngleNames = angleTypes.map(k => angleTypeFns[k].name);
// const cameraAngleNamesUppercase = cameraAngleNames.map(n => n.toUpperCase());

//

function parseMessage(raw) {
  const s = raw.content;
  const {
    parsedMessages,
    remainderString,
  } = getParsedMessagesFromString(s, {
    final: true,
  });
  if (parsedMessages.length > 1) {
    console.warn('unexpectedly parsed script in into multiple messages', {
      parsedMessages,
      remainderString,
    });
    debugger;
    throw new Error('unexpectedly parsed script in into multiple messages');
  }
  return parsedMessages[0];
}
function formatMessage(parsed) {
  const {
    command,
  } = parsed;
  const messageType = messageTypes[command];
  if (messageType) {
    return messageType.format(parsed);
  } else {
    return null;
  }
}

//

const makeEmptyBinding = () => new LoreBinding({
  name: '',
  type: 'empty',
  value: null,
});
const bindLoreFn = ({
  name: nameSpec = null,
  args: argsSpec = null,
  required: {
    name: nameRequired = false,
    args: argsRequired = argsSpec ? Array(argsSpec.length).fill(false) : [],
  } = {},
} = {}) => (m, lore) => {
  const raw = m.getRaw();
  const parsed = parseMessage(raw);
  // const parsed = m.getParsed();
  const bindings = m.getBindings();

  let allBound = true;
  if (nameSpec) {
    const bs = lore.bindName(parsed.name, nameSpec);
    let b;
    if (bs.length > 0) {
      b = bs[0];
    } else {
      b = makeEmptyBinding();
      if (nameRequired) {
        allBound = false;
      }
    }
    bindings.addBinding(b);
  }
  if (argsSpec) {
    for (let i = 0; i < argsSpec.length; i++) {
      const arg = parsed.args[i];
      const argSpec = argsSpec[i];
      if (argSpec) {
        const bs = lore.bindName(arg, argSpec);
        let b;
        if (bs.length > 0) {
          b = bs[0];
        } else {
          b = makeEmptyBinding();
          if (argsRequired[i]) {
            allBound = false;
          }
        }
        bindings.addBinding(b);
      } else {
        bindings.addBinding(makeEmptyBinding());
      }
    }
  }
  return allBound;
};
/* const playStart = (message) => {
  message.dispatchEvent(new MessageEvent('playStart', {
    // data: {
      // player,
    // },
  }));
};
const playEnd = (message) => {
  message.dispatchEvent(new MessageEvent('playEnd', {
    // data: {
      // player,
    // },
  }));
}; */

// this is the order in which message types appear in the prompt.
const messageTypesArray = [
  {
    name: sayCommandType,
    // description: 'Character speaks a line of dialogue. The most common type of line. Replace <dialogue> with the actual line spoken.',
    // formatString: `<characterName>: <dialogue>`,
    // numExamples: 0,
    // example({
    //   characterNames,
    //   objectNames,
    //   messages,
    // }) {
    //   const characterName = chooseRandom(characterNames);
    //   // const message = chooseRandom(messages);
    //   return `${normalizeName(characterName)}: <dialogue>`;
    // },
    text({
      name,
      message,
    }) {
      return message;
      // return `${name}\n${message}`;
    },
    render({
      styles,
      key,
      name,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.say,
        )} key={key}>
          <span className={styles.name}>{name}</span>
          <span className={styles.text}>: {message}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      name: ['character'],
      required: {
        name: true,
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex < advanceModes.indexOf('Auto');
    },
    isMajor({
      message,
      engine,
    }) {
      return true;
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      const [
        playerBinding,
      ] = bindings.getBindings();
      if (playerBinding.type === 'character') {
        const player = playerBinding.value.object;
        if (typeof player?.voicer.getStream !== 'function') {
          debugger;
        }
        const stream = player?.voicer.getStream(parsed.message, {
          signal,
        });
        await stream.waitForLoad();
        return stream;
      } else {
        return null;
      }
    },
    format({
      name,
      command,
      args,
      message,
    }) {
      return `${normalizeName(name)}\n${message}`;
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      const [
        playerBinding,
      ] = bindings.getBindings();
      const {
        voiceQueueManager,
      } = engine;
      
      const player = playerBinding.type === 'character' ?
        playerBinding.value.object
      :
        null;
      const stream = await message.waitForPreload();

      // console.log('voice queue 1');
      await voiceQueueManager.waitForTurn(async () => {
        if (player && stream) {
          await player.playStream(stream, {
            onStart: () => {
              // console.log('voice queue start');
              // playStart(message);
            },
            onEnd: () => {
              // console.log('voice queue end');
              // playEnd(message);
            },
            signal,
          });
        } else {
          await fakePlayMessage(message, {
            signal,
          });
        }
      });
      // console.log('voice queue 2');
    },
  },
  {
    name: 'action',
    /* description: 'Character performs an action directed towards a target character or object.',
    formatString: `*<characterName> <actionName> <targetName>*`,
    args({
      characterNames,
      objectNames,
    }) {
      return {
        characterName: characterNames.map(name => normalizeName(name)),
        actionName: biAnyActionNames,
        targetName: [
          ...characterNames.map(name => normalizeName(name)),
          ...objectNames.map(name => normalizeName(name)),
        ],
      };
    },
    targetArgRequired: true,
    example({
      characterNames,
      objectNames,
      // messages,
    }) {
      const characterName = chooseRandom(characterNames);
      const actionName = chooseRandom(biAnyActionNames);
      const characterOrObjectName = chooseRandom(characterNames.concat(objectNames));
      return `*${normalizeName(characterName)} ${actionName} ${normalizeName(characterOrObjectName)}*`;
    }, */
    format({
      name,
      command,
      args,
      message,
    }) {
      return args[0] ?? '';
    },
    text({
      name,
      command,
      args,
      message,
    }) {
      return args[0] ?? '';
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.text}>{args[0]}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      // name: ['character'],
      args: [
        ['character', 'object', 'location'],
      ],
      required: {
        // name: true,
        args: [
          false, // note: target not required
        ],
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Narrate');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'action',
      });

      /* const {
        player,
        target,
      } = bindings;

      const targetPosition = target.position;
      const timestamp = performance.now();
      const bbox2 = target.physicsMesh ?
        new THREE.Box3()
          .setFromBufferAttribute(target.physicsMesh.geometry.attributes.position)
          .applyMatrix4(target.physicsMesh.matrixWorld)
      :
        null;

      player.characterBehavior.addWaypointAction(
        targetPosition,
        timestamp,
        {
          boundingBox: bbox2,
        },
      ); */

      /* const emote = args[0];
      if (emote) {
        engine.emoteManager.triggerEmote(emote, player);
      } else {
        console.warn('invalid emote', {
          emote,
        });
      } */

      /* const emotion = args[0];
      if (emotions.includes(emotion)) {
        const faceposeAction = player.actionManager.addAction({
          type: 'facepose',
          emotion,
          value: 1,
        });

        setTimeout(() => {
          if (player.actionManager.hasActionId(faceposeAction.actionId)) {
            player.actionManager.removeAction(faceposeAction);
          }
        }, 2000);
      } else {
        console.warn('invalid emotion', {
          emotion,
          emotions,
        });
      } */
    },
  },
  {
    name: 'chat',
    format({
      name,
      command,
      args,
      message,
    }) {
      return `[@${name}] ${args[0] ?? ''}`;
    },
    text({
      name,
      command,
      args,
      message,
    }) {
      return args[0] ?? '';
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.name}>[@{name}]</span>
          <span className={styles.text}> {message}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({}),
    isBlocking(opts) {
      return false;
    },
    isMajor(opts) {
      return false;
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'action',
      });
    },
  },
  {
    name: 'parenthetical',
    format({
      name,
      command,
      args,
      message,
    }) {
      return `${name}\n${args[0] ?? ''}`;
    },
    text({
      name,
      command,
      args,
      message,
    }) {
      return args[0] ?? '';
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.name}>{name}</span>
          <span className={styles.text}> {args[0]}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      name: ['character'],
      args: [
        ['character', 'object', 'location'],
      ],
      required: {
        name: true,
        args: [
          false, // note: target not required
        ],
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Narrate');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'parenthetical',
      });
    },
  },
  {
    name: 'scene_heading',
    format({
      name,
      command,
      args,
      message,
    }) {
      return `.${args[0] ?? ''}`;
    },
    text({
      name,
      command,
      args,
      message,
    }) {
      return args[0] ?? '';
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.text}>{args[0]}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      args: [
        ['character', 'object', 'location'],
      ],
      required: {
        args: [
          false, // note: target not required
        ],
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Narrate');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'scene_heading',
      });
    },
  },
  {
    name: 'transition',
    format({
      name,
      command,
      args,
      message,
    }) {
      return `>${args[0] ?? ''}`;
    },
    text({
      name,
      command,
      args,
      message,
    }) {
      return args[0] ?? '';
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.text}>{args[0]}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      args: [
        ['character', 'object', 'location'],
      ],
      required: {
        args: [
          false, // note: target not required
        ],
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Narrate');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'transition',
      });
    },
  },
  /* {
    name: 'character action',
    description: 'Character performs an action directed towards a target character. The two characters must be different.',
    formatString: `*<characterName> <actionName> <characterName2>*`,
    args({
      characterNames,
      objectNames,
    }) {
      return {
        characterName: characterNames.map(name => normalizeName(name)),
        actionName: biCharacterActionNames,
        characterName2: characterNames.map(name => normalizeName(name)),
      };
    },
    targetArgRequired: true,
    example({
      characterNames,
      // objectNames,
      // messages,
    }) {
      const characterName = chooseRandom(characterNames);
      const actionName = chooseRandom(biCharacterActionNames);
      const characterName2 = chooseRandom(characterNames);
      return `*${normalizeName(characterName)} ${actionName} ${normalizeName(characterName2)}*`;
    },
    format({
      name,
      command,
      args,
      message,
    }) {
      return `*${normalizeName(name)} ${args[0]} ${args[1]}*`;
    },
    text({
      name,
      command,
      args,
      message,
    }) {
      return `${normalizeName(name)} ${args[0]} ${args[1]}`;
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.text}>*</span>
          <span className={styles.name}>{name}</span>
          <span className={styles.text}> {args[0]} </span>
          <span className={styles.value}>{args[1]}</span>
          <span className={styles.text}>*</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      name: ['character'],
      args: [
        null,
        ['character'],
      ],
      required: {
        name: true,
        args: [
          null,
          false, // note: character not required
        ],
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Narrate');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'character action',
      });
    },
  }, */
  /* {
    name: 'emote',
    description: 'Character expresses an emotion and optionally says something.',
    format: `<characterName> <emotionName>`,
    args({
      characterNames,
    }) {
      return {
        characterName: characterNames,
        emotionName: emotes,
      };
    },
    targetArgRequired: true,
    example({
      characterNames,
      objectNames,
      messages,
    }) {
      const characterName = chooseRandom(characterNames);
      const emote = chooseRandom(emotes);
      return `${normalizeName(characterName)} ${emote}`;
    },
    text({
      name,
      args,
      message,
    }) {
      return `${normalizeName(name)} ${args[0]}${message ? `: ${message}` : ''}`;
    },
    parse(s) {
      const match = s.match(/^(\S+):\s+\*emotes\s+(\S+)\*(?:\s+(.+))?$/);
      if (match) {
        const name = match[1];
        const emote = match[2];
        const message = match[3] || '';

        const command = this.name;
        const args = [emote];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.name}>{name}</span>
          <span className={styles.value}> {args[0]}</span>
          {message && <span className={styles.text}>: {message}</span>}
        </div>
      );
    },
    bindLore: bindCharacterLore,
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      const {
        args,
      } = parsed;
      const {
        player,
      } = bindings;

      const emote = args[0];
      if (emote) {
        engine.emoteManager.triggerEmote(emote, player);
      } else {
        console.warn('invalid emote', {
          emote,
        });
      }
    },
  }, */
  /* {
    name: 'emotions',
    description: 'Change the character\'s current mood and say something.',
    example({
      characterNames,
      objectNames,
      messages,
    }) {
      const characterName = chooseRandom(characterNames);
      const emotion = chooseRandom(emotions);
      const message = chooseRandom(messages);
      return `${normalizeName(characterName)} emotions <arg1>: <optional message>`;
    },
    args() {
      return [emotions];
    },
    text({
      name,
      args,
      message,
    }) {
      return `${normalizeName(name)}: *emotions ${args[0]}*${message? ` ${message}` : ''}`;
    },
    parse(s) {
      const match = s.match(/^(\S+):\s+\*emotions\s+(\S+)\*(?:\s+(.+))?$/);
      if (match) {
        const name = match[1];
        const emotion = match[2];
        const message = match[3] || '';

        const command = this.name;
        const args = [emotion];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.emote,
        )} key={key}>
          <span className={styles.name}>{name}</span>
          <span className={styles.text}>: *emotions </span>
          <span className={styles.value}>{args[0]}</span>
          <span className={styles.text}>*</span>
          {message && <span className={styles.text}> {message}</span>}
        </div>
      );
    },
    bindLore: bindCharacterLore,
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      const {
        args,
      } = parsed;
      const {
        player,
      } = bindings;

      const emotion = args[0];
      if (emotions.includes(emotion)) {
        const faceposeAction = player.actionManager.addAction({
          type: 'facepose',
          emotion,
          value: 1,
        });

        setTimeout(() => {
          if (player.actionManager.hasActionId(faceposeAction.actionId)) {
            player.actionManager.removeAction(faceposeAction);
          }
        }, 2000);
      } else {
        console.warn('invalid emotion', {
          emotion,
          emotions,
        });
      }
    },
  }, */
  /* {
    name: 'cut to',
    description: `Cut to a different location, with an optional message during the transiton. Do not "cut to" multiple times in a row.`,
    formatString: `(INT|EXT|CUT TO). <locationName> - <message>`,
    numExamples: 1,
    example: ({
      locationNames,
      // characterNames,
      // objectNames,
      // messages,
    }) => {
      const locationName = chooseRandom(locationNames);

      const intExt = `${Math.random() < 0.5 ? 'INT' : 'EXT'}.`;
      let message = '';
      if (Math.random() < 0.5) {
        const n = Math.floor(Math.random() * 30);
        const units = [
          'minute',
          'hour',
          'day',
          'week',
          'month',
          'year',
        ];
        const unit = chooseRandom(units);
        const ago = Math.random() < 0.5 ? 'ago' : 'later';
        message = `${n} ${unit}s ${ago}`;
      }

      return [
        intExt,
        normalizeName(locationName),
        message,
      ].filter(o => !!o).join(' - ');
    },
    args({
      locationNames,
      // characterNames,
      // objectNames,
    }) {
      return {
        sceneName: locationNames.map(locationName => normalizeName(locationName)),
      };
    },
    text({
      name,
      args,
      message,
    }) {
      return `CUT TO ${args[0]}${message? ` - ${message}` : ''}`;
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.cutTo,
        )} key={key}>
          <span className={styles.text}>CUT TO </span>
          <span className={styles.value}>{args[0]}</span>
          {message && <span className={styles.text}> - </span>}
          {message && <span className={styles.value}>{message}</span>}
        </div>
      );
    },
    bindLore: () => true,
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Verbose');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    format({
      name,
      command,
      args,
      message,
    }) {
      return `CUT TO ${args[0]}${message? ` - ${message}` : ''}`;
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'cutTo',
      });
    },
  },
  {
    name: 'camera',
    formatString: `CAMERA - <shotType> - <targetName>`,
    description: 'Switch to a different camera shot, with an optional target.',
    args({
      locationNames,
      characterNames,
      objectNames,
    }) {
      return {
        shotType: cameraAngleNamesUppercase,
        targetName: [
          ...locationNames.map(name => normalizeName(name)),
          ...characterNames.map(name => normalizeName(name)),
          ...objectNames.map(name => normalizeName(name)),
        ],
      };
    },
    example({
      characterNames,
      objectNames,
      messages,
    }) {
      const shotType = chooseRandom(cameraAngleNamesUppercase);
      const targetName = chooseRandom(characterNames.concat(objectNames));
      return `CAMERA - ${shotType} - ${normalizeName(targetName)}`;
    },
    text({
      name,
      args,
      message,
    }) {
      return `CAMERA - ${args[0]} - ${args[1]}`;
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.cameraShot,
        )} key={key}>
          <span className={styles.text}>CAMERA - </span>
          <span className={styles.value}>{args[0]}</span>
          <span className={styles.text}> - </span>
          <span className={styles.value}>{args[1]}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      args: [
        null,
        ['character', 'object', 'location'],
      ],
      required: {
        args: [
          null,
          true,
        ],
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Verbose');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    format({
      name,
      command,
      args,
      message,
    }) {
      return `CAMERA - ${args[0]} - ${args[1]}`;
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'camera',
      });
    },
  }, */
];
/* export const messageTypesAuxArray = [
  {
    name: choiceCommandType,
    formatString: `CHOICE - <question> - A) <option1> B) <option2> C) <option3> D) <option4>`,
    description: 'Present the audience with a choice for directing the story. The options should be up to 5 words.',
    // example: choiceCommandExample,
    text({
      name,
      args,
      message,
    }) {
      return `CHOICE - ${args[0]} - ${args[1]}`;
    },
    render({
      styles,
      key,
      name,
      args,
      message,
    }) {
      return (
        <div className={classnames(
          styles.chatMessage,
          styles.cameraShot,
        )} key={key}>
          <span className={styles.text}>CHOICE - </span>
          <span className={styles.value}>{args[0]}</span>
          <span className={styles.text}> - </span>
          <span className={styles.value}>{args[1]}</span>
        </div>
      );
    },
    bindLore: bindLoreFn({
      args: [
        null,
        ['character', 'object', 'location'],
      ],
      required: {
        args: [
          null,
          true,
        ],
      },
    }),
    isBlocking({
      message,
      engine,
    }) {
      const advanceModeIndex = engine.storyManager.storyAdvance.getModeIndex();
      return advanceModeIndex <= advanceModes.indexOf('Verbose');
    },
    isMajor(opts) {
      return this.isBlocking(opts);
    },
    async preload({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      return await narratePreloadMessage.call(this, message, {
        engine,
        signal,
      });
    },
    format({
      name,
      command,
      args,
      message,
    }) {
      return `CAMERA - ${args[0]} - ${args[1]}`;
    },
    async execute({
      message,
      parsed,
      bindings,
      engine,
      signal,
    }) {
      await narrateExecuteMessage.call(this, message, {
        engine,
        signal,
        debugLabel: 'camera',
      });
    },
  },
];
// this is the order in which message types are parsed.
export const messageTypeParseFns = [
  {
    name: 'regular action',
    parse(s) {
      const escapedActionsRegexString = biAnyActionNames.map(s => escapeRegexString(s)).join('|');
      const r = new RegExp(`^\\*(\\S+(?:\\s+\\S+)*) (${escapedActionsRegexString}) (\\S+(?:\\s+\\S+)*)\\*$`);
      const match = s.match(r);
      if (match) {
        const name = match[1];
        const command = this.name;
        const action = match[2];
        const target = match[3];
        const message = '';

        const args = [action, target];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
  },
  {
    name: 'basic action',
    parse(s) {
      const escapedActionsRegexString = monoActionNames.map(s => escapeRegexString(s)).join('|');
      const r = new RegExp(`^\\*(\\S+(?:\\s+\\S+)*) (${escapedActionsRegexString})\\*$`);
      const match = s.match(r);
      if (match) {
        const name = match[1];
        const command = this.name;
        const action = match[2];
        const message = '';

        const args = [action];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
  },
  {
    name: 'location action',
    parse(s) {
      const escapedActionsRegexString = biLocationActionNames.map(s => escapeRegexString(s)).join('|');
      const r = new RegExp(`^\\*(\\S+(?:\\s+\\S+)*) (${escapedActionsRegexString}) (\\S+(?:\\s+\\S+)*)\\*$`);
      const match = s.match(r);
      
      if (match) {
        const name = match[1];
        const command = this.name;
        const action = match[2];
        const target = match[3];
        const message = '';

        const args = [action, target];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
  },
  {
    name: 'prop action',
    parse(s) {
      const escapedActionsRegexString = biObjectActionNames.map(s => escapeRegexString(s)).join('|');
      const r = new RegExp(`^\\*(\\S+(?:\\s+\\S+)*) (${escapedActionsRegexString}) (\\S+(?:\\s+\\S+)*)\\*$`);
      const match = s.match(r);
      
      if (match) {
        const name = match[1];
        const command = this.name;
        const action = match[2];
        const target = match[3];
        const message = '';

        const args = [action, target];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
  },
  {
    name: 'dialogue',
    parse(s) {
      const match = s.match(/^(\S+(?:\s+\S+)*):\s*([\s\S]+)$/);
      if (match) {
        const name = match[1];
        const message = match[2];

        const command = this.name;
        const args = [];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
  },
  {
    name: 'cut to',
    parse(s) {
      const r = /^(?:INT|EXT|CUT(?: TO)?)\.?\s+(\S+(?:\s+\S+)*)(?:\s*-\s*(\S+(?:\s+\S+)*))?$/;
      const match = s.match(r);
      if (match) {
        const command = this.name;
        const sceneName = match[1];
        const message = match[2] || '';

        const args = [sceneName];

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
  },
  {
    name: 'camera',
    parse(s) {
      const r = /^CAMERA \- (\S+(?:\s+\S+)*) \- (\S+(?:\s+\S+)*)$/;
      const match = s.match(r);
      if (match) {
        const shotType = match[1];
        const command = this.name;
        const target = match[2];

        const name = 'Camera';
        const args = [shotType, target];
        const message = '';

        return {
          name,
          command,
          args,
          message,
        };
      } else {
        return null;
      }
    },
  },
]; */
const messageTypes = (() => {
  const result = {};
  for (const messageType of messageTypesArray) {
    result[messageType.name] = messageType;
  }
  return result;
})();

//

const getParsedMessagesFromString = (s, {
  final = false,
} = {}) => {
  const fountain = new Fountain();
  const output = fountain.parse(s, true);
  const {tokens} = output;

  let character = '';
  let pendingDialogueMessages = [];
  const parsedMessages = [];
  for (const token of tokens) {
    const {
      type,
      text,
    } = token;
    switch (type) {
      case 'scene_heading':
      case 'transition':
      {
        parsedMessages.push({
          name: '',
          command: type,
          args: [text],
          message: '',

          content: text,
        });
        break;
      }
      case 'action': {
        // check if it's a user chat action
        const match = text.match(/^\[@([^\]]*?)\]\s+([\s\S]+)$/);
        if (match) {
          const name = match[1];
          const message = match[2];
          parsedMessages.push({
            name,
            command: 'chat',
            args: [],
            message,
  
            content: text,
          });
        } else {
          parsedMessages.push({
            name: '',
            command: type,
            args: [text],
            message: '',
  
            content: text,
          });
        }
        break;
      }
      case 'title':
      case 'dialogue_begin': {
        break; 
      }
      case 'character': {
        // replace parentheses
        character = text.replace(/(?:^|\s+)\([^\)]*\)(?:$|\s+)/g, '');
        break;
      }
      case 'parenthetical': {
        if (character) {
          pendingDialogueMessages.push({
            name: character,
            command: 'parenthetical',
            args: [text],
            message: '',

            content: character + '\n' + text,
            // token,
          });
        } else {
          console.warn('messages', {
            parsedMessages,
          });
          throw new Error('no character: ' + JSON.stringify(text));
        }
        break;
      }
      case 'dialogue': {
        if (character && text.trim()) {
          pendingDialogueMessages.push({
            name: character,
            command: sayCommandType,
            args: [],
            message: text,

            content: character + '\n' + text,
            // token,
          });
          break;
        } else {
          console.warn('messages', {
            parsedMessages,
          });
          throw new Error('no character: ' + JSON.stringify(text));
        }
      }
      case 'dialogue_end': {
        if (pendingDialogueMessages.length > 0) {
          character = '';
          parsedMessages.push(...pendingDialogueMessages);
          pendingDialogueMessages.length = 0;
        } else {
          console.warn('messages', {
            parsedMessages,
          });
          throw new Error('no pending dialogue message: ' + JSON.stringify(text));
        }
        break;
      }
      default: {
        console.warn('unhandled token type', {
          type,
          text,
        });
        debugger;
      }
    }
  }
  if (final) {
    return {
      parsedMessages,
      remainderString: '',
    };
  } else {
    return {
      parsedMessages: parsedMessages.slice(0, -1),
      remainderString: parsedMessages.length > 1 ?
        parsedMessages[parsedMessages.length - 1].content
      :
        s,
    };
  }
};

const messageToReact = (m, opts) => {
  const {
    styles,
    key = null,
  } = (opts ?? {});

  const raw = m.getRaw();
  const parsed = parseMessage(raw)
  if (!parsed) {
    console.warn('failed to parse message', raw);
    // debugger;
    return null;
  }
  const {
    command,
  } = parsed;

  const messageType = messageTypes[command];
  if (messageType) {
    const renderFn = messageType.render;
    return renderFn({
      styles,
      key,
      ...parsed,
    });
  } else {
    console.warn('unknown message type', command, parsed);
    return '';
  }
};
const messageToText = (m) => {
  const raw = m.getRaw();
  if (raw.role === 'assistant') {
    const parsed = parseMessage(raw);
    if (!parsed) {
      console.warn('failed to parse message', raw);
      // debugger;
      return '';
    }
    const {
      command,
    } = parsed;

    const messageType = messageTypes[command];
    if (messageType) {
      if (messageType.text) {
        return messageType.text(parsed);
      } else {
        return messageType.format(parsed);
      }
    } else {
      console.warn('unknown message type', command, parsed);
      return '';
    }
  } else {
    return raw.content;
  }
};

//

const isBlocking = (m, engine) => { // need engine to determine conversation settings
  const raw = m.getRaw();
  // const parsed = this.getParsed();
  const parsed = parseMessage(raw);
  const {
    command,
  } = parsed;
  const messageType = messageTypes[command];

  return messageType.isBlocking({
    message: this,
    engine,
  });
};
const isMajor = (engine) => { // need engine to determine conversation settings
  const raw = m.getRaw();
  // const parsed = this.getParsed();
  const parsed = parseMessage(raw);
  const {
    command,
  } = parsed;
  const messageType = messageTypes[command];

  return messageType.isMajor({
    message: this,
    engine,
  });
};

//

const bindLore = (message, lore) => {
  const parsed = parseMessage(message.getRaw());
  const {
    command,
  } = parsed;
  const messageType = messageTypes[command];
  if (messageType) {
    // if (!messageType.bindLore) {
    //   debugger;
    // }
    return messageType.bindLore(this, lore);
  } else {
    return false;
  }
};

//

const preload = async (m, {
  engine,
  signal,
}) => {
  const raw = m.getRaw();
  const parsed = parseMessage(raw);
  const {
    command,
    message,
  } = parsed;
  const bindings = m.getBindings();
  const args = {
    message: m,
    parsed,
    bindings,
    engine,
    signal,
  };

  const messageType = messageTypes[command];
  let preloadResult = null;
  if (messageType) {
    if (messageType.preload) {
      console.log('preload 1', {
        messageType,
        args,
      });
      preloadResult = await messageType.preload(args);
      console.log('preload 2', {
        messageType,
        args,
        preloadResult,
      });
    }
  } else {
    console.warn('unknown command to preload', command);
  }

  return preloadResult;
};
const execute = async (m, {
  engine,
  signal,
}) => {
  const raw = m.getRaw();
  // const parsed = m.getParsed();
  const parsed = parseMessage(raw);
  const {
    command,
    message,
  } = parsed;
  const bindings = m.getBindings();
  const args = {
    message: m,
    parsed,
    bindings,
    engine,
    signal,
  };

  let promise;
  const messageType = messageTypes[command];
  if (messageType) {
    promise = messageType.execute(args);
  } else {
    console.warn('cannot execute unknown command', command);
    promise = Promise.resolve();
  }
  await promise;
};

//

const StoryMessageRuntime = {
  parseMessage,
  formatMessage,

  messageToReact,
  messageToText,

  isBlocking,
  isMajor,
  
  bindLore,

  preload,
  execute,
};
export default StoryMessageRuntime;