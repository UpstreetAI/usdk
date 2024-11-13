/*
this file is responsible for managing skybox-based logical world scenes.
*/

//

export class LoadingManager extends EventTarget {
  #loads = new Set();

  constructor() {
    super();

    this.started = false;

    this.cover = undefined;

    this.currentLoad = null;
    this.numerator = 0;
    this.denominator = 1;
    this.progress = 0;

    this.finishable = false;
    this.finished = false;
  }

  isFinished() {
    return this.finished;
  }

  getCover() {
    return this.cover;
  }
  setCover({
    name,
    description,
    previewImg,
    bannerImg,
  }) {
    this.cover = {
      name,
      description,
      previewImg,
      bannerImg,
    };
    this.dispatchEvent(new MessageEvent('coverupdate', {
      data: {
        cover: this.cover,
      },
    }));
  }

  addLoad(name) {
    const load = {
      name,
      loaded: false,
      finish: () => {
        load.loaded = true;
        this.update();
      },
    };
    this.#loads.add(load);

    if (this.#loads.size === 1) {
      this.started = true;
      this.dispatchEvent(new MessageEvent('start'));
    }

    this.update();

    return load;
  }
  setFinishable() {
    this.finishable = true;

    this.tryFinish();
  }

  update() {
    if (this.#loads.size > 0) {
      this.numerator = 0;
      this.denominator = 0;
      for (const load of this.#loads.values()) {
        if (load.loaded) {
          this.numerator++;
        }
        this.denominator++;
      }
      this.progress = this.numerator / this.denominator;
    } else {
      this.numerator = 0;
      this.denominator = 1;
      this.progress = 0;
    }

    // console.log('update', this.numerator, this.denominator, this.progress);
    this.dispatchEvent(new MessageEvent('update', {
      data: {
        numerator: this.numerator,
        denominator: this.denominator,
        progress: this.progress,
      },
    }));

    if (this.tryFinish()) {
      // nothing
    } else {
      // update current load
      const currentLoad = Array.from(this.#loads.values())
        .find(load => !load.loaded) ?? null;
      if (currentLoad !== null && currentLoad !== this.currentLoad) {
        this.currentLoad = currentLoad;
        this.dispatchEvent(new MessageEvent('currentloadupdate', {
          data: {
            load: currentLoad,
          },
        }));
      }
    }
  }
  tryFinish() {
    if (this.#loads.size > 0 && this.progress >= 1 && this.finishable) {
      // finish up
      this.dispatchEvent(new MessageEvent('finish'));
      this.#loads.clear();
      this.currentLoad = null;
      this.finished = true;
      return true;
    } else {
      return false;
    }
  }
  async waitForFinish() {
    if (!this.started) {
      await new Promise((accept, reject) => {
        this.addEventListener('start', accept, {once: true});
      });
    }
    if (this.#loads.size > 0) {
      await new Promise((accept, reject) => {
        this.addEventListener('finish', accept, {once: true});
      });
    }
  }
}