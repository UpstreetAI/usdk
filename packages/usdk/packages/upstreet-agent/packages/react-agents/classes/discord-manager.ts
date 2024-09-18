import {
  DiscordBotRoomSpec,
  DiscordBotArgs,
  ConversationAddEventData,
  ConversationRemoveEventData,
  ActiveAgentObject,
  AgentSpec,
  ExtendableMessageEvent,
  ActionMessageEventData,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
import { DiscordBotClient } from '../lib/discord/discord-client'; // XXX this can be moved to Typescript
import { formatConversationMessage } from '../util/message-utils';
import {
  bindAgentConversation,
} from '../runtime';

//

const testRoomNameMatch = (channelName: string, channelSpec: DiscordBotRoomSpec) => {
  if (typeof channelSpec === 'string') {
    return channelName.toLowerCase() === channelSpec.toLowerCase();
  } else if (channelSpec instanceof RegExp) {
    return channelSpec.test(channelName);
  } else {
    return false;
  }
};

//

export class DiscordBot extends EventTarget {
  id: string;
  token: string;
  channels: DiscordBotRoomSpec[];
  dms: DiscordBotRoomSpec[];
  userWhitelist: string[];
  agent: ActiveAgentObject;
  discordBotClient: DiscordBotClient;
  channelConversations: Map<string, ConversationObject>; // channelId -> conversation
  dmConversations: Map<string, ConversationObject>; // userId -> conversation
  abortController: AbortController;
  constructor(args: DiscordBotArgs) {
    super();

    // arguments
    const {
      token,
      channels,
      dms,
      userWhitelist,
      agent,
    } = args;
    this.token = token;
    this.channels = channels;
    this.dms = dms;
    this.userWhitelist = userWhitelist;
    this.agent = agent;

    // abort controller
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // initialize discord bot client
    const discordBotClient = new DiscordBotClient({
      token,
    });
    // bind discord bot client
    signal.addEventListener('abort', () => {
      discordBotClient.destroy();
    });

    this.channelConversations = new Map();
    this.dmConversations = new Map();

    // connect discord bot client
    const _connect = async () => {
      const status = await discordBotClient.status();
      if (signal.aborted) return;

      let connectableChannels = status.channels
        .filter((channel: any) => [0, 2].includes(channel.type));
      if (channels.length > 0) {
        connectableChannels = connectableChannels
          .filter((channel: any) =>
            channels
              .some(channelSpec => testRoomNameMatch(channel.name, channelSpec))
          );
      }

      let connectableDms = status.users;
      if (dms.length > 0) {
        connectableDms = connectableDms
          .filter((user: any) =>
            dms
              .some(dmSpec => testRoomNameMatch(user.displayName, dmSpec))
          );
      }
      console.log('got channels + users', {
        connectableChannels,
        connectableDms,
      });

      await discordBotClient.connect({
        channels: connectableChannels.map((o: any) => o.name),
        dms: connectableDms.map((o: any) => o.displayName),
        userWhitelist,
      });
      if (signal.aborted) return;
    };
    const _bindChannels = () => {
      discordBotClient.addEventListener('channelconnect', (e: MessageEvent<{channel: any}>) => {
        const {
          channel,
        } = e.data;
        const {
          id: channelId,
          type,
        } = channel;
        console.log('channelconnect', e.data, {
          channelId,
          type,
        });
        if (type === 0) { // text channel
          const conversation = new ConversationObject({
            agent,
            getHash: () => {
              return `discord:channel:${channelId}`;
            },
          });
          this.channelConversations.set(channelId, conversation);

          bindAgentConversation({
            agent,
            conversation,
          });

          this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
            data: {
              conversation,
            },
          }));

          // console.log('write text to channel', {
          //   channelId,
          // });
          // const text = `hi there!`;
          // discordBotClient.input.writeText(text, {
          //   channelId,
          // });
        // } else if (type === 2) { // voice channel
        //   // nothing
        }
      });
      discordBotClient.addEventListener('dmconnect', (e: MessageEvent<{user: any}>) => {
        const {
          user,
        } = e.data;
        const {
          id: userId,
        } = user;

        const conversation = new ConversationObject({
          agent,
          getHash: () => {
            return `discord:dm:${userId}`;
          },
        });
        this.dmConversations.set(userId, conversation);

        bindAgentConversation({
          agent,
          conversation,
        });

        this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
          data: {
            conversation,
          },
        }));

        // console.log('write text to user', {
        //   userId,
        // });
        // const text = `hiya!!`;
        // discordBotClient.input.writeText(text, {
        //   userId,
        // });
      });
    };
    const _bindIncoming = () => {
      // chat messages
      discordBotClient.addEventListener('text', async (e: MessageEvent) => {
        const {
          userId,
          username,
          text,
          channelId, // if there is no channelId, it's a DM
          // XXX this can be made more explicit with a type: string field...
        } = e.data;

        // look up conversation
        let conversation: ConversationObject | null = null;
        if (channelId) {
          conversation = this.channelConversations.get(channelId) ?? null;
        } else {
          conversation = this.dmConversations.get(userId) ?? null;
        }
        if (conversation) {
          const rawMessage = {
            method: 'say',
            args: {
              text,
            },
          };
          const agent = {
            id: userId,
            name: username,
          };
          const newMessage = formatConversationMessage(rawMessage, {
            agent,
          });
          await conversation.addLocalMessage(newMessage);
        } else {
          console.warn('got message for unknown conversation', {
            data: e.data,
            channelConversations: this.channelConversations,
            dmConversations: this.dmConversations,
          });
        }
      });
    };
    const _bindOutgoing = () => {
      // chat messages
      this.conversation.addEventListener('remotemessage', async (e: ExtendableMessageEvent<ActionMessageEventData>) => {
        // XXX look up this conversation's discord bot channel/dm, and writeText to it
        // const { message } = e.data;
        // if (realms.isConnected()) {
        //   realms.sendChatMessage(message);
        // }
      });
      // audio
      this.conversation.addEventListener('audiostream', async (e: MessageEvent) => {
        // XXX finish this
        console.log('conversation outgoing audio stream', e.data);
        // const audioStream = e.data.audioStream as PlayableAudioStream;
        // (async () => {
        //   const {
        //     waitForFinish,
        //   } = realms.addAudioSource(audioStream);
        //   await waitForFinish();
        //   realms.removeAudioSource(audioStream);
        // })();
      });
      // typing
      this.conversation.addEventListener('typingstart', (e) => {
        // XXX sendTyping needs an object with { channelId | userId }
        discordBotClient.sendTyping(); // expires after 10 seconds
      });
      // this.conversation.addEventListener('typingend', (e) => {
      // });
    };

    (async () => {
      _bindChannels();
      _bindIncoming();
      _bindOutgoing();
      await _connect();
    })();
  }
  destroy() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
export class DiscordManager extends EventTarget {
  addDiscordBot(args: DiscordBotArgs) {
    const discordBot = new DiscordBot(args);

    // route conversation events: discord bot -> discord manager
    discordBot.addEventListener('conversationadd', (e: MessageEvent<ConversationAddEventData>) => {
      this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
        data: e.data,
      }));
    });
    discordBot.addEventListener('conversationremove', (e: MessageEvent<ConversationRemoveEventData>) => {
      this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
        data: e.data,
      }));
    });

    return discordBot;
  }
  removeDiscordBot(discordBot: DiscordBot) {
    discordBot.destroy();
  }
  live() {
    // nothing
  }
  destroy() {
    // nothing
  }
}