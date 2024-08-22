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
  }
  set(value) {
    // abort old abort context
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    // create new abort context
    this.abortController = new AbortController();
    // trigger new change
    {
      const { signal } = this.abortController;
      this.loadPromise = this.onChangeFn(value, { signal });
      (async () => {
        const result = await this.loadPromise;
        this.dispatchEvent(new MessageEvent('change', {
          data: {
            value: result,
            signal,
          },
        }));
      })();
    }
  }
  setResult(result) {
    // abort old abort context
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    this.loadPromise = Promise.resolve(result);
  }
  async waitForLoad() {
    return await this.loadPromise;
  }
}