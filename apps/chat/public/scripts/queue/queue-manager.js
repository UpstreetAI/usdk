import {
  makeId,
  makePromise,
} from './util.js';

//

export class QueueManager extends EventTarget {
  constructor({
    parallelism = 1,
  } = {}) {
    super();

    this.parallelism = parallelism;

    this.numRunning = 0;
    this.queue = [];
  }
  isIdle() {
    return this.numRunning === 0;
  }
  async waitForTurn(fn) {
    if (this.numRunning < this.parallelism) {
      this.numRunning++;
      if (this.numRunning === 1) {
        this.dispatchEvent(new MessageEvent('idlechange', {
          data: {
            idle: false,
          },
        }));
      }

      let result, error;
      try {
        result = await fn();
      } catch(err) {
        error = err;
      }

      this.numRunning--;
      if (this.queue.length > 0) {
        const fn2 = this.queue.shift();
        this.waitForTurn(fn2);
      } else {
        if (this.numRunning === 0) {
          this.dispatchEvent(new MessageEvent('idlechange', {
            data: {
              idle: true,
            },
          }));
        }
      }

      if (!error) {
        return result;
      } else {
        throw error;
      }
    } else {
      const p = makePromise();
      this.queue.push(async () => {
        let result, error;
        try {
          result = await fn();
        } catch(err) {
          error = err;
        }

        if (!error) {
          p.resolve(result);
          return result;
        } else {
          p.reject(error);
          throw error;
        }
      });
      const result = await p;
      return result;
    }
  }
}

export class ReadWriteQueueManager extends QueueManager {
  constructor(opts) {
    super(opts);

    // this.writing = false;
    this.numReading = false;
  }

  async waitForReader(fn) {
    const doRead = async () => {
      this.numReading++;

      let result, error;
      try {
        result = await fn();
      } catch(err) {
        error = err;
      }
      
      this.numReading--;
      this.dispatchEvent(new MessageEvent('numreadingdown'));

      if (!error) {
        return result;
      } else {
        throw error;
      }
    };

    if (this.numReading > 0) {
      return await doRead();
    } else {
      let result, error;
      await this.waitForTurn(async () => {
        const p = makePromise();
        this.addEventListener('numreadingdown', e => {
          if (this.numReading === 0) {
            p.resolve();
          }
        })

        try {
          result = await doRead();
        } catch(err) {
          error = err;
        }

        await p;
      });
      if (!error) {
        return result;
      } else {
        throw error;
      }
    }
  }
  async waitForWriter(fn) {
    return await this.waitForTurn(fn);
  }
}