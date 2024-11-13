import {
  waitForTimeout,
} from '../../util.js';

// Start of tick queue manager update

export class WindowedTickQueueManager {
  constructor({
    capacity = 5, // 5s
    windowWidth = 10 * 1000, // 10s
    exponentialBackoff = 2, // 2x
  } = {}) {
    this.capacity = capacity;
    this.windowWidth = windowWidth;
    this.exponentialBackoff = exponentialBackoff;

    this.tickDeadlines = [];
    this.totalTicks = 0;
    this.currentFactor = 1;
    this.totalFactorIncreases = 1;
    this.waitPromises = [];
  }

  #getEffectiveWindowWidth() {
    return this.windowWidth * this.currentFactor;
  }
  async #flushTicks(now) {
    while (this.tickDeadlines.length > 0 && now >= this.tickDeadlines[0]) {
      this.tickDeadlines.shift();
    }
  }
  async waitForTurn(fn = () => Promise.resolve()) {
    const localWindowWidth = this.#getEffectiveWindowWidth();
    if (++this.totalTicks >= (this.capacity * this.totalFactorIncreases)) {
      console.log('increasing factor', this.totalTicks, this.capacity, this.totalFactorIncreases);
      this.currentFactor *= this.exponentialBackoff;
      this.totalFactorIncreases++;
    }

    const _attempt = async () => {
      const now = performance.now();
      this.#flushTicks(now);

      if (this.tickDeadlines.length < this.capacity) {
        const deadline = now + localWindowWidth;
        this.tickDeadlines.push(deadline);

        const p = fn();
        const result = await p;
        return result;
      } else {
        let minTimeToWait = this.tickDeadlines[0] - now;
        minTimeToWait = Math.max(minTimeToWait, 0);
        const p = waitForTimeout(minTimeToWait);
        this.waitPromises.push(p);

        await p;

        const index = this.waitPromises.indexOf(p);
        this.waitPromises.splice(index, 1);

        return await _attempt();
      };
    };
    await _attempt();
  }
  flush() {
    this.tickDeadlines.length = 0;

    const waitPromises = this.waitPromises.slice();
    for (let i = 0; i < waitPromises.length; i++) {
      const p = waitPromises[i];
      p.resolve();
    }

    // this.tickDeadlines = [];
    // this.totalTicks = 0;
    // this.currentFactor = 1;
    // this.totalFactorIncreases = 1;
    // this.waitPromises = [];
  }

  setCapacity(capacity) {
    this.capacity = capacity;
  }
}
