import { z } from 'zod';
import dedent from 'dedent';
import { currencies, intervals } from '../constants.mjs';

export const paymentPropsType = z.object( {
  name: z.string(),
  description: z.string().optional(),
  amount: z.number().int(),
  currency: z.enum( currencies ),
} );
export const paymentItemType = z.object( {
  type: z.literal( 'payment' ),
  props: paymentPropsType,
} );
export const subscriptionPropsType = z.object( {
  name: z.string(),
  description: z.string().optional(),
  amount: z.number().int(),
  currency: z.enum( currencies ),
  interval: z.enum( intervals ),
  intervalCount: z.number(),
} );
export const subscriptionItemType = z.object( {
  type: z.literal( 'subscription' ),
  props: subscriptionPropsType,
} );
export const storeItemType = z.union( [
  paymentItemType,
  subscriptionItemType,
] );

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

export const featureSpecs = [
  {
    name: 'tts',
    description: dedent`\
      Text to speech.
      Available voice endpoints:
    ` + '\n'
      + defaultVoices.map( v => `* ${JSON.stringify( v.name )}: ${v.voiceEndpoint}` ).join( '\n' ),
    schema: z.union( [
      z.object( {
        voiceEndpoint: z.enum( defaultVoices.map( v => v.voiceEndpoint ) ),
      } ),
      z.null(),
    ] ),
    examples: [{ voiceEndpoint: defaultVoices[0].voiceEndpoint },],

    // Default values
    default: {
      voiceEndpoint: defaultVoices[0].voiceEndpoint,
    },

    // For Web UI
    displayIcon: 'Voice',
    displayName: 'Voice',
    displayDescription: 'Select a voice for your agent.',
    form: {
      voiceEndpoint: {
        type: 'select',
        label: 'Voice',
        description: 'Select a voice for your agent.',
        options: defaultVoices.map( v => ({ value: v.voiceEndpoint, label: v.name }) ),
      },
    },

    // Feature active ( true, false )
    active: true,

    // imports: () => [
    //   'TTS',
    // ],
    // components: ({
    //   voiceEndpoint,
    // }) => [
    //   dedent`
    //     <TTS voiceEndpoint=${JSON.stringify(voiceEndpoint)} />
    //   `,
    // ],
  },
  {
    name: 'rateLimit',
    description: dedent`\
      Agent is publicly available.
      The rate limit is \`maxUserMessages\` messages per \`maxUserMessagesTime\` milliseconds.
      When the rate limit is exceeded, the agent will respond with the static \`message\`.
      If either \`maxUserMessages\` or \`maxUserMessagesTime\` is not provided or zero, the rate limit is disabled.
    ` + '\n'
      + defaultVoices.map( v => `* ${JSON.stringify( v.name )}: ${v.voiceEndpoint}` ).join( '\n' ),
    schema: z.union( [
      z.object( {
        maxUserMessages: z.number().optional(),
        maxUserMessagesTime: z.number().optional(),
        message: z.string().optional(),
      } ),
      z.null(),
    ] ),
    examples: [{ maxUserMessages: 5, maxUserMessagesTime: 60000, message: "Whoa there! Take a moment.", }],

    // Default values
    default: {
      maxUserMessages: 5,
      maxUserMessagesTime: 60 * 60 * 24 * 1000, // 1 day
      message: '',
    },

    // For Web UI
    displayIcon: 'Chat',
    displayName: 'Rate Limit',
    displayDescription: 'Control how often users can message the agent.',
    form: {
      maxUserMessages: {
        type: 'number',
        label: 'Max User Messages',
        description: 'The maximum number of messages a user can send to the agent.',
      },
      maxUserMessagesTime: {
        type: 'number',
        label: 'Max User Messages Time',
        description: 'The time in milliseconds after which a user can send another message to the agent.',
      },
      message: {
        type: 'text',
        label: 'Message',
        description: 'The message to send to the agent when the rate limit is exceeded.',
      },
    },
    // Feature active ( true, false )
    active: true,

    // imports: () => [
    //   'RateLimit',
    // ],
    // components: ({
    //   maxUserMessages,
    //   maxUserMessagesTime,
    //   message,
    // }) => [
    //   dedent`
    //     <RateLimit ${maxUserMessages ? `maxUserMessages={${JSON.stringify(maxUserMessages)}} ` : ''}${maxUserMessagesTime ? `maxUserMessagesTime={${JSON.stringify(maxUserMessagesTime)}} ` : ''}${message ? `message={${JSON.stringify(message)}} ` : ''}/>
    //   `,
    // ],
  },
  {
    name: 'discord',
    description: dedent`\
      Add Discord integration to the agent. Add this feature only when the user explicitly requests it and provides a bot token.

      The user should follow these instructions to set up their bot (you can instruct them to do this):
      - Create a bot application at https://discord.com/developers/applications and note the CLIENT_ID (also called "application id")
      - Enable Privileged Gateway Intents at https://discord.com/developers/applications/CLIENT_ID/bot
      - Add the bot to your server at https://discord.com/oauth2/authorize/?permissions=-2080908480&scope=bot&client_id=CLIENT_ID
      - Get the bot token at https://discord.com/developers/applications/CLIENT_ID/bot
      The token is required and must be provided.

      \`channels\` is a list of channel names (text or voice) that the agent should join.
    `,
    schema: z.union( [
      z.object( {
        token: z.string(),
        channels: z.array( z.string() ),
      } ),
      z.null(),
    ] ),
    examples: [{ token: 'YOUR_DISCORD_BOT_TOKEN', channels: ['general', 'voice'], }],

    // Default values
    default: {
      token: '',
      channels: [],
    },

    // For Web UI
    displayIcon: 'Discord',
    displayName: 'Discord',
    displayDescription: 'Connect your agent to Discord.',
    form: {
      token: {
        type: 'text',
        label: 'Token',
        description: 'The token for your Discord bot.',
      },
      channels: {
        type: 'array',
        label: 'Channels',
        description: 'The channels to join.',
        options: [
          { value: 'general', label: 'General' },
          { value: 'voice', label: 'Voice' },
        ],
      },
    },
    // Feature active ( true, false )
    active: true,

    // imports: (discord) => {
    //   if (discord.token) {
    //     return ['Discord'];
    //   } else {
    //     return [];
    //   }
    // },
    // components: (discord) => {
    //   const channels = formatDiscordBotChannels(discord.channels);
    //   if (discord.token && channels.length > 0) {
    //     return [
    //       dedent`
    //         <Discord
    //           token=${JSON.stringify(discord.token)}
    //           ${discord.channels ? `channels={${JSON.stringify(channels)}}` : ''}
    //         />
    //       `,
    //     ];
    //   } else {
    //     return [];
    //   }
    // },
  },
  {
    name: 'twitterBot',
    description: dedent`\
      Add a Twitter bot to the agent.

      The API token is required.
    `,
    schema: z.union( [
      z.object( {
        token: z.string(),
      } ),
      z.null(),
    ] ),
    examples: [{ token: 'YOUR_TWITTER_BOT_TOKEN', }],

    // Default values
    default: {
      token: '',
    },

    // For Web UI
    displayIcon: 'X',
    displayName: 'X (Twitter)',
    displayDescription: 'Add a Twitter bot to your agent.',
    form: {
      token: {
        type: 'text',
        label: 'Token',
        description: 'The token for your Twitter bot.',
      },
    },

    // Feature active ( true, false )
    active: true,

    // imports: (twitterBot) => {
    //   if (twitterBot.token) {
    //     return ['TwitterBot'];
    //   } else {
    //     return [];
    //   }
    // },
    // components: (twitterBot) => {
    //   if (twitterBot.token) {
    //     return [
    //       dedent`
    //         <TwitterBot
    //           token=${JSON.stringify(twitterBot.token)}
    //         />
    //       `,
    //     ];
    //   } else {
    //     return [];
    //   }
    // },
  },
  {
    name: 'telnyx',
    description: dedent`\
      Add Telnyx phone call/SMS support to the agent. Add this feature only when the user explicitly requests it and provides an api key.

      Phone number is optional, but if provided must be in +E.164 format (e.g. +14151234567).
    `,
    schema: z.union( [
      z.object( {
        apiKey: z.string(),
        phoneNumber: z.string().optional(),
        message: z.boolean(),
        voice: z.boolean(),
      } ),
      z.null(),
    ] ),
    examples: [{ apiKey: 'YOUR_TELNYX_API_KEY', phoneNumber: '+14151234567', message: true, voice: true, }],

    // Default values
    default: {
      apiKey: '',
      phoneNumber: '',
      message: false,
      voice: false,
    },

    // For Web UI
    displayIcon: 'Upstreet',
    displayName: 'Telnyx',
    displayDescription: 'Enable phone call and SMS support for your agent.',
    // Form
    form: {
      apiKey: {
        type: 'text',
        label: 'API Key',
        description: 'The API key for your Telnyx account.',
      },
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        description: 'The phone number to use for Telnyx.',
      },
      message: {
        type: 'checkbox',
        label: 'Message',
        description: 'Enable message support.',
      },
      voice: {
        type: 'checkbox',
        label: 'Voice',
        description: 'Enable voice support.',
      },
    },

    // Feature active ( true, false )
    active: false,

    // imports: (telnyx) => {
    //   if (telnyx.apiKey) {
    //     return ['Telnyx'];
    //   } else {
    //     return [];
    //   }
    // },
    // components: (telnyx) => {
    //   if (telnyx.apiKey) {
    //     return [
    //       dedent`
    //         <Telnyx
    //           apiKey=${JSON.stringify(telnyx.apiKey)}
    //           ${telnyx.phoneNumber ? `phoneNumber=${JSON.stringify(telnyx.phoneNumber)}` : ''}
    //           ${telnyx.message ? `message` : ''}
    //           ${telnyx.voice ? `voice` : ''}
    //         />
    //       `,
    //     ];
    //   } else {
    //     return [];
    //   }
    // },
  },
  {
    name: 'storeItems',
    description: dedent`\
      List of items that can be purchased from the agent, with associated prices.
      \`amount\` in cents (e.g. 100 = $1).
    `,
    schema: z.union( [
      z.array( storeItemType ),
      z.null(),
    ] ),
    examples: [{ type: 'payment', props: { name: 'Art', description: 'An art piece', amount: 499, currency: 'usd', }, },],

    // Default values
    default: [
      {
        type: 'payment',
        props: {
          name: '',
          description: '',
          amount: 100,
          currency: currencies[0],
          interval: intervals[0],
          intervalCount: 1,
        },
      }
    ],

    // For Web UI
    displayIcon: 'ModuleStore',
    displayName: 'Store',
    displayDescription: 'Manage items your agent can sell.',

    // Feature active ( true, false )
    active: true,

    // imports: (storeItems) => {
    //   const isValidStoreItem = (storeItem) =>
    //     !!storeItem.props.name && !!storeItem.props.amount && !!storeItem.props.currency;

    //   const result = [];
    //   if (storeItems.some((storeItem) => storeItem.type === 'payment' && isValidStoreItem(storeItem))) {
    //     result.push('Payment');
    //   }
    //   if (storeItems.some((storeItem) => storeItem.type === 'subscription' && isValidStoreItem(storeItem))) {
    //     result.push('Subscription');
    //   }
    //   return result;
    // },
    // components: (storeItems) => {
    //   return storeItems.map((storeItem) => {
    //     if (storeItem.type === 'payment') {
    //       if (!!storeItem.props.name && !!storeItem.props.amount && !!storeItem.props.currency) {
    //         return dedent`
    //           <Payment
    //             name={${JSON.stringify(storeItem.props.name)}}
    //             ${storeItem.props.description ? `description={${JSON.stringify(storeItem.props.description)}}` : ''}
    //             amount={${JSON.stringify(storeItem.props.amount)}}
    //             currency={${JSON.stringify(storeItem.props.currency)}}
    //           />
    //         `;
    //       } else {
    //         return '';
    //       }
    //     } else if (storeItem.type === 'subscription') {
    //       if (!!storeItem.props.name && !!storeItem.props.amount && !!storeItem.props.currency) {
    //         return dedent`
    //           <Subscription
    //             name={${JSON.stringify(storeItem.props.name)}}
    //             ${storeItem.props.description ? `description={${JSON.stringify(storeItem.props.description)}}` : ''}
    //             amount={${JSON.stringify(storeItem.props.amount)}}
    //             currency={${JSON.stringify(storeItem.props.currency)}}
    //             interval={${JSON.stringify(storeItem.props.interval)}}
    //             intervalCount={${JSON.stringify(storeItem.props.intervalCount)}}
    //           />
    //         `;
    //       } else {
    //         return '';
    //       }
    //     } else {
    //       throw new Error(`unexpected store item type: ${storeItem.type}`);
    //     }
    //   });
    // },
  },
];