import uuidByString from 'uuid-by-string';
import {
  TelnyxArgs,
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
import { TelnyxClient } from '../lib/telnyx/telnyx-client';
import { formatConversationMessage } from '../util/message-utils';
import {
  bindConversationToAgent,
} from '../runtime';
import { ConversationManager } from './conversation-manager';

//

type TelnyxCallType = 'message' | 'voice';
type TelnyxCall = {
  id: string;
  phoneNumber: string;
  type: TelnyxCallType;
};
type TelnyxCallArgs = {
  call: TelnyxCall,
};

type TelnyxPhoneNumberArgs = {
  call: TelnyxCall,
  phoneNumber: string;
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
const getTelnyxCallConversationHash = (callId: string) =>
  `telnyx:call:${callId}`;
const bindOutgoing = ({
  conversation,
  telnyxClient,
  callId,
}: {
  conversation: ConversationObject,
  telnyxClient: TelnyxClient,
  callId: string,
}) => {
  // chat messages
  conversation.addEventListener('remotemessage', async (e: Event) => {
    const e2 = e as ExtendableMessageEvent<ActionMessageEventData>;
    // console.log('telnyx manager outgoing message', e.data, {
    //   channelId,
    //   userId,
    // });
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
      telnyxClient.send(text, {
        callId,
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
  message: boolean;
  voice: boolean;
  agent: ActiveAgentObject;
  conversations: Map<string, ConversationObject>;
  abortController: AbortController;
  constructor(args: TelnyxArgs) {
    super();

    // arguments
    const {
      apiKey,
      phoneNumbers,
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

    this.conversations = new Map();

    // connect telnyx client
    const _connect = async () => {
      console.log('telnyx connect 1');
      const status = await telnyxClient.status();
      if (signal.aborted) return;

      console.log('telnyx connect 2');
      let connectablePhoneNumbers = status.phoneNumbers;
      if (phoneNumbers.length > 0) {
        connectablePhoneNumbers = connectablePhoneNumbers
          .filter((pn: string) => phoneNumbers.includes(pn));
      }
      console.log('telnyx connect 3', {
        connectablePhoneNumbers,
      });
      await telnyxClient.connect({
        connectablePhoneNumbers,
      });
      console.log('telnyx connect 4');
      if (signal.aborted) return;
      console.log('telnyx connect 5');
    };
    const _bindCalls = () => {
      telnyxClient.addEventListener('callconnect', (e: MessageEvent<TelnyxCallArgs>) => {
        const {
          call,
        } = e.data;
        const {
          id: callId,
          type,
        } = call;
        if (type === 'message' && this.message) {
          const conversation = new ConversationObject({
            agent,
            getHash: () => {
              return getTelnyxCallConversationHash(callId);
            },
          });
          this.conversations.set(callId, conversation);

          bindConversationToAgent({
            agent,
            conversation,
          });
          bindOutgoing({
            conversation,
            telnyxClient,
            callId,
          });

          this.dispatchEvent(new MessageEvent<ConversationAddEventData>('conversationadd', {
            data: {
              conversation,
            },
          }));
        } else if (type === 'voice' && this.voice) {
          // nothing
        }
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
      telnyxClient.addEventListener('phonenumberadd', (e: MessageEvent<TelnyxPhoneNumberArgs>) => {
        const { call, phoneNumber } = e.data;
        const {
          id: callId,
        } = call;
        // console.log('got phone number add', {
        //   member,
        // });
        const player = makePlayerFromPhoneNumber(phoneNumber);
        const conversation = this.conversations.get(callId);
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
      telnyxClient.addEventListener('phonenumberremove', (e: MessageEvent<TelnyxPhoneNumberArgs>) => {
        const { call, phoneNumber } = e.data;
        const {
          id: callId,
        } = call;
        // console.log('got phone number remove', {
        //   member,
        // });
        const playerId = uuidByString(phoneNumber);
        const conversation = this.conversations.get(callId);
        if (conversation) {
          conversation.removeAgent(playerId);
        } else {
          console.warn('got phone number remove for unknown conversation', {
            data: e.data,
            conversations: this.conversations,
          });
        }
      });
    };
    const _bindIncoming = () => {
      // chat messages
      telnyxClient.addEventListener('message', async (e: MessageEvent) => {
        const {
          call,
          phoneNumber,
          text,
        } = e.data;
        const {
          callId,
        } = call;

        // look up conversation
        const conversation = this.conversations.get(callId);
        if (conversation) {
          const rawMessage = {
            method: 'say',
            args: {
              text,
            },
          };
          const id = getIdFromPhoneNumber(phoneNumber);
          const username = getUsernameFromPhoneNumber(phoneNumber);
          const agent = {
            id,
            name: username,
          };
          const newMessage = formatConversationMessage(rawMessage, {
            agent,
          });
          await conversation.addLocalMessage(newMessage);
        } else {
          console.warn('got message for unknown conversation', {
            data: e.data,
            conversations: this.conversations,
          });
        }
      });
    };

    (async () => {
      _bindCalls();
      _bindPhoneNumberAdd();
      _bindPhoneNumberRemove();
      _bindIncoming();
      await _connect();
    })();
  }
  destroy() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }
}
export class TelnyxManager {
  conversationManager: ConversationManager;
  constructor({
    conversationManager,
  }: {
    conversationManager: ConversationManager,
  }) {
    this.conversationManager = conversationManager;
  }
  addTelnyxBot(args: TelnyxArgs) {
    const telnyxBot = new TelnyxBot(args);

    telnyxBot.addEventListener('conversationadd', (e: Event) => {
      const e2 = e as MessageEvent<ConversationAddEventData>;
      this.conversationManager.addConversation(e2.data.conversation);
    });
    telnyxBot.addEventListener('conversationremove', (e: Event) => {
      const e2 = e as MessageEvent<ConversationRemoveEventData>;
      this.conversationManager.removeConversation(e2.data.conversation);
    });

    return telnyxBot;
  }
  removeTelnyxBot(telnyxBot: TelnyxBot) {
    telnyxBot.destroy();
  }
  live() {
    // nothing
  }
  destroy() {
    // nothing
  }
}