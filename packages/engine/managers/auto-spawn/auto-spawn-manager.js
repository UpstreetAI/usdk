import * as THREE from 'three';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
// const localMatrix = new THREE.Matrix4();

// const zeroVector = new THREE.Vector3(0, 0, 0);
// const identityQuaternion = new THREE.Quaternion();
// const upVector = new THREE.Vector3(0, 1, 0);

//

const locationAppTypes = [
  'skybox3d',
  'floor',
];
const spawnableAppTypes = [
  'npc',
  'prop',
];

//

export class AutoSpawnManager extends EventTarget {
  constructor({
    appManagerContext,
    spawnManager,
    physicsTracker,
  }) {
    super();

    if (!appManagerContext || !spawnManager || !physicsTracker) {
      console.warn('missing required arguments', {
        appManagerContext,
        spawnManager,
        physicsTracker,
      });
      throw new Error('missing required argument');
    }

    this.appManagerContext = appManagerContext;
    this.spawnManager = spawnManager;
    this.physicsTracker = physicsTracker;

    this.appManagerName = '';
    this.spawnCandidates = [];
  }

  #getAppManager() {
    return this.appManagerContext.getAppManager(this.appManagerName);
  }
  setAppManagerName(appManagerName) {
    this.appManagerName = appManagerName;
  }

  getSpawnCandidates() {
    return this.spawnCandidates.map(o => {
      o.matrixWorld.decompose(
        localVector,
        localQuaternion,
        localVector2,
      );
      return {
        position: localVector.clone(),
        quaternion: localQuaternion.clone(),
      };
    });
  }
  getAvailableSpawnCandidates() {
    const appManager = this.#getAppManager();
    const apps = appManager.getApps();
    const spawnCandidates = this.getSpawnCandidates();
    const allowedSpawnCandidates = spawnCandidates.filter(c => {
      return !apps.some(app => app.position.equals(c.position));
    });
    return allowedSpawnCandidates;
  }
  getAvailableSpawnCandidate() {
    const candidates = this.getAvailableSpawnCandidates();
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      return null;
    }
  }
  addSpawnCandidate(o) {
    this.spawnCandidates.push(o);
  }
  removeSpawnCandidate(o) {
    const index = this.spawnCandidates.indexOf(o);
    if (index !== -1) {
      this.spawnCandidates.splice(index, 1);
    } else {
      throw new Error('cannot remove spawn candidate point');
    }
  }

  postEnableApp(app) {
    console.log('post enable app', app);
    // debugger;

    if (locationAppTypes.includes(app.appType)) {
      // reconfigure scene for the new location

      // hide all other location app types
      const appManager = this.#getAppManager(this.appManagerName);
      const apps = appManager.getApps();
      for (const a of apps) {
        if (locationAppTypes.includes(a.appType) && a !== app) {
          a.setComponent('visible', false);
        }
      }

      // spawn actors in new locations
      const spawnCandidates = this.getSpawnCandidates();
      for (const a of apps) {
        if (spawnableAppTypes.includes(a.appType) && (a.getComponent('visible') ?? true)) {
          if (spawnCandidates.length > 0) {
            const index = Math.floor(spawnCandidates.length * Math.random());
            const spawnCandidate = spawnCandidates.splice(index, 1)[0];
            const {
              position,
              quaternion,
            } = spawnCandidate;
            a.position.copy(position);
            a.quaternion.copy(quaternion);
            a.updateMatrixWorld();
            this.physicsTracker.updateAppPhysics(a);
            console.log('spawn in new location', a);
          } else {
            console.warn('no spawn candidates available for app to spawn', {
              app: a,
              spawnCandidates,
            });
          }
        }
      }

      // spawn player at new spawn point
      this.spawnManager.spawn({
        quaternion: false,
      });
    } else if (spawnableAppTypes.includes(app.appType)) {
      // if the app is a prop or npc, attempt to spawn in
      const spawnCandidate = this.getAvailableSpawnCandidate();
      if (spawnCandidate) {
        app.position.copy(spawnCandidate.position);
        app.quaternion.copy(spawnCandidate.quaternion);
        app.updateMatrixWorld();
      } else {
        console.warn('no spawn candidates available');
      }
    }
  }
  postDisableApp(app) {
    console.log('post disable app', app);
    // debugger;

    if (locationAppTypes.includes(app.appType)) {
      // if there are no more skybox3d, add a floor app
    }
  }
}