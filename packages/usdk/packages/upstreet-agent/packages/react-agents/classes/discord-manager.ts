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
import { DiscordBotClient } from '../lib/discord/discord-client';
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
  users: DiscordBotRoomSpec[];
  userWhitelist: string[];
  agent: ActiveAgentObject;
  discordBotClient: DiscordBotClient;
  conversation: ConversationObject;
  abortController: AbortController;
  constructor(args: DiscordBotArgs) {
    super();

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

    // XXX should be one conversation per channel
    // XXX and it should be rendered out in the agent
    // conversation
    this.conversation = new ConversationObject({
      agent,
      getHash: () => {
        return `discord:${this.id}`;
      },
    });
    // XXX move this dispatch to the new conversation construction time
    this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
      data: {
        conversation: this.conversation,
      },
    }));

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

      // XXX move these bindings to instantiate conversations below
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

      await discordBotClient.connect({
        channels: connectableChannels.map((o: any) => o.name),
        users: connectableUsers.map((o: any) => o.displayName),
        userWhitelist,
      });
      if (signal.aborted) return;
    };
    const _bindIncoming = () => {
      // chat messages
      discordBotClient.addEventListener('text', async (e) => {
        const {
          userId,
          username,
          text,
          channelId, // if there is no channelId, it's a DM
        } = e.data;
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
        await this.conversation.addLocalMessage(newMessage);
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
        discordBotClient.sendTyping(); // expires after 10 seconds
      });
      // this.conversation.addEventListener('typingend', (e) => {
      // });
    };
    const _bindAgent = () => {
      bindAgentConversation({
        agent,
        conversation: this.conversation,
      });
    };

    (async () => {
      _bindIncoming();
      _bindOutgoing();
      _bindAgent();
      await _connect();
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
  removeDiscordBot(client: DiscordBot) {
    // this should trigger conversationremove events
    client.destroy();
  }
  live() {
    // nothing
  }
  destroy() {
    // nothing
  }
}