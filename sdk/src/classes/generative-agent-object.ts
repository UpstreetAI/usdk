// import { useContext } from 'react';
// import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
// import dedent from 'dedent';
import type {
  ActionMessage,
  ChatMessages,
  PendingActionMessage,
  ReadableAudioStream,
  PlayableAudioStream,
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
import {
  ActiveAgentObject,
} from './active-agent-object';

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

  get location() {
    return new URL(this.conversation.getBrowserUrl());
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

  addMessage(message: PendingActionMessage) {
    const { agent } = this;
    const { id: userId, name } = agent;
    const { method, args } = message;
    const timestamp = new Date();
    const newMessage = {
      userId,
      name,
      method,
      args,
      timestamp,
      human: false,
      hidden: false,
    };
    return this.conversation.addLocalAndRemoteMessage(newMessage);
  }

  addAudioStream(playableAudioStream: PlayableAudioStream) {
    this.conversation.addAudioStream(playableAudioStream);
  }
}