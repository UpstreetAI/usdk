import { useContext } from 'react';
// import type { Context } from 'react';
import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
import dedent from 'dedent';
import {
  EpochContext,
} from '../context';
import {
  AgentObject,
} from './agent-object';
import type {
  ChatMessages,
} from '../types';
import {
  ConversationObject,
} from './conversation-object';
import {
  generateAgentActionFromInstructions,
  generateAgentAction,
  handleAgentAction,
  generateJsonMatchingSchema,
  generateString,
} from '../runtime';
// import {
//   loadMessagesFromDatabase,
// } from '../util/loadMessagesFromDatabase.js';
// import {
//   saveMessageToDatabase,
// } from '../util/saveMessageToDatabase.js';
// import {
//   ExtendableMessageEvent,
// } from '../util/extendable-message-event';
import {
  ActiveAgentObject,
} from './active-agent-object';
// import {
//   retry,
// } from '../util/util.mjs';

//

export class GenerativeAgentObject {
  // arguments
  agent: ActiveAgentObject;
  conversation: ConversationObject;

  //
  
  constructor(
    agent: ActiveAgentObject,
    conversation: ConversationObject,
  ) {
    this.agent = agent;
    this.conversation = conversation;
  }

  //

  async embed(text: string) {
    return await this.agent.appContextValue.embed(text);
  }
  async complete(
    messages: ChatMessages,
  ) {
    return await this.agent.appContextValue.complete(messages, {
      model: this.agent.model,
    });
  }

  // methods

  async think(hint?: string) {
    await this.agent.generativeQueueManager.waitForTurn(async () => {
      // console.log('agent renderer think 1');
      await this.conversation.typing(async () => {
        // console.log('agent renderer think 2');
        try {
          // XXX move these methods into this file
          // XXX ensure locking in these methods
          const pendingMessage = await (hint
            ? generateAgentActionFromInstructions(this, hint)
            : generateAgentAction(this)
          );
          // console.log('agent renderer think 3');
          await handleAgentAction(this, pendingMessage);
          // console.log('agent renderer think 4');
        } catch (err) {
          console.warn('think error', err);
        }
      });
      // console.log('agent renderer think 5');
    });
  }
  async generate(hint: string, schema?: ZodTypeAny) {
    // console.log('agent renderer think 1');
    await this.conversation.typing(async () => {
      // console.log('agent renderer think 2');
      try {
        const pendingMessage = await (schema
          ? generateJsonMatchingSchema(hint, schema)
          : generateString(hint)
        );
        // console.log('agent renderer think 3');
        return pendingMessage;
      } catch (err) {
        console.warn('generate error', err);
      }
    });
    // console.log('agent renderer think 5');
  }
  async say(text: string) {
    await this.conversation.typing(async () => {
      console.log('say text', {
        text,
      });
      const timestamp = Date.now();
      const pendingMessage = {
        method: 'say',
        args: {
          text,
        },
        timestamp,
      };
      await handleAgentAction(this, pendingMessage);
    });
  }
  async monologue(text: string) {
    await this.conversation.typing(async () => {
      console.log('monologue text', {
        text,
      });
      const pendingMessage = await generateAgentActionFromInstructions(
        this,
        'The next action should be the character commenting on the following:' +
          '\n' +
          text,
      );
      await handleAgentAction(this, pendingMessage);
    });
  }
}