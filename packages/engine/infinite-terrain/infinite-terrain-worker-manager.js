import InfiniteTerrainWorker from './infinite-terrain-worker.js?worker';

export class InfiniteTerrainWorkerManager {
  constructor() {
    this.worker = null;
    this.loadPromise = null;

    // trigger load
    // this.waitForLoad();
  }

  waitForLoad() {
    if (!this.loadPromise) {
      this.loadPromise = (async () => {
        const worker = new InfiniteTerrainWorker();
        this.worker = worker;
      })();
    }
    return this.loadPromise;
  }
}

// const infiniteTerrainWorkerManager = new InfiniteTerrainWorkerManager();
// export default infiniteTerrainWorkerManager;