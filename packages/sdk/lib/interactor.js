import { z } from 'zod';
import dedent from 'dedent';
import { generationModel } from '../const.js';
import { fetchJsonCompletion } from '../sdk/src/util/fetch.mjs';
import { QueueManager } from '../sdk/src/util/queue-manager.mjs';

//

const generateEmptyObjectFromSchema = (schema) => {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const result = {};
    for (const key in shape) {
      result[key] = null;
    }
    return result;
  } else {
    throw new Error('invalid schema');
  }
};

//

export class Interactor extends EventTarget {
  jwt;
  objectFormat;
  object;
  messages;
  queueManager;
  constructor({
    prompt,
    object,
    objectFormat,
    jwt,
  }) {
    super();

    this.jwt = jwt;
    this.objectFormat = objectFormat;
    this.object = object || generateEmptyObjectFromSchema(objectFormat);
    this.messages = [
      {
        role: 'system',
        content: prompt + '\n\n' +
          dedent`\
            You are an interactive configuration assistant designed to update a JSON configuration object on behalf of the user.
            Prompt the user for a question you need answered to update the configuration object.
            Be informal and succinct; do not simply ask for the form fields. Hide the complexity and internal state, and auto-fill details where you can.
            Feel free to use artistic license or ask clarifying questions.
            
            Reply with a JSON object including a response to the user, an optional update object to merge with the existing one, and a done flag when you think it's time to end the conversation.
          `,
      },
    ];
    this.queueManager = new QueueManager();
  }
  async write(text = '') {
    return await this.queueManager.waitForTurn(async () => {
      const { jwt, objectFormat, object, messages } = this;

      if (text) {
        messages.push({
          role: 'user',
          content: text,
        });
      }
      const o = await fetchJsonCompletion({
        model: generationModel,
        messages,
      }, z.object({
        response: z.string(),
        updateObject: z.union([
          objectFormat,
          z.null(),
        ]),
        done: z.boolean(),
      }), {
        jwt,
      });
      const {
        updateObject,
      } = o;
      if (updateObject) {
        for (const key in updateObject) {
          object[key] = updateObject[key];
        }
      }

      {
        const content = JSON.stringify(o, null, 2);
        const responseMessage = {
          role: 'assistant',
          content,
        };
        messages.push(responseMessage);
      }

      this.dispatchEvent(new MessageEvent('message', {
        data: {
          ...o,
          object,
        },
      }));
    });
  }
  async end(text = '') {
    return await this.queueManager.waitForTurn(async () => {
      const { jwt, objectFormat, object, messages } = this;

      if (text) {
        messages.push({
          role: 'user',
          content: text,
        });
      }
      let o = await fetchJsonCompletion({
        model: generationModel,
        messages,
      }, z.object({
        output: objectFormat,
      }), {
        jwt,
      });
      o = {
        response: '',
        updateObject: o.output,
        done: true,
      };
      const {
        updateObject,
      } = o;
      if (updateObject) {
        for (const key in updateObject) {
          object[key] = updateObject[key];
        }
      }

      {
        const content = JSON.stringify(o, null, 2);
        const responseMessage = {
          role: 'assistant',
          content,
        };
        messages.push(responseMessage);
      }

      this.dispatchEvent(new MessageEvent('message', {
        data: {
          ...o,
          object,
        },
      }));
    });
  }
}