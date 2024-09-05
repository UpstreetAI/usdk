import { z } from 'zod';
import dedent from 'dedent';
import { defaultVoices } from '../agent-defaults.mjs';
import { currencies, intervals } from '../constants.js';

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
  {
    name: 'rateLimit',
    description: dedent`\
      Agent is publicly available.
      The rate limit is \`maxUserMessages\` messages per \`maxUserMessagesTime\` milliseconds.
      When the rate limit is exceeded, the agent will respond with the static \`message\`.
      If either \`maxUserMessages\` or \`maxUserMessagesTime\` is not provided or zero, the rate limit is disabled.
    ` + '\n'
    + defaultVoices.map(v => `* ${JSON.stringify(v.name)}: ${v.voiceEndpoint}`).join('\n'),
    schema: z.union([
      z.object({
        maxUserMessages: z.number().optional(),
        maxUserMessagesTime: z.number().optional(),
        message: z.string().optional(),
      }),
      z.null(),
    ]),
    imports: () => [
      'RateLimit',
    ],
    // agentProps: (props) => [
    //   `rateLimit={${JSON.stringify(props)}}`,
    // ],
    components: ({
      maxUserMessages,
      maxUserMessagesTime,
      message,
    }) => [
      dedent`
        <RateLimit ${maxUserMessages ? `maxUserMessages={${JSON.stringify(maxUserMessages)}} ` : ''}${maxUserMessagesTime ? `maxUserMessagesTime={${JSON.stringify(maxUserMessagesTime)}} ` : ''}${message ? `message={${JSON.stringify(message)}} ` : ''}/>
      `,
    ],
  },
  {
    name: 'storeItems',
    description: dedent`\
      List of items that can be purchased from the agent, with associated prices.
      \`amount\` is in cents (e.g. 100 = 1 dollar).
    `,
    schema: z.union([
      z.array(z.union([
        z.object({
          type: z.literal('payment'),
          props: z.object({
            name: z.string(),
            description: z.string().optional(),
            amount: z.number().int(),
            currency: z.enum(currencies),
          }),
        }),
        z.object({
          type: z.literal('subscription'),
          props: z.object({
            name: z.string(),
            description: z.string().optional(),
            amount: z.number().int(),
            currency: z.enum(currencies),
            interval: z.enum(intervals),
            intervalCount: z.number(),
          }),
        }),
      ])),
      z.null(),
    ]),
    imports: (storeItems) => {
      const result = [];
      if (storeItems.some((storeItem) => storeItem.type === 'payment')) {
        result.push('Payment');
      }
      if (storeItems.some((storeItem) => storeItem.type === 'subscription')) {
        result.push('Subscription');
      }
      return result;
    },
    // components: ({
    //   maxUserMessages,
    //   maxUserMessagesTime,
    //   message,
    // }) => [
    //   dedent`
    //     <RateLimit ${maxUserMessages ? `maxUserMessages={${JSON.stringify(maxUserMessages)}} ` : ''}${maxUserMessagesTime ? `maxUserMessagesTime={${JSON.stringify(maxUserMessagesTime)}} ` : ''}${message ? `message={${JSON.stringify(message)}} ` : ''}/>
    //   `,
    // ],
    components: (storeItems) => {
      return storeItems.map((storeItem) => {
        if (storeItem.type === 'payment') {
          if (!!storeItem.props.name && !!storeItem.props.amount && !!storeItem.props.currency) {
            return dedent`
              <Payment
                name={${JSON.stringify(storeItem.props.name)}}
                ${storeItem.props.description ? `description={${JSON.stringify(storeItem.props.description)}}` : ''}
                amount={${JSON.stringify(storeItem.props.amount)}}
                currency={${JSON.stringify(storeItem.props.currency)}}
              />
            `;
          } else {
            return '';
          }
        } else if (storeItem.type === 'subscription') {
          if (!!storeItem.props.name && !!storeItem.props.amount && !!storeItem.props.currency) {
            return dedent`
              <Subscription
                name={${JSON.stringify(storeItem.props.name)}}
                ${storeItem.props.description ? `description={${JSON.stringify(storeItem.props.description)}}` : ''}
                amount={${JSON.stringify(storeItem.props.amount)}}
                currency={${JSON.stringify(storeItem.props.currency)}}
                interval={${JSON.stringify(storeItem.props.interval)}}
                intervalCount={${JSON.stringify(storeItem.props.intervalCount)}}
              />
            `;
          } else {
            return '';
          }
        } else {
          throw new Error(`unexpected store item type: ${storeItem.type}`);
        }
      });
    },
  },
];