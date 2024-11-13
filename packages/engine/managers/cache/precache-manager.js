// import {
//   makeId,
//   makePromise,
// } from '../../util.js';

//

export class PrecacheManager {
  constructor({
    getAsync = () => null,
    updaters = [],
    inactiveDisableTime = 10 * 1000, // 10s
  } = {}) {
    this.getAsync = getAsync;
    this.updaters = updaters;
    this.inactiveDisableTime = inactiveDisableTime;

    this.cachedPromise = null;
    this.lastActiveTime = 0;

    // listen to updaters to invalidate the cache
    for (let i = 0; i < this.updaters.length; i++) {
      const updater = this.updaters[i];
      updater.on('update', () => {
        this.cachedPromise = null;

        this.#ensureCachedPromiseIfNeeded();
      });
    }

    this.tickActivity();
  }

  tickActivity() {
    this.lastActiveTime = performance.now();

    this.#ensureCachedPromiseIfNeeded(true);
  }

  #ensureCachedPromiseIfNeeded(force = false) {
    if (!this.cachedPromise) {
      if (force || performance.now() - this.lastActiveTime < this.inactiveDisableTime) {
        this.cachedPromise = this.getAsync();
      }
    }
  }
  getValueAsync() {
    this.#ensureCachedPromiseIfNeeded(true);
    return this.cachedPromise;
  }
}