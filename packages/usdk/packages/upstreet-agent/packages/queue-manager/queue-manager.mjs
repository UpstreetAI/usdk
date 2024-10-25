class Entry {
  fn;
  abortController;
  constructor(fn, abortController = new AbortController()) {
    this.fn = fn;
    this.abortController = abortController;
  }
}

const abortError = new Error('abort');
abortError.isAbortError = true;

export class QueueManager extends EventTarget {
  constructor({
    parallelism = 1,
  } = {}) {
    super();

    this.parallelism = parallelism;

    this.runningEntries = [];
    this.queue = [];
  }
  isIdle() {
    return this.runningEntries.length === 0;
  }
  next(n = 1) {
    let i;
    for (i = 0; i < n; i++) {
      const entry = this.runningEntries.shift();
      if (entry) {
        entry.abortController.abort(abortError);
        continue;
      }
    }
    // return whether we were able to abort all the entries
    return i === n;
  }
  async waitForTurn(fn) {
    const entry = new Entry(fn);
    return await this.#waitForTurnEntry(entry);
  }
  async #waitForTurnEntry(entry) {
    if (this.runningEntries.length < this.parallelism) {
      this.runningEntries.push(entry);

      if (this.runningEntries.length === 1) {
        this.dispatchEvent(new MessageEvent('idlechange', {
          data: {
            idle: false,
          },
        }));
      }

      let result, error;
      try {
        const { fn, abortController } = entry;
        const { signal } = abortController;
        result = await fn({
          signal,
        });
      } catch(err) {
        error = err;
      }

      const index = this.runningEntries.indexOf(entry);
      this.runningEntries.splice(index, 1);
      if (this.queue.length > 0) {
        const entry = this.queue.shift();
        this.#waitForTurnEntry(entry);
      } else {
        if (this.runningEntries.length === 0) {
          this.dispatchEvent(new MessageEvent('idlechange', {
            data: {
              idle: true,
            },
          }));
        }
      }

      if (error === undefined || error === abortError) {
        return result;
      } else {
        throw error;
      }
    } else {
      const { fn, abortController } = entry;
      const {
        promise,
        resolve,
        reject,
      } = Promise.withResolvers();
      const fn2 = async (...args) => {
        let result, error;
        try {
          result = await fn(...args);
        } catch(err) {
          error = err;
        }

        if (error === undefined || error === abortError) {
          resolve(result);
          return result;
        } else {
          reject(error);
          throw error;
        }
      };
      const entry2 = new Entry(fn2, abortController);
      this.queue.push(entry2);
      const result = await promise;
      return result;
    }
  }
}

export class MultiQueueManager {
  constructor(opts) {
    this.opts = opts;

    this.queueManagers = new Map();
  }
  async waitForTurn(key, fn) {
    let queueManager = this.queueManagers.get(key);
    if (!queueManager) {
      queueManager = new QueueManager(this.opts);
      this.queueManagers.set(key, queueManager);
      queueManager.addEventListener('idlechange', e => {
        const { idle } = e.data;
        if (idle) {
          this.queueManagers.delete(key);
        }
      });
    }
    return await queueManager.waitForTurn(fn);
  }
}