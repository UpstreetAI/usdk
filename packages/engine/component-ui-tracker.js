export class ComponentUiTracker {
  constructor() {
    this.componentUiFns = new WeakMap();
  }

  getAppComponentUiFn(app) {
    return this.componentUiFns.get(app);
  }
  addAppComponentUiFn(app, fn) {
    this.componentUiFns.set(app, fn);
  }
  removeAppComponentUiFn(app) {
    this.componentUiFns.delete(app);
  }
}