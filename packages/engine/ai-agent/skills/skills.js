import {
  validMoods,
  validEmotions,
} from '../../constants/companion-constants.js';
import textHandleFn from '../../../../public/core-skills/text/text.js';
import moodHandleFn from '../../../../public/core-skills/mood/mood.js';
import emoteHandleFn from '../../../../public/core-skills/emote/emote.js';
import stopHandleFn from '../../../../public/core-skills/stop/stop.js';
import settingsHandleFn from '../../../../public/core-skills/settings_change/settings_change.js';
import imageGenHandleFn from '../../../../public/core-skills/image_gen/image_gen.js';

export const makeDefaultSkills = ctx => {
  const makeSkill = (skillSpec, ctx) => {
    return {
      ...skillSpec,
      handleFn: skillSpec.makeHandleFn(ctx),
    };
  };

  const skills = [];
  for (let i = 0; i < defaultSkillSpecs.length; i++) {
    const skillSpec = defaultSkillSpecs[i];
    const skill = makeSkill(skillSpec, ctx);
    skills.push(skill);
  }
  return skills;
};
export const defaultSkillSpecs = [
  {
    name: 'TEXT',
    description: 'Your avatar will say the given text. The text can be up to a paragraph long. You may output multiple text messages in a row. Most commands should be this type.',
    value: `Hey yo! What's up? I just got home, but I'm down to chat.`,
    progressive: 'sentence',
    // formatFn: (m) => {
    //   const userString = m.user;
    //   return `${userString ? `${userString}: ` : ''}${m.value}`;
    // },
    format: '\${?user}\${user}: /{?user}\${value}',
    handlerUrl: '/core-skills/text/text.js',
    makeHandleFn: textHandleFn, // XXX need to replace these handlers with actual imports
  },
  {
    name: 'IMAGE',
    description: 'Your avatar will send the given image if it is a previously sent image. If it is a new image, create a new image description, do not include a URL, and set GENERATE_IMAGE to TRUE. This will create a new image of the given description.',
    value: "[SENT_BY:: \${user}], [IMAGE_DESCRIPTION:: Beautiful, masterpiece, high quality, 1girl, blue hair, green eyes, standing in a courtyard], [URL:: {url}], [GENERATE_IMAGE:: {boolean}]",
    format: '\${value}',
    handlerUrl: '/core-skills/image_gen/image_gen.js',
    makeHandleFn: imageGenHandleFn,
  },
  {
    name: 'FILE',
    description: 'Your avatar will say the given text. The text can be up to a paragraph long. You may output multiple text messages in a row. Most commands should be this type.',
    value: `[\${user} sends a file called '{placeholderFilename}'. Unable to see file contents.]`,
    format: '\${value}',
  },
  {
    name: 'MOOD',
    description: `Change the current emotional state of the avatar. Use it occasionally to set an ambient mood. Use it whenever the avatar's mood changes.\n"mood" must be one of: ${validMoods.join(' ')}`,
    value: validMoods[0],
    // formatFn: m => `${m.user}'s mood is now ${m.value}`,
    format: '\${user}\'s mood is now \${value}',
    handlerUrl: '/core-skills/mood/mood.js',
    makeHandleFn: moodHandleFn,
  },
  {
    name: 'EMOTE',
    description: `Trigger a discrete emote reaction on the avatar. Use it only occasionally to highlight an important message. Do not use it often, because that would annoy the user.\n"emote" must be one of: ${validEmotions.join(' ')}`,
    value: validEmotions[0],
    // formatFn: m => `${m.user} emotes ${m.value}`,
    format: '\${user} emotes \${value}',
    handlerUrl: '/core-skills/emote/emote.js',
    makeHandleFn: emoteHandleFn,
  },
  // {
  //   name: 'INSPECT_SELF',
  //   description: `Inspect the current visual state of the avatar. Use it see what your visual appearance looks like.`,
  //   value: true,
  //   format: '\${user} examines their appearance.',
  //   handlerUrl: '/core-skills/inspect_self/inspect_self.js',
  //   makeHandleFn: inspectSelfHandleFn,
  // },
  {
    name: 'SETTINGS_CHANGE',
    description: "", //initialized in on skills client load
    value: "VOLUME=50",
    format:'\${user} has set \${value}',
    handlerUrl: '/core-skills/settings_change/settings_change.js',
    makeHandleFn: settingsHandleFn,
  },
  {
    name: 'STOP',
    description: `Pause the conversation. Use it to wait for the user to respond, or when the conversation is over.`,
    value: true,
    // formatFn: m => `Conversation paused`,
    format: 'Conversation paused',
    handlerUrl: '/core-skills/stop/stop.js',
    makeHandleFn: stopHandleFn,
  },
];