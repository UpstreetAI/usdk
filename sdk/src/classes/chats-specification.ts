// import { useContext, useEffect } from 'react';
// import type { Context } from 'react';
// import { z } from 'zod';
// import * as Y from 'yjs';
// import type { ZodTypeAny } from 'zod';
// import dedent from 'dedent';
// import {
//   EpochContext,
// } from '../context';
// import {
//   AgentObject,
// } from './agent-object';
import type {
  // AppContextValue,
  // ActionProps,
  // FormatterProps,
  // PromptProps,
  // ParserProps,
  // PerceptionProps,
  // TaskProps,
  // NameProps,
  // PersonalityProps,
  // ServerProps,
  // TaskObject,
  // PendingActionMessage,
  // MemoryOpts,
  // SubtleAiCompleteOpts,
  // SubtleAiImageOpts,
  // ChatMessages,
  // ActionHistoryQuery,
  // Memory,
  // ActionOpts,
  // PerceptionEventData,
  // ConversationChangeEventData,
  // ConversationAddEventData,
  // ConversationRemoveEventData,
  // ActionMessageEventData,
  // ActionMessageEvent,
  // MessagesUpdateEventData,
  // PlayableAudioStream,
  // ActiveAgentObject,
  RoomSpecification,
} from '../types';
// import {
//   ConversationObject,
// } from './conversation-object';
import {
  QueueManager,
  // MultiQueueManager,
} from '../util/queue-manager.mjs';
// import {
//   makePromise,
//   parseCodeBlock,
// } from '../util/util.mjs';
// import { Player } from './player';
// import { NetworkRealms } from '../lib/multiplayer/public/network-realms.mjs';
// import {
//   loadMessagesFromDatabase,
// } from '../util/loadMessagesFromDatabase.js';
import {
  ExtendableMessageEvent,
} from '../util/extendable-message-event';
// import {
//   retry,
// } from '../util/util.mjs';
// import {
//   GenerativeAgentObject,
// } from './generative-agent-object';
// import {
//   SceneObject,
// } from './scene-object';
// import { AgentRegistry, emptyAgentRegistry } from './render-registry';
// import { multiplayerEndpointUrl } from '../util/endpoints.mjs';

//

const activeChatsAlarmRate = 10000;
export const roomsSpecificationEquals = (a: RoomSpecification, b: RoomSpecification) => {
  return a.room === b.room && a.endpointUrl === b.endpointUrl;
};

//

const getRoomsSpecificationKey = (roomSpecification: RoomSpecification) => {
  return [
    roomSpecification.room,
    roomSpecification.endpointUrl,
  ].join(':');
};

//

// tracks the chats that the currently active agents should connect to
export class ChatsSpecification extends EventTarget {
  // members
  userId: string;
  supabase: any;
  // state
  roomSpecifications: RoomSpecification[];
  roomsQueueManager: QueueManager;
  loadPromise: Promise<void>;

  constructor({
    userId,
    supabase,
  }: {
    userId: string,
    supabase: any,
  }) {
    super();

    this.userId = userId;
    this.supabase = supabase;

    this.roomSpecifications = [];
    this.roomsQueueManager = new QueueManager();
    this.loadPromise = (async () => {
      const result = await this.supabase.from('chat_specifications')
        .select('*')
        .eq('user_id', this.userId);
      const {
        error,
        data,
      } = result;
      if (!error) {
        const initialChatSpecifications = data.map((o: any) => o.data) as RoomSpecification[];
        // console.log('initial chat specifications', initialChatSpecifications);
        await Promise.all(initialChatSpecifications.map((chatSpecification) => {
          return this.join(chatSpecification);
        }));
      } else {
        console.warn('failed to load initial chats: ' + JSON.stringify(error));
      }
    })();
  }

  waitForLoad() {
    return this.loadPromise;
  }

