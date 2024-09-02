import { z } from 'zod';
import dedent from 'dedent';
import {
  defaultVoices,
} from '../agent-defaults.mjs';

export const featureSpecs = [
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