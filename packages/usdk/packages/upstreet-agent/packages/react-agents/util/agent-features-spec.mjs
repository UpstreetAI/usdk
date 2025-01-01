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
        defaultValue: defaultVoices[0].voiceEndpoint,
      },
    },

    // Feature in development ( true, false )
    dev: false,
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

    // For Web UI
    displayIcon: 'Chat',
    displayName: 'Rate Limit',
    displayDescription: 'Control how often users can message the agent.',
    form: {
      maxUserMessages: {
        type: 'number',
        label: 'Max User Messages',
        description: 'The maximum number of messages a user can send to the agent.',
        defaultValue: 5,
      },
      maxUserMessagesTime: {
        type: 'number',
        label: 'Max User Messages Time',
        description: 'The time in milliseconds after which a user can send another message to the agent.',
        defaultValue: 60 * 60 * 24 * 1000, // 1 day
      },
      message: {
        type: 'text',
        label: 'Message',
        description: 'The message to send to the agent when the rate limit is exceeded.',
        defaultValue: 'Whoa there! Take a moment.',
      },
    },
    // Feature in development ( true, false )
    dev: false,
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

    // For Web UI
    displayIcon: 'Discord',
    displayName: 'Discord',
    displayDescription: 'Connect your agent to Discord.',
    form: {
      token: {
        type: 'text',
        label: 'Token',
        description: 'The token for your Discord bot.',
        defaultValue: '',
      },
      channels: {
        type: 'text',
        label: 'Channels',
        description: 'The channels to join.',
        options: [
          { value: 'general', label: 'General' },
          { value: 'voice', label: 'Voice' },
        ],
        defaultValue: [],
      },
    },
    // Feature in development ( true, false )
    dev: false,
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

    // For Web UI
    displayIcon: 'X',
    displayName: 'X (Twitter)',
    displayDescription: 'Add a Twitter bot to your agent.',
    form: {
      token: {
        type: 'text',
        label: 'Token',
        description: 'The token for your Twitter bot.',
        defaultValue: '',
      },
    },

    // Feature in development ( true, false )
    dev: false,
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
        defaultValue: '',
      },
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        description: 'The phone number to use for Telnyx.',
        defaultValue: '',
      },
      message: {
        type: 'checkbox',
        label: 'Message',
        description: 'Enable message support.',
        defaultValue: false,
      },
      voice: {
        type: 'checkbox',
        label: 'Voice',
        description: 'Enable voice support.',
        defaultValue: false,
      },
    },

    // Feature in development ( true, false )
    dev: true,
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
    form: {
      items: {
        type: 'array',
        label: 'Items',
        description: 'The items to sell.',
        defaultValue: [],
      },
    },

    // Feature in development ( true, false )
    dev: true,
  },
];
