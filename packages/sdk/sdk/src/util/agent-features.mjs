import { z } from 'zod';
import dedent from 'dedent';
import { currencies, intervals } from '../constants.mjs';

export const paymentPropsType = z.object({
  name: z.string(),
  description: z.string().optional(),
  amount: z.number().int(),
  currency: z.enum(currencies),
});
export const paymentItemType = z.object({
  type: z.literal('payment'),
  props: paymentPropsType,
});
export const subscriptionPropsType = z.object({
  name: z.string(),
  description: z.string().optional(),
  amount: z.number().int(),
  currency: z.enum(currencies),
  interval: z.enum(intervals),
  intervalCount: z.number(),
});
export const subscriptionItemType = z.object({
  type: z.literal('subscription'),
  props: subscriptionPropsType,
});
export const storeItemType = z.union([
  paymentItemType,
  subscriptionItemType,
]);

//

export const defaultVoices = [
  {
    voiceEndpoint: 'elevenlabs:kadio:YkP683vAWY3rTjcuq2hX',
    name: 'Kaido',
    description: 'Teenage anime boy',
  },
  {
    voiceEndpoint: 'elevenlabs:drake:1thOSihlbbWeiCGuN5Nw',
    name: 'Drake',
    description: 'Anime male',
  },
  {
    voiceEndpoint: 'elevenlabs:terrorblade:lblRnHLq4YZ8wRRUe8ld',
    name: 'Terrorblade',
    description: 'Monstrous male',
  },
  {
    voiceEndpoint: 'elevenlabs:scillia:kNBPK9DILaezWWUSHpF9',
    name: 'Scillia',
    description: 'Teenage anime girl',
  },
  {
    voiceEndpoint: 'elevenlabs:mommy:jSd2IJ6Fdd2bD4TaIeUj',
    name: 'Mommy',
    description: 'Anime female',
  },
  {
    voiceEndpoint: 'elevenlabs:uni:PSAakCTPE63lB4tP9iNQ',
    name: 'Uni',
    description: 'Waifu girl',
  },
];

//

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
      \`amount\` in cents (e.g. 100 = $1).
    `,
    schema: z.union([
      z.array(storeItemType),
      z.null(),
    ]),
    imports: (storeItems) => {
      const isValidStoreItem = (storeItem) =>
        !!storeItem.props.name && !!storeItem.props.amount && !!storeItem.props.currency;

      const result = [];
      if (storeItems.some((storeItem) => storeItem.type === 'payment' && isValidStoreItem(storeItem))) {
        result.push('Payment');
      }
      if (storeItems.some((storeItem) => storeItem.type === 'subscription' && isValidStoreItem(storeItem))) {
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