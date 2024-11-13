import {
  AppManager,
} from './app-manager.js';

//

export class AppManagerContext extends EventTarget {
  #appManagers = new Map();

  constructor({
    importManager,
    appContextFactory,
  }) {
    super();

    this.importManager = importManager;
    this.appContextFactory = appContextFactory;
  }

  createAppManager(name, opts = {}) {
    const {
      editable = false,
    } = opts;
    const {
      importManager,
      appContextFactory,
    } = this;

    const appManager = new AppManager({
      name,
      editable,
      importManager,
      appContextFactory,
    });
    this.#appManagers.set(name, appManager);

    this.dispatchEvent(new MessageEvent('appmanageradd', {
      data: {
        appManager,
      },
    }));

    return appManager;
  }
  destroyAppManager(appManager) {
    appManager.clear();
    this.#appManagers.delete(appManager.name);

    this.dispatchEvent(new MessageEvent('appmanagerremove', {
      data: {
        appManager,
      },
    }));
  }

  getAppManager(name) {
    return this.#appManagers.get(name) || null;
  }
  getAppManagers() {
    return Array.from(this.#appManagers.values());
  }

  findApps(query) {
    const results = [];
    for (const appManager of this.#appManagers.values()) {
      const apps = appManager.findApps(query);
      results.push(...apps);
    }
    return results;
  }
  findApp(opts) {
    let result = null;
    for (const appManager of this.#appManagers.values()) {
      const app = appManager.findApp(opts);
      if (app) {
        result = app;
        break;
      }
    }
    return result;
  }

  destroy() {
    for (const appManager of this.#appManagers.values()) {
      this.destroyAppManager(appManager);
    }
    this.#appManagers.clear();
  }
}
