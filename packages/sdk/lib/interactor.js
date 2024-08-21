import { z } from 'zod';
import dedent from 'dedent';
import { generationModel } from '../const.js';
import { fetchJsonCompletion } from '../sdk/src/util/fetch.mjs';

//

/* const generateObjectFromSchema = (schema) => {
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const result = {};
    for (const key in shape) {
      result[key] = generateObjectFromSchema(shape[key]);
    }
    return result;
  } else if (schema instanceof z.ZodString) {
    return '';
  } else if (schema instanceof z.ZodNumber) {
    return 0;
  } else if (schema instanceof z.ZodBoolean) {
    return false;
  } else if (schema instanceof z.ZodArray) {
    return [];
  } else if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    return generateObjectFromSchema(schema._def.innerType);
  } else if (schema instanceof z.ZodUnion) {
    return generateObjectFromSchema(schema._def.options[0]);
  }
  // Add more cases as needed for other Zod types
  return null;
}; */
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
  constructor({
    prompt,
    objectFormat,
    jwt,
  }) {
    super();

    this.jwt = jwt;
    this.objectFormat = objectFormat;
    this.object = generateEmptyObjectFromSchema(objectFormat);
    this.messages = [
      {
        role: 'user',
        content: prompt + '\n\n' +
          dedent`\
            You are an interactive configuration assistant designed to update a JSON configuration object on behalf of the user.
            Prompt the user for a question you need answered to update the configuration object.
            Be informal and succinct; try to hide the complexity and internal state, and auto-fill details where you can.
            Feel free to use artistic license or ask clarifying questions.
            Do not reveal the form fields.

            The current state of the configuration object is:
            \`\`\`
          ` + '\n' +
          JSON.stringify(this.object, null, 2) + '\n' +
          '\`\`\`' + '\n\n' +
          dedent`\
            Reply with a JSON object including a response to the user, an optional update object to merge with the existing one, and a done flag when you think it's time to end the conversation.
          `,
      },
    ];
  }
  async send(text = '') {
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
      update_object: z.union([
        objectFormat,
        z.null(),
      ]),
      done: z.boolean(),
    }), {
      jwt,
    });

    const {
      update_object,
    } = o;
    if (update_object) {
      for (const key in update_object) {
        object[key] = update_object[key];
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
  }
}