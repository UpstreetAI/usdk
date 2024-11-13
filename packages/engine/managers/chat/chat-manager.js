// import {
//   makeId,
//   makePromise,
// } from '../../util.js';
// import {
//   VoiceEndpointVoicer,
//   VoiceEndpoint,
// } from '../../audio/voice-output/voice-endpoint-voicer.js';
// import {
//   voiceEndpointBaseUrl,
// } from '../../endpoints.js';

import uuidByString from 'uuid-by-string';
import {
  QueueManager,
} from '../queue/queue-manager.js';
// import {
//   Conversation,
// } from '../lore/conversation.js';
import {
  Memory,
  MemoriesManager,
} from '../memories/memories-manager.js';
import {
  Message,
} from '../lore/message.js';
import { sayCommandType } from '../lore/util.js';

// import {
//   embed,
// } from '../../embedding.js';

//

// const narratorVoiceId = `1Cg9Oc_K9UDe5WgVDAcaCSbbBoo-Npj1E`; // 'Discord'

//

/* const _getEmotion = text => {
  let match;
  if (match = text.match(/(😃|😊|😁|😄|😆|(?:^|\s)lol(?:$|\s))/)) {
    match.emotion = 'joy';
    return match;
  } else if (match = text.match(/(😉|😜|😂|😍|😎|😏|😇|❤️|💗|💕|💞|💖|👽)/)) {
    match.emotion = 'fun';
    return match;
  } else if (match = text.match(/(😞|😖|😒|😱|😨|😰|😫)/)) {
    match.emotion = 'sorrow';
    return match;
  } else if (match = text.match(/(😠|😡|👿|💥|💢)/)) {
    match.emotion = 'angry';
    return match;
  } else if (match = text.match(/(😐|😲|😶)/)) {
    match.emotion = 'neutral';
    return match;
  } else {
    return null;
  }
}; */

//

export class ChatManager extends EventTarget {
  constructor({
    playersManager,
    audioManager,
    voiceQueueManager,
    supabaseClient,
    chatMemoriesManager,
    characterMemoriesManager,
  }) {
    super();

    if (!playersManager || !audioManager || !voiceQueueManager || !supabaseClient || !chatMemoriesManager || !characterMemoriesManager) {
      console.warn('missing arguments', {
        playersManager,
        audioManager,
        voiceQueueManager,
        supabaseClient,
        chatMemoriesManager,
        characterMemoriesManager,
      });
      debugger;
    }

    this.playersManager = playersManager;
    this.audioManager = audioManager;
    this.voiceQueueManager = voiceQueueManager;
    this.supabaseClient = supabaseClient;
    this.chatMemoriesManager = chatMemoriesManager;
    this.characterMemoriesManager = characterMemoriesManager;

    this.worldId = '';
    this.conversations = [];
    this.messages = [];
    this.conversation = null;

    this.connectQueue = new QueueManager();
    this.channel = null;
    this.#chatRequests = new Map();
  }

  #chatRequests;

  getConversations() {
    return this.conversations;
  }
  getMessages() {
    return this.messages;
  }

  async addMessage(m, {
    source = '',
  } = {}) {
    await this.connectQueue.waitForTurn(async () => {
      this.messages.push(m);

      this.dispatchEvent(new MessageEvent('message', {
        data: {
          message: m,
          source,
        },
      }));

      const raw = m.getRaw();
      if (source !== 'agent' && typeof globalThis.readChat === 'function') {
        globalThis.readChat(raw);
      }
      if (this.worldId) {
        const key = this.conversation ? [this.worldId, this.conversation.id].join(':') : this.worldId;
        (async () => {
          let memory = new Memory({
            name: key,
            raw,
          });
          memory = await MemoriesManager.bakeMemory(memory);
          const rawMemory = {
            ...memory.toJSON(),
            user_id: this.supabaseClient.profile.user.id,
          };

          // console.log('send addmessage', {
          //   key,
          //   rawMemory,
          // });
          this.channel.send({
            type: 'broadcast',
            event: `${key}:addmessage`,
            payload: {
              message: rawMemory,
            },
          });

          await Promise.all([
            this.chatMemoriesManager.upsertRawMemory(rawMemory),
            this.characterMemoriesManager.upsertRawMemory(rawMemory),
          ]);
        })();
      } else {
        console.warn('not in a world', {
          worldId: this.worldId,
          conversation: this.conversation,
        });
      }
    });
  }
  async removeConversation(c) {
    const index = this.conversations.indexOf(c);

    if (index !== -1) {
      this.conversations.splice(index, 1);

      // console.log('conversation remove', c);
      await this.supabaseClient.supabase
        .from('conversations')
        .delete()
        .eq('id', c.id)
        .maybeSingle();

      this.dispatchEvent(new MessageEvent('conversationremove', {
        data: {
          conversation: c,
        },
      }));
    } else {
      console.warn('remove unknown conversation', {
        conversation: c,
        conversations: this.conversations,
      });
    }
  }
  async setConversationName(conversationId, name) {
    const index = this.conversations.findIndex(c => c.id === conversationId);
    if (index !== -1) {
      const conversation = this.conversations[index];
      conversation.name = name;

      // update "name" of conversation where "id" = conversationId
      const result = await this.supabaseClient.supabase
        .from('conversations')
        .update({
          name,
        })
        .eq('id', conversationId);
    } else {
      console.warn('set unknown conversation name', {
        conversationId,
        name,
        conversations: this.conversations,
      });
    }
  }
  async removeMessage(m) {
    const index = this.messages.indexOf(m);

    if (index !== -1) {
      this.messages.splice(index, 1);

      const raw = m.getRaw();
      await this.supabaseClient.supabase
        .from(this.chatMemoriesManager.schema.tableName)
        .delete()
        .eq('id', raw.id)
        .maybeSingle();

      const key = [this.worldId, this.conversation.id].join(':');
      this.channel.send({
        type: 'broadcast',
        event: `${key}:removemessage`,
        payload: {
          id: raw.id,
        },
      });

      this.dispatchEvent(new MessageEvent('messageremove', {
        data: {
          message: m,
        },
      }));
    } else {
      console.warn('remove unknown message', {
        message: m,
        messages: this.messages,
      });
    }
  }

  async addMessageBusy(roomId, message, avatar_image, avatar_name, user_name, room_id, user_id) {
    const raw = message.getRaw();
    let memory = new Memory({
      name: roomId,
      raw,
    });
    await MemoriesManager.bakeMemory(memory);

    const message_data = {
      avatar_image,
      avatar_name,
      message: raw.content,
      user_name,
      user_type: "user",
      room_id,
      user_id,
    }

    this.channel.send({
      type: 'broadcast',
      event: `${roomId}:addmessage`,
      payload: {
        message: message_data,
      },
    });
  }

  removeChatRequest(roomId) {
    this.#chatRequests.delete(roomId);
  }

  addChatRequest(roomId) {
    if (this.#chatRequests.has(roomId)) {
      return;
    }
    this.#chatRequests.set(roomId, true);
    this.addChatRequestListener(roomId);
  }

  addChatRequestListener(roomId) {
    this.channel.on('broadcast', {
      event: `${roomId}:addmessage`,
    }, data => {
      const {
        payload,
      } = data;
      const { message } = payload;
      this.dispatchEvent(new MessageEvent('message_request', {
        data: {
          message,
        },
      }));
    })
  }

  addChatRequestListeners() {
    this.#chatRequests.forEach((value, key) => {
      this.channel.on('broadcast', {
        event: `${key}:addmessage`,
      }, data => {
        const {
          payload,
        } = data;
        const { message } = payload;
        this.dispatchEvent(new MessageEvent('message_request', {
          data: {
            message,
          },
        }));
      })
    });
  }

  async connectChat(worldId, conversationId = uuidByString(worldId)) {
    await this.connectQueue.waitForTurn(async () => {
      const result = await this.supabaseClient.supabase
        .from('conversations')
        .select('*')
        .eq('parentName', worldId)
        .order('created_at', {
          ascending: true,
        });
      if (!result.error) {
        this.conversations = result.data;
        this.worldId = worldId;

        this.dispatchEvent(new MessageEvent('connect', {
          data: {
            worldId,
          },
        }));

        let conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) {
          this.dispatchEvent(new MessageEvent('conversationloading:start'));
          conversation = await this.createConversation({
            conversationId,
          });
          this.dispatchEvent(new MessageEvent('conversationsload'));

          this.messages = [];
          this.conversation = conversation;
          this.dispatchEvent(new MessageEvent('conversationload'));
          this.dispatchEvent(new MessageEvent('conversationloading:end'));
        } else {
          this.dispatchEvent(new MessageEvent('conversationloading:start'));
          this.dispatchEvent(new MessageEvent('conversationsload'));

          this.messages = await this.#loadMessagesByRange(
            this.worldId,
            conversation.id,
            0,
            500, // Load up to a maximum of 500 messages initially
          );
          this.conversation = conversation;
          this.dispatchEvent(new MessageEvent('conversationload'));
          this.dispatchEvent(new MessageEvent('conversationloading:end'));
        }

        // listen for changes
        const key = [this.worldId, this.conversation.id].join(':');
        this.channel = this.supabaseClient.supabase
          .channel(this.chatMemoriesManager.schema.tableName, {
            config: {
              broadcast: {
                self: false,
              },
            },
          })
          .on('broadcast', {
            event: `${key}:addmessage`,
          }, data => {
            const {
              payload,
            } = data;
            const {
              message: rawMessage,
            } = payload;
            if (!rawMessage.type) {
              rawMessage.type = sayCommandType
            }
            const message = Message.fromRaw(rawMessage);
            this.messages.push(message);
            this.dispatchEvent(new MessageEvent('message', {
              data: {
                message,
                source: 'remote',
              },
            }));
          })
          .on('broadcast', {
            event: `${key}:removemessage`,
          }, data => {
            const {
              payload,
            } = data;
            const {
              id: messageId,
            } = payload;
            const messageIndex = this.messages.findIndex(message => message.getRaw().id === messageId);
            if (messageIndex !== -1) {
              this.messages.splice(messageIndex, 1);

              this.dispatchEvent(new MessageEvent('messageremove', {
                data: {
                  messageId,
                  source: 'remote',
                },
              }));
            } else {
              console.warn('remove unknown message', {
                messageId,
                messages: this.messages,
              });
            }
          })
          .on('error', err => {
            console.warn('error', err);
          })
          .subscribe();

          this.addChatRequestListeners();
      } else {
        throw new Error(JSON.stringify(result.error));
      }
    });
  }
  async disconnectChat() {
    await this.connectQueue.waitForTurn(async () => {
      this.dispatchEvent(new MessageEvent('disconnect', {
        data: {
          worldId: this.worldId,
        },
      }));

      this.conversations = [];
      this.worldId = '';
      this.dispatchEvent(new MessageEvent('conversationsload'));

      this.messages = [];
      this.conversation = null;
      this.dispatchEvent(new MessageEvent('conversationload'));

      this.channel.unsubscribe();
      this.channel = null;
    });
  }
  async createConversation({
    conversationId = crypto.randomUUID(),
    // conversationId = '00000000-0000-0000-0000-000000000000',
    name = '',
  } = {}) {
    const parentName = this.worldId;

    const newConversation = {
      id: conversationId,
      parentName,
      name,
      user_id: this.supabaseClient.profile.user.id,
    };

    const result = await this.supabaseClient.supabase
      .from('conversations')
      .upsert(newConversation)
      .select('*')
      .order('created_at', {
        ascending: true,
      });
    if (!result.error) {
      this.conversations = this.conversations.concat(result.data);

      const lastConversation = this.conversations[this.conversations.length - 1];

      this.dispatchEvent(new MessageEvent('conversation', {
        data: {
          conversation: lastConversation,
        },
      }));
      return lastConversation;
    } else {
      throw new Error(JSON.stringify(result.error));
    }
  }
  async #loadMessages(worldId, conversationId) {
    const tableName = [worldId, conversationId].join(':');
    const memories = await this.chatMemoriesManager.getMemoriesByName(tableName);
    return memories.map(memory => memory.toMessage());
  }

  async #loadMessagesByRange(worldId, conversationId, from, to) {
    const tableName = [worldId, conversationId].join(':');
    const { memories } = await this.chatMemoriesManager.getMemoriesByRange(
      tableName,
      from,
      to,
    );
    return memories.map((memory) => memory.toMessage());
  }

  async loadMoreMessages(loadingIncrement) {
    const tableName = [this.worldId, this.conversation.id].join(':');

    const { memories, totalCount } =
      await this.chatMemoriesManager.getMemoriesByRange(
        tableName,
        this.messages.length,
        this.messages.length + loadingIncrement - 1,
      );
    const newMessages = memories.map((memory) => memory.toMessage());
    this.messages = [...newMessages, ...this.messages];

    return {data: this.messages, hasMore: this.messages.length < totalCount};
  }

  getConversation() {
    return this.conversation;
  }
  async setConversation(conversation) {
    if (this.worldId) {
      await this.connectQueue.waitForTurn(async () => {
        this.messages = await this.#loadMessages(this.worldId, conversation.id);
        this.conversation = conversation;
        this.dispatchEvent(new MessageEvent('conversationload'));
      });
    } else {
      throw new Error('not connected to a world');
    }
  }

  async clearMessages() {
    this.messages.length = 0;

    this.dispatchEvent(new MessageEvent('conversationload'));

    if (this.worldId) {
      // remove all messages with worldId: worldId
      await this.supabaseClient.supabaase
        .from('chat')
        .delete()
        .eq('name', this.worldId);
    }
  }
}
