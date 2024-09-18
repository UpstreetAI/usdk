import {
  DiscordBotRoomSpec,
  DiscordBotArgs,
  ConversationAddEventData,
  ConversationRemoveEventData,
  ActiveAgentObject,
  AgentSpec,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
import { DiscordBotClient } from '../lib/discord/discord-client';
import { formatConversationMessage } from '../util/message-utils';

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

export class DiscordBot {
  id: string;
  token: string;
  channels: DiscordBotRoomSpec[];
  users: DiscordBotRoomSpec[];
  userWhitelist: string[];
  agent: ActiveAgentObject;
  discordBotClient: DiscordBotClient;
  conversation: ConversationObject;
  abortController: AbortController;
  constructor(args: DiscordBotArgs) {
    // bookkeeping
    this.id = crypto.randomUUID();

    // arguments
    const {
      token,
      channels,
      users,
      userWhitelist,
      agent,
    } = args;
    this.token = token;
    this.channels = channels;
    this.users = users;
    this.userWhitelist = userWhitelist;
    this.agent = agent;

    // conversation
    this.conversation = new ConversationObject({
      agent,
      getHash: () => {
        return `discord:${this.id}`;
      },
    });

    // abort controller
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // initialize discord bot client
    const discordBotClient = new DiscordBotClient({
      token,
      // channelWhitelist,
      // userWhitelist,
    });
    // bind discord bot client
    signal.addEventListener('abort', () => {
      discordBotClient.destroy();
    });

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

      let connectableUsers = status.users;
      if (users.length > 0) {
        connectableUsers = connectableUsers
          .filter((user: any) =>
            users
              .some(userSpec => testRoomNameMatch(user.displayName, userSpec))
          );
      }
      console.log('got channels + users', {
        connectableChannels,
        connectableUsers,
      });

      discordBotClient.addEventListener('channelconnect', (e) => {
        const {
          channel,
        } = e.data;
        const {
          id: channelId,
          type,
        } = channel;
        console.log('connected to channel', e.data, {
          channelId,
          type,
        });
        if (type === 0) { // text channel
          console.log('write text to channel', {
            channelId,
          });
          const text = `hi there!`;
          discordBotClient.input.writeText(text, {
            channelId,
          });
        } else if (type === 2) { // voice channel
          // nothing
        }
      });
      // XXX rename to dmconnect
      discordBotClient.addEventListener('userconnect', (e) => {
        const {
          user,
        } = e.data;
        const {
          id: userId,
        } = user;
        console.log('write text to user', {
          userId,
        });
        const text = `hiya!!`;
        discordBotClient.input.writeText(text, {
          userId,
        });
      });
      discordBotClient.addEventListener('text', async (e: any) => {
        const {
          userId,
          username,
          text,
        } = e.data;
        const rawMessage = {
          method: 'say',
          args: {
            text,
          },
        };
        const agent: AgentSpec = {
          id: userId,
          name: username,
        };
        const newMessage = formatConversationMessage(rawMessage, {
          agent,
        });
        await this.conversation.addLocalMessage(newMessage);
      });

      await discordBotClient.connect({
        channels: connectableChannels.map((o: any) => o.name),
        users: connectableUsers.map((o: any) => o.displayName),
        userWhitelist,
      });
      if (signal.aborted) return;
    };
    const _bindConversation = () => {
      // conversation messages
      // XXX abstract perceptions handling out of chats-manager.ts _bindConversation to runtime.ts and call it here

      // typing
      this.conversation.addEventListener('typingstart', (e) => {
        discordBotClient.sendTyping(); // expires after 10 seconds
      });
      // this.conversation.addEventListener('typingend', (e) => {
      // });
    };

    (async () => {
      await _connect();
      _bindConversation();
    })();
  }
  getConversation() {
    return this.conversation;
  }
  destroy() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
export class DiscordManager extends EventTarget {
  addDiscordBot(args: DiscordBotArgs) {
    const discordBotClient = new DiscordBot(args);

    {
      // emit conversation add event
      const conversation = discordBotClient.getConversation();
      this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
        data: {
          conversation,
        },
      }));
    }

    return discordBotClient;
  }
  removeDiscordBot(client: DiscordBot) {
    {
      // emit conversation remove event
      const conversation = client.getConversation();
      this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
        data: {
          conversation,
        },
      }));
    }

    client.destroy();
  }
  live() {
    // nothing
  }
  destroy() {
    // nothing
  }
}