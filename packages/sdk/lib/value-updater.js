// import { z } from 'zod';
// import dedent from 'dedent';
// import { generationModel } from '../const.js';
// import { fetchJsonCompletion } from '../sdk/src/util/fetch.mjs';

//

export class ValueUpdater extends EventTarget {
  lastValue;
  onChangeFn = async (result, { signal }) => {};
  abortController = null;
  loadPromise = null;
  constructor(onChangeFn) {
    super();

    this.onChangeFn = onChangeFn;
  }
  set(value) {
    if (value !== this.lastValue) {
      this.lastValue = value;

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
              result,
              signal,
            },
          }));
        })();
      }
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