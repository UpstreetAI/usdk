export const abortError = new Error('aborted');
abortError.isAbortError = true;

//

export class Mutex extends EventTarget {
  constructor() {
    super();

    this.locked = false;
    this.queue = [];
  }
  async acquire() {
    if (this.locked) {
      await new Promise((accept, reject) => {
        this.queue.push(accept);
      });
    } else {
      this.locked = true;
    }
  }
  release() {
    this.locked = false;
    const fn = this.queue.shift();
    if (fn) {
      this.locked = true;
      fn();
    } else {
      this.dispatchEvent(new CustomEvent('releasedall'));
    }
  }
}