/*
this file contains the initialization object for the engine.
this includes all of the objects that are useful outside of the engine, and can be passed in during initialization.
*/

import {
  LocalStorageManager,
} from './managers/localstorage/localstorage-manager.js';
import {
  SupabaseClient,
} from './clients/supabase-client.js';
import {
  WorldClient,
} from './clients/world-client.js';
import {
  LoadingManager,
} from './managers/loading/loading-manager.js';

//

export class EngineContext {
  constructor(opts) {
    this.localStorageManager = new LocalStorageManager();
    this.supabaseClient = new SupabaseClient({
      localStorageManager: this.localStorageManager,
      anonymousLogin: opts?.anonymousLogin,
    });
    this.worldClient = new WorldClient({
      supabaseClient: this.supabaseClient,
    });
    this.loadingManager = new LoadingManager();
  }
}