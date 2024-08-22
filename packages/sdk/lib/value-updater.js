// import { z } from 'zod';
// import dedent from 'dedent';
// import { generationModel } from '../const.js';
// import { fetchJsonCompletion } from '../sdk/src/util/fetch.mjs';

//

export class ValueUpdater extends EventTarget {
  // jwt;
  // objectFormat;
  // object;
  // messages;
  onChangeFn = async (newValue, { signal }) => {};
  abortController = null;
  loadPromise = null;
  constructor(onChangeFn) {
    super();

    this.onChangeFn = onChangeFn;

    // this.jwt = jwt;
    // this.objectFormat = objectFormat;
    // this.object = generateEmptyObjectFromSchema(objectFormat);
    // this.messages = [
    //   {
    //     role: 'user',
    //     content: prompt + '\n\n' +
    //       dedent`\
    //         You are an interactive configuration assistant designed to update a JSON configuration object on behalf of the user.
    //         Prompt the user for a question you need answered to update the configuration object.
    //         Be informal and succinct; try to hide the complexity and internal state, and auto-fill details where you can.
    //         Feel free to use artistic license or ask clarifying questions.
    //         Do not reveal the form fields.

    //         The current state of the configuration object is:
    //         \`\`\`
    //       ` + '\n' +
    //       JSON.stringify(this.object, null, 2) + '\n' +
    //       '\`\`\`' + '\n\n' +
    //       dedent`\
    //         Reply with a JSON object including a response to the user, an optional update object to merge with the existing one, and a done flag when you think it's time to end the conversation.
    //       `,
    //   },
    // ];
  }
  set(value) {
    // abort old abort context
    {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }
    }
    // create new abort context
    this.abortController = new AbortController();
    // trigger new change
    {
      const { signal } = this.abortController;
      this.loadPromise = this.onChangeFn(value, { signal })
        .then((newValue) => {
          this.dispatchEvent(new MessageEvent('change', {
            data: {
              value: newValue,
              signal,
            },
          }));
        });
    }
  }
  async waitForLoad() {
    return await this.loadPromise;
  }
}