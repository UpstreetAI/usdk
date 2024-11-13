export class FrameTracker {
  constructor() {
    this.frames = new Map(); // app -> [fn]
  }

  addAppFrame(app, fn) {
    let appFnArray = this.frames.get(app);
    if (!appFnArray) {
      appFnArray = [];
      this.frames.set(app, appFnArray);
    }
    appFnArray.push(fn);

    return () => {
      this.removeAppFrame(app, fn);
    };
  }
  removeAppFrame(app, fn) {
    const appFnArray = this.frames.get(app);
    if (appFnArray) {
      const index = appFnArray.indexOf(fn);
      if (index !== -1) {
        appFnArray.splice(index, 1);
      }
    }
  }
  
  removeAppFrames(app) {
    this.frames.delete(app);
  }
  
  update(timestamp, timeDiff) {
    const appFnArrays = Array.from(this.frames.values());
    for (const appFnArray of appFnArrays) {
      for (const fn of appFnArray) {
        fn(timestamp, timeDiff);
      }
    }
  }
}