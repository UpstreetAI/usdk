import { z } from 'zod';
import dedent from 'dedent';
import {
  defaultVoices,
} from '../agent-defaults.mjs';

export const featureSpecs = [
  {
    name: 'public',
    description: dedent`\
      Agent is publicly available.
    ` + '\n'
    + defaultVoices.map(v => `* ${JSON.stringify(v.name)}: ${v.voiceEndpoint}`).join('\n'),
    schema: z.union([
      z.object({
        maxUserMessages: z.number(),
        maxUserMessagesTime: z.number(),
      }),
      z.null(),
    ]),
    imports: () => [
      'Public',
    ],
    components: ({
      maxUserMessages,
      maxUserMessagesTime,
    }) => [
      dedent`
        <Public maxUserMessages={${maxUserMessages}} maxUserMessagesTime={${maxUserMessagesTime}} />
      `,
    ],
  },
  {
    name: 'tts',
    description: dedent`\
      Text to speech.
      Available voice endpoints:
    ` + '\n'
    + defaultVoices.map(v => `* ${JSON.stringify(v.name)}: ${v.voiceEndpoint}`).join('\n'),
    schema: z.union([
      z.object({
        voiceEndpoint: z.enum(defaultVoices.map(v => v.voiceEndpoint)),
      }),
      z.null(),
    ]),
    imports: () => [
      'TTS',
    ],
    components: ({
      voiceEndpoint,
    }) => [
      dedent`
        <TTS voiceEndpoint=${JSON.stringify(voiceEndpoint)} />
      `,
    ],
  },
];