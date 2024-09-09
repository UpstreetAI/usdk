export class Debouncer extends EventTarget {
  queueLength = 0;
  running = false;
  queue = [];
  constructor({
    queueLength = 1,
  } = {}) {
    super();

    this.queueLength = queueLength;
  }
  isIdle() {
    return !this.running;
  }
  async waitForTurn(fn) {
    if (!this.running) {
      this.running = true;
      this.dispatchEvent(new MessageEvent('idlechange', {
        data: {
          idle: false,
        },
      }));

      let result, error;
      try {
        result = await fn();
      } catch(err) {
        error = err;
      }

      this.running = false;
      if (this.queue.length > 0) {
        const entry = this.queue.shift();
        this.waitForTurn(entry.call);
      } else {
        this.dispatchEvent(new MessageEvent('idlechange', {
          data: {
            idle: true,
          },
        }));
      }

      if (!error) {
        return result;
      } else {
        throw error;
      }
    } else {
      const {
        promise,
        resolve,
        reject,
      } = Promise.withResolvers();
      const call = async () => {
        let result, error;
        try {
          result = await fn();
        } catch(err) {
          error = err;
        }

        if (!error) {
          resolve(result);
          return result;
        } else {
          reject(error);
          throw error;
        }
      };
      const entry = {
        call,
        resolve,
        reject,
      };
      this.queue.push(entry);
      while (this.queue.length > this.queueLength) {
        const entry = this.queue.shift();
        entry.resolve();
      }
      const result = await promise;
      return result;
    }
  }
}

/* export class MultiDebouncer {
  constructor(opts) {
    this.opts = opts;

    this.debouncers = new Map();
  }
  async waitForTurn(key, fn) {
    let debouncer = this.debouncers.get(key);
    if (!debouncer) {
      debouncer = new Debouncer(this.opts);
      this.debouncers.set(key, debouncer);
      debouncer.addEventListener('idlechange', e => {
        const { idle } = e.data;
        if (idle) {
          this.debouncers.delete(key);
        }
      });
    }
    return await debouncer.waitForTurn(fn);
  }
} */