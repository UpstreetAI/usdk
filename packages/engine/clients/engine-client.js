// import * as THREE from 'three';
import React, {
  useState,
  useEffect,
  // useRef,
} from 'react';
// import classnames from 'classnames';

import {
  Engine,
} from '../engine.js';
import {
  // addDefaultLights,
  makePromise,
} from '../util.js';

//

class EngineCache extends EventTarget {
  constructor({
    canvas,
    context,
    disablePhysxWorker = false
  }) {
    super();

    this.engine = null;
    this.abortController = new AbortController();

    this.appStoresUpdateRunning = false;
    this.appStoresUpdateQueue = [];

    this.playerUpdateRunning = false;
    this.playersUpdateQueue = [];

    this.appStoresPromise = makePromise();
    this.appStoresLoaded = false;
    this.playerSpecPromise = makePromise();
    this.playerSpecLoaded = false;

    this.optsToApps = new Map(); // opts => Promise<App>

    this.playerActor = null;

    this.loadPromise = (async () => {
      this.engine = new Engine({
        context,
      });
      this.engine.disablePhysxWorker = disablePhysxWorker;

      const {signal} = this.abortController;
      signal.addEventListener('abort', () => {
        this.engine.destroy();
        this.engine = null;
      });

      await this.engine.waitForLoad();
      if (signal.aborted) return;

      this.engine.setCanvas(canvas);
      // addDefaultLights(this.engine.engineRenderer.scene);

      const initPromises = [
        this.playerSpecPromise,
        this.appStoresPromise,
      ];
      await Promise.all(initPromises);
      if (signal.aborted) return;

      const playersManager = this.engine.playersManager;
      const localPlayer = playersManager.getLocalPlayer();
      if (localPlayer.avatar) {
        this.engine.spawn();
      }

      this.engine.start();
    })();
  }
  async waitForLoad() {
    await this.loadPromise;
  }
  getEngine() {
    return this.engine;
  }
  async updateAppStores(newAppStores) {
    const {signal} = this.abortController;
    if (signal.aborted) return;

    if (!this.appStoresUpdateRunning) {
      this.appStoresUpdateRunning = true;

      // reify app stores pqs objects
      // newAppStores = structuredClone(newAppStores);
      // for (const k in newAppStores) {
      //   const newAppStore = newAppStores[k];
      //   newAppStore.objects = newAppStore.objects.map(object => reifyPqsObject(object));
      // }

      const oldApps = new Set(this.optsToApps.values());
      const currentApps = new Set();

      // add new apps + app managers
      const appManagers = {};
      const newPromises = [];
      for (const name in newAppStores) {
        const newAppStore = newAppStores[name];
        const {
          objects,
          editable,
        } = newAppStore;
        const appManager = this.engine.appManagerContext.createAppManager(name, {
          editable,
        });
        appManagers[name] = appManager;

        this.engine.engineRenderer.scene.add(appManager);

        for (const object of objects) {
          const app = this.optsToApps.get(object);
          if (!app) {
            const p = appManager.addAppAsync(object);
            (async () => {
              const app = await p;
              this.optsToApps.set(object, app);
              // console.log('add new app to app manager', app);
              currentApps.add(app);
            })();
            newPromises.push(p);
          } else {
            currentApps.add(app);
          }
        }
      }

      // remove old apps
      for (const oldApp of oldApps) {
        if (!currentApps.has(oldApp)) {
          const appManager = oldApp.parent;
          if (!appManager) {
            debugger;
          }
          if (appManager.isAppManager) {
            // console.log('remove old app from app manager', oldApp);
            appManager.removeApp(oldApp);

            for (const [opts, app] of this.optsToApps.entries()) {
              if (app === oldApp) {
                this.optsToApps.delete(opts);
              }
            }
          } else {
            console.warn('got non-app-manager parent for app', appManager);
          }
        }
      }

      // wait for apps to load
      await Promise.all(newPromises);
      if (signal.aborted) return;

      this.appStoresUpdateRunning = false;
      if (this.appStoresUpdateQueue.length > 0) {
        const fn = this.appStoresUpdateQueue.shift();
        fn();
      }
    } else {
      const p = makePromise();
      this.appStoresUpdateQueue.push(async () => {
        await this.updateAppStores(newAppStores);
        p.resolve();
      });
      await p;
    }

    if (!this.appStoresLoaded) {
      this.appStoresLoaded = true;
      this.appStoresPromise.resolve();
    }
  }
  async updatePlayerSpec(spec) {
    const {signal} = this.abortController;
    if (signal.aborted) return;

    if (!this.playerUpdateRunning) {
      // pre
      {
        this.playerUpdateRunning = true;
      }

      // avatar
      const playersManager = this.engine.playersManager;
      const localPlayer = playersManager.getLocalPlayer();
      {
        await localPlayer.setPlayerSpec(spec);
      }

      // lore
      {
        const loreManager = this.engine.loreManager;
        if (this.playerActor) {
          loreManager.removeActor(this.playerActor);
          this.playerActor = null;
        }

        if (spec) {
          this.playerActor = loreManager.createActor({
            id: localPlayer.playerId,
            type: 'character',
            spec,
            object: localPlayer,
          });
          loreManager.addActor(this.playerActor);
        }
      }

      // post
      {
        this.playerUpdateRunning = false;
        if (this.playersUpdateQueue.length > 0) {
          const fn = this.playersUpdateQueue.shift();
          fn();
        }
      }
    } else {
      const p = makePromise();
      this.playersUpdateQueue.push(async () => {
        await this.updatePlayerSpec(spec);
        p.resolve();
      });
      await p;
    }

    // spawn if necessary
    if (!this.playerSpecLoaded) {
      this.playerSpecLoaded = true;
      this.playerSpecPromise.resolve();
    }
  }
  destroy() {
    this.abortController.abort();
  }
}

//

export const EngineProvider = ({
  canvas,
  context,

  playerSpec,
  appStores,

  setEngine,

  disablePhysxWorker = false
} = {}) => {
  const [engineCache, setEngineCache] = useState(null);

  // engine cache
  useEffect(() => {
    const newEngineCache = new EngineCache({
      canvas,
      context,
      disablePhysxWorker
    });
    setEngineCache(newEngineCache);

    let live = true;
    (async () => {
      // wait for the engine to be loaded and bound
      await newEngineCache.waitForLoad();
      if (!live) return;

      // latch the engine
      const engine = newEngineCache.getEngine();

      // update the agent binding about the fact that the engine is now loaded
      if (typeof globalThis.engineLoaded === 'function') {
        globalThis.engineLoaded();
      }

      // set the loaded engine
      setEngine(engine);
    })();

    return () => {
      live = false;

      newEngineCache.destroy();

      setEngine(null);
    };
  }, []);

  // player spec
  useEffect(() => {
    if (!!engineCache && playerSpec !== undefined) {
      (async () => {
        const engine = engineCache.getEngine();
        await engine.waitForLoad();
        await engineCache.updatePlayerSpec(playerSpec);
      })();
    }
  }, [
    engineCache,
    playerSpec,
  ]);

  // app stores
  useEffect(() => {
    if (!!engineCache && appStores !== undefined) {
      (async () => {
        const engine = engineCache.getEngine();
        await engine.waitForLoad();
        await engineCache.updateAppStores(appStores);
      })();
    }
  }, [
    engineCache,
    appStores,
  ]);

  return null;
};