  async join(roomSpecification: RoomSpecification) {
    if (!roomSpecification.room || !roomSpecification.endpointUrl) {
      throw new Error('roomSpecification must have room and endpointUrl: ' + JSON.stringify(roomSpecification));
    }

    // console.log('join room 0', roomSpecification);

    await this.waitForLoad();

    // console.log('join room 1', roomSpecification);
    // console.log('join room 1.1', key, roomSpecification);
    const index = this.roomSpecifications.findIndex((spec) => roomsSpecificationEquals(spec, roomSpecification));
    if (index === -1) {
      this.roomSpecifications.push(roomSpecification);

      const _emitJoinEvent = async () => {
        // console.log('emit join event', roomSpecification);
        const e = new ExtendableMessageEvent<RoomSpecification>('join', {
          data: roomSpecification,
        });
        this.dispatchEvent(e);
        await e.waitForFinish();
      };
      const _insertRow = async () => {
        await this.roomsQueueManager.waitForTurn(async () => {
          const key = getRoomsSpecificationKey(roomSpecification);
          const result = await this.supabase.from('chat_specifications')
            .upsert({
              id: key,
              user_id: this.userId,
              data: {
                room: roomSpecification.room,
                endpoint_url: roomSpecification.endpointUrl,
              },
            });
          const {
            error,
          } = result;
          if (!error) {
            // nothing
          } else {
            throw new Error('failed to insert chat specification: ' + JSON.stringify(error));
          }
        });
      };
      await Promise.all([
        _emitJoinEvent(),
        _insertRow(),
      ]);
      // console.log('join room 2');
    } else {
      throw new Error('chat already joined: ' + JSON.stringify(roomSpecification));
    }
  }
  async leave(roomSpecification: RoomSpecification) {
    if (!roomSpecification.room || !roomSpecification.endpointUrl) {
      throw new Error('roomSpecification must have room and endpointUrl: ' + JSON.stringify(roomSpecification));
    }

    // console.log('leave room 0', roomSpecification);

    await this.waitForLoad();

    // console.log('leave room 1', roomSpecification);
    const index = this.roomSpecifications.findIndex((spec) => roomsSpecificationEquals(spec, roomSpecification));
    if (index !== -1) {
      this.roomSpecifications.splice(index, 1);

      const _emitLeaveEvent = async () => {
        const e = new ExtendableMessageEvent<RoomSpecification>('leave', {
          data: roomSpecification,
        });
        this.dispatchEvent(e);
        await e.waitForFinish();
      };
      const _deleteRow = async () => {
        await this.roomsQueueManager.waitForTurn(async () => {
          const key = getRoomsSpecificationKey(roomSpecification);
          const result = await this.supabase.from('chat_specifications')
            .delete()
            .eq('id', key);
          const {
            error,
          } = result;
          if (!error) {
            // nothing
          } else {
            throw new Error('failed to delete chat specification: ' + JSON.stringify(error));
          }
        });
      };
      await Promise.all([
        _emitLeaveEvent(),
        _deleteRow(),
      ]);
      // console.log('leave room 2', roomSpecification);
    } else {
      throw new Error('chat not joined: ' + JSON.stringify(roomSpecification));
    }
  }
  async leaveAll() {
    await this.waitForLoad();

    const _emitLeaveEvent = async (roomSpecification: RoomSpecification) => {
      const e = new ExtendableMessageEvent<RoomSpecification>('leave', {
        data: roomSpecification,
      });
      this.dispatchEvent(e);
      await e.waitForFinish();
    };
    const _emitLeaveEvents = async () => {
      return await Promise.all(this.roomSpecifications.map(async (roomSpecification) => {
        await _emitLeaveEvent(roomSpecification);
      }));
    };
    const _deleteAllRows = async () => {
      await this.roomsQueueManager.waitForTurn(async () => {
        const result = await this.supabase.from('chat_specifications')
          .delete()
          .eq('user_id', this.userId);
        const {
          error,
        } = result;
        if (!error) {
          // nothing
        } else {
          throw new Error('failed to delete chat specifications: ' + JSON.stringify(error));
        }
      });
    };

    await Promise.all([
      _emitLeaveEvents(),
      _deleteAllRows(),
    ]);
  }

  // return the next alarm time
  async tick() {
    if (this.roomSpecifications.length > 0) {
      return Date.now() + activeChatsAlarmRate;
    } else {
      return Infinity;
    }
  }
}