import uuidByString from 'uuid-by-string';
import {
  TelnyxBotArgs,
  ConversationAddEventData,
  ConversationRemoveEventData,
  ActiveAgentObject,
  ExtendableMessageEvent,
  ActionMessageEventData,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
import {
  Player,
} from './player';
import { TelnyxClient, getTelnyxCallConversationHash } from '../lib/telnyx/telnyx-client';
import type {
  TelnyxMessageArgs,
  TelnyxVoiceArgs,
} from '../lib/telnyx/telnyx-client';
import { formatConversationMessage } from '../util/message-utils';
import {
  bindConversationToAgent,
} from '../runtime';
import { ConversationManager } from './conversation-manager';

//

type BotEventArgs = {
  bot: TelnyxBot,
};

//

const getIdFromPhoneNumber = (phoneNumber: string) => uuidByString(phoneNumber);
const getUsernameFromPhoneNumber = (phoneNumber: string) => phoneNumber;
const makePlayerFromPhoneNumber = (phoneNumber: string) => {
  const id = getIdFromPhoneNumber(phoneNumber);
  const name = getUsernameFromPhoneNumber(phoneNumber);
  const player = new Player(id, {
    name,
  });
  return player;
};
const bindOutgoing = ({
  conversation,
  telnyxClient,
  fromPhoneNumber,
  toPhoneNumber,
}: {
  conversation: ConversationObject,
  telnyxClient: TelnyxClient,
  fromPhoneNumber: string,
  toPhoneNumber: string,
}) => {
  // chat messages
  conversation.addEventListener('remotemessage', async (e: Event) => {
    const e2 = e as ExtendableMessageEvent<ActionMessageEventData>;
    console.log('telnyx manager outgoing message', {
      fromPhoneNumber,
      toPhoneNumber,
    }, e2.data);
    const {
      message,
    } = e2.data;
    const {
      method,
      args,
    } = message;
    if (method === 'say') {
      const {
        text,
      } = args as { text: string };
      console.log('telnyx client text', [
        text,
        undefined,
        {
          fromPhoneNumber,
          toPhoneNumber,
        },
      ]);
      telnyxClient.text(text, undefined, {
        fromPhoneNumber,
        toPhoneNumber,
      });
    } else {
      // ignore
    }
  });
  // audio
  conversation.addEventListener('audiostream', async (e: Event) => {
    // XXX finish this
    const e2 = e as MessageEvent;
    console.log('conversation outgoing audio stream', e2.data);
  });
};

//

export class TelnyxBot extends EventTarget {
  apiKey: string;
  phoneNumber: string;
  message: boolean;
  voice: boolean;
  agent: ActiveAgentObject;
  telnyxClient: TelnyxClient;
  conversations = new Map<string, ConversationObject>;
  abortController: AbortController;
  constructor(args: TelnyxBotArgs) {
    super();

    // arguments
    let {
      apiKey,
      phoneNumber,
      message,
      voice,
      agent,
    } = args;
    this.message = message;
    this.voice = voice;
    this.agent = agent;

    // abort controller
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // initialize telnyx client
    const telnyxClient = new TelnyxClient({
      apiKey,
    });
    // bind telnyx client
    signal.addEventListener('abort', () => {
      telnyxClient.destroy();
    });
    // latch telnyx client
    this.telnyxClient = telnyxClient;

    // connect telnyx client
    const _connect = async () => {
      console.log('telnyx connect 1');
      const status = await telnyxClient.status();
      if (signal.aborted) return;

      console.log('telnyx connect 2', status);
      const connectablePhoneNumbers = status.phoneNumbers;
      if (phoneNumber) {
        if (connectablePhoneNumbers.includes(phoneNumber)) {
          // ok
        } else {
          throw new Error('phone number not connectable');
        }
      } else {
        if (connectablePhoneNumbers.length > 0) {
          phoneNumber = connectablePhoneNumbers[0];
        } else {
          throw new Error('no connectable phone numbers');
        }
      }

      this.phoneNumber = phoneNumber;
      await telnyxClient.connect({
        phoneNumber,
      });
      console.log('telnyx connect 4');
      if (signal.aborted) return;
      console.log('telnyx connect 5');
    };
    /* const _bindCalls = () => {
      telnyxClient.addEventListener('callconnect', (e: MessageEvent<TelnyxCallArgs>) => {
        const {
          fromPhoneNumber,
          toPhoneNumber,
        } = e.data;
        const hash = getTelnyxCallConversationHash({
          fromPhoneNumber,
          toPhoneNumber,
        });
        const conversation = new ConversationObject({
          agent,
          getHash: () => hash,
        });
        this.conversations.set(hash, conversation);

        bindConversationToAgent({
          agent,
          conversation,
        });
        bindOutgoing({
          conversation,
          telnyxClient,
          fromPhoneNumber,
          toPhoneNumber,
        });

        this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
          data: {
            conversation,
          },
        }));
      });
      telnyxClient.addEventListener('calldisconnect', (e: MessageEvent<TelnyxCallArgs>) => {
        const {
          call,
        } = e.data;
        const {
          id: callId,
          type,
        } = call;
        const conversation = this.conversations.get(callId);
        if (conversation) {
          this.conversations.delete(callId);
          this.dispatchEvent(new MessageEvent<ConversationRemoveEventData>('conversationremove', {
            data: {
              conversation,
            },
          }));
        } else {
          console.warn('got call disconnect for unknown conversation', {
            callId,
            conversations: this.conversations,
          });
        }
      });
    };
    const _bindPhoneNumberAdd = () => {
      telnyxClient.addEventListener('phonenumberadd', (e: MessageEvent<TelnyxPhoneArgs>) => {
        const {
          fromPhoneNumber,
          toPhoneNumber,
        } = e.data;
        // console.log('got phone number add', {
        //   fromPhoneNumber,
        //   toPhoneNumber,
        // });
        const hash = getTelnyxCallConversationHash({
          fromPhoneNumber,
          toPhoneNumber,
        });
        const conversation = this.conversations.get(hash);
        const player = makePlayerFromPhoneNumber(toPhoneNumber);
        if (conversation) {
          conversation.addAgent(player.playerId, player);
        } else {
          console.warn('got phone number add for unknown conversation', {
            data: e.data,
            conversations: this.conversations,
          });
        }
      });
    };
    const _bindPhoneNumberRemove = () => {
      telnyxClient.addEventListener('phonenumberremove', (e: MessageEvent<TelnyxPhoneArgs>) => {
        const {
          fromPhoneNumber,
          toPhoneNumber,
        } = e.data;
        // console.log('got phone number remove', {
        //  fromPhoneNumber,
        //  toPhoneNumber,
        // });
        const hash = getTelnyxCallConversationHash({
          fromPhoneNumber,
          toPhoneNumber,
        });
        const conversation = this.conversations.get(hash);
        const playerId = getIdFromPhoneNumber(toPhoneNumber);
        if (conversation) {
          conversation.removeAgent(playerId);
        } else {
          console.warn('got phone number remove for unknown conversation', {
            data: e.data,
            conversations: this.conversations,
          });
        }
      });
    }; */
    // XXX support conversation expiry (based on timeout?)
    const ensureConversation = ({
      fromPhoneNumber,
      toPhoneNumber,
    }: {
      fromPhoneNumber: string,
      toPhoneNumber: string,
    }) => {
      const hash = getTelnyxCallConversationHash({
        fromPhoneNumber,
        toPhoneNumber,
      });
      let conversation = this.conversations.get(hash);
      if (!conversation) {
        conversation = new ConversationObject({
          agent,
          getHash: () => hash,
        });
        const player = makePlayerFromPhoneNumber(toPhoneNumber);
        conversation.addAgent(player.playerId, player);

        this.conversations.set(hash, conversation);

        bindConversationToAgent({
          agent,
          conversation,
        });
        bindOutgoing({
          conversation,
          telnyxClient,
          fromPhoneNumber,
          toPhoneNumber,
        });
      }
      return conversation;
    };
    const _bindIncoming = () => {
      // chat messages
      telnyxClient.addEventListener('message', async (e: MessageEvent<TelnyxMessageArgs>) => {
        const {
          // note: handling of these is reversed because the message is from the other person's perspective
          fromPhoneNumber,
          toPhoneNumber,
          text,
        } = e.data;
        console.log('handling telnyx message 1', e.data);

        const conversation = ensureConversation({
          fromPhoneNumber: toPhoneNumber,
          toPhoneNumber: fromPhoneNumber,
        });

        const rawMessage = {
          method: 'say',
          args: {
            text,
          },
        };

        const id = getIdFromPhoneNumber(fromPhoneNumber);
        const username = getUsernameFromPhoneNumber(fromPhoneNumber);
        const agent = {
          id,
          name: username,
        };
        const newMessage = formatConversationMessage(rawMessage, {
          agent,
        });

        console.log('handling telnyx message 2', newMessage);
        await conversation.addLocalMessage(newMessage);
        console.log('handling telnyx message 3');
      });
      // voice data
      telnyxClient.addEventListener('voice', async (e: MessageEvent<TelnyxVoiceArgs>) => {
        const {
          fromPhoneNumber,
          toPhoneNumber,
          data,
        } = e.data;
        console.log('voice', {
          fromPhoneNumber,
          toPhoneNumber,
          data,
        });
        const conversation = ensureConversation({
          fromPhoneNumber,
          toPhoneNumber,
        });
      });
    };

    (async () => {
      // _bindCalls();
      // _bindPhoneNumberAdd();
      // _bindPhoneNumberRemove();
      _bindIncoming();
      await _connect();
    })().catch(err => {
      console.warn('telnyx bot error', err);
    });
  }
  getPhoneNumber() {
    return this.phoneNumber;
  }
  async call(opts: {
    fromPhoneNumber: string,
    toPhoneNumber: string,
  }) {
    this.telnyxClient.call(opts);
  }
  async text(text: string | undefined, mediaUrls: string[] | undefined, opts: {
    fromPhoneNumber: string,
    toPhoneNumber: string,
  }) {
    this.telnyxClient.text(text, mediaUrls, opts);
  }
  destroy() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
export class TelnyxManager extends EventTarget {
  conversationManager: ConversationManager;
  telnyxBots = new Set<TelnyxBot>;
  constructor({
    conversationManager,
  }: {
    conversationManager: ConversationManager,
  }) {
    super();

    this.conversationManager = conversationManager;
  }
  getTelnyxBots() {
    return Array.from(this.telnyxBots);
  }
  addTelnyxBot(args: TelnyxBotArgs) {
    const telnyxBot = new TelnyxBot(args);

    telnyxBot.addEventListener('conversationadd', (e: Event) => {
      const e2 = e as MessageEvent<ConversationAddEventData>;
      this.conversationManager.addConversation(e2.data.conversation);
    });
    telnyxBot.addEventListener('conversationremove', (e: Event) => {
      const e2 = e as MessageEvent<ConversationRemoveEventData>;
      this.conversationManager.removeConversation(e2.data.conversation);
    });
    this.telnyxBots.add(telnyxBot);

    this.dispatchEvent(new MessageEvent<BotEventArgs>('botadd', {
      data: {
        bot: telnyxBot,
      },
    }));

    return telnyxBot;
  }
  removeTelnyxBot(telnyxBot: TelnyxBot) {
    telnyxBot.destroy();
    
    this.telnyxBots.delete(telnyxBot);

    this.dispatchEvent(new MessageEvent<BotEventArgs>('botremove', {
      data: {
        bot: telnyxBot,
      },
    }));
  }
  live() {
    // nothing
  }
  destroy() {
    // nothing
  }
}