import {
  makeAppQueryFn,
} from '../../util.js';

//

export class AppTracker extends EventTarget {
  constructor({
    appManagerContext,
  }) {
    super();
    
    if (!appManagerContext) {
      console.warn('missing managers', {
        appManagerContext,
      });
      throw new Error('missing managers');
    }
    this.appManagerContext = appManagerContext;

    this.#listen();
  }

  registerAppTracker({
    appManagerName,
    query,
    addCb,
    removeCb,
    waitForLoad = false,
  }) {
    const q = makeAppQueryFn(query);

    const _addCb = e => {
      const {
        appManager,
        app,
      } = e.data;
      if (appManagerName === undefined || appManager.name === appManagerName) {
        if (q(app)) {
          addCb(app);
        }
      }
    };
    const _removeCb = e => {
      const {
        appManager,
        app,
      } = e.data;
      if (appManagerName === undefined || appManager.name === appManagerName) {
        if (q(app)) {
          removeCb(app);
        }
      }
    };
    const addEventName = !waitForLoad ? 'appadd' : 'appload';
    this.addEventListener(addEventName, _addCb);
    this.addEventListener('appremove', _removeCb);

    // initialize
    const appManagers = this.appManagerContext.getAppManagers();
    for (const appManager of appManagers) {
      if (appManagerName === undefined || appManager.name === appManagerName) {
        for (const app of appManager.apps.values()) {
          if (!waitForLoad || app.loaded) {
            const e = {
              data: {
                appManager,
                app,
              },
            };
            _addCb(e);
          }
        }
      }
    }

    return {
      cleanup: () => {
        this.removeEventListener(addEventName, _addCb);
        this.removeEventListener('appremove', _removeCb);
      },
    };
  }

  #listen() {
    const _bindAppManager = appManager => {
      if (appManager) {
        // route app manager events to app tracker
        [
          'appadd',
          'appload',
          'appremove',
        ].forEach(eventName => {
          appManager.addEventListener(eventName, e => {
            this.dispatchEvent(new MessageEvent(eventName, {
              data: {
                appManager,
                app: e.data.app,
              },
            }));
          });
        });
      }
    };
    const appManagers = this.appManagerContext.getAppManagers();
    for (const appManager of appManagers) {
      _bindAppManager(appManager);
    }

    this.appManagerContext.addEventListener('appmanageradd', e => {
      const {
        appManager,
      } = e.data;
      // console.log('got new app manager', appManager);
      _bindAppManager(appManager);
    });
  }
}