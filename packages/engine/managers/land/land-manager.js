import * as THREE from 'three';
// import bezier from '../../easing.js';
import {
  QueueManager,
} from '../queue/queue-manager.js';

import {
  GridMesh,
} from './land-mesh.js';
import {
  MapMesh,
} from './map-mesh.js';
import {
  chunkSize,
  segments,
  gridHeight,
  chunkHeight,
  chunkRange,
} from './constants.js';

//

const localVector2D = new THREE.Vector2();
const localVector2D2 = new THREE.Vector2();
const forwardVector = new THREE.Vector3(0, 0, -1);

//

const landUpdatesChannelName = 'land-updates';
const landUpdateEventName = 'land-update';

//

const getCoordsKey = coords => coords.join(':');
export const mapObjectsChunkToWorldCoords = (objects, coords) => {
  objects = structuredClone(objects);
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const {
      position,
    } = object;
    position[0] += coords[0] * chunkSize;
    position[2] += coords[1] * chunkSize;
  }
  return objects;
};
export const mapObjectsWorldToChunkCoords = (objects, coords) => {
  objects = structuredClone(objects);
  for (let i = 0; i < objects.length; i++) {
    const object = objects[i];
    const {
      position,
    } = object;
    position[0] -= coords[0] * chunkSize;
    position[2] -= coords[1] * chunkSize;
  }
  return objects;
};

//

export class LandManager extends EventTarget {
  constructor({
    engineRenderer,
    cameraManager,
    playersManager,
    appManagerContext,
    appTracker,
  }) {
    super();

    this.engineRenderer = engineRenderer;
    this.cameraManager = cameraManager;
    this.playersManager = playersManager;
    this.appManagerContext = appManagerContext;
    this.appTracker = appTracker;
    this.queueManager = new QueueManager();

    // meshes
    this.gridMesh = null;
    this.mapMesh = null;

    // cache
    this.mapOffset = new THREE.Vector3();

    // supabase land update channel
    this.channel = null;
  }
  
  #controllerFn = (function () {
    const {engineRenderer} = this;
    const {
      camera,
    } = engineRenderer;

    camera.position.copy(this.mapOffset);
    camera.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().lookAt(
        camera.position,
        new THREE.Vector3(
          camera.position.x,
          0,
          camera.position.z,
        ),
        forwardVector
      ),
    );
    camera.updateMatrixWorld();
  }).bind(this);
  setMode(mode) {
    {
      const landEnabled = mode === 'sceneEditor';
      if (landEnabled && !this.gridMesh) {
        this.gridMesh = new GridMesh({
          landManager: this,
        });
      } else if (!landEnabled && this.gridMesh) {
        this.gridMesh.destroy();
        this.gridMesh = null;
      }
    }
    {
      const mapEnabled = mode === 'map';
      if (mapEnabled && !this.mapMesh) {
        this.mapMesh = new MapMesh({
          landManager: this,
        });

        //

        this.mapMesh.addEventListener('hoverpointupdate', e => {
          this.dispatchEvent(new MessageEvent('hoverpointupdate', {
            data: e.data,
          }));
        });
        this.mapMesh.addEventListener('selectpointupdate', e => {
          this.dispatchEvent(new MessageEvent('selectpointupdate', {
            data: e.data,
          }));
        });

        //

        const {engineRenderer, cameraManager} = this;
        const {
          camera,
        } = engineRenderer;
        cameraManager.setControllerFn(this.#controllerFn);
      } else if (!mapEnabled && this.mapMesh) {
        this.mapMesh.destroy();
        this.mapMesh = null;

        const {cameraManager} = this;
        cameraManager.unsetControllerFn(this.#controllerFn);
      }
    }
    this.dispatchEvent(new MessageEvent('gameModeUpdate', {
      data: {
        mode,
        mapMesh: this.mapMesh
      },
    }));
  }

  // map methods

  getMapOffset(target) {
    return target.copy(this.mapOffset);
  }
  setMapOffset(v3) {
    this.mapOffset.copy(v3);
  }

  //
  
  setMapCameraPosition(v3) {
    this.mapMesh && this.mapMesh.setCameraPosition(v3);
  }

  //

  getMapHoverPoint(target) {
    return this.mapMesh && this.mapMesh.getHoverPoint(target);
  }
  setMapHoverPoint(v3) {
    this.mapMesh && this.mapMesh.setHoverPoint(v3);
  }

  getMapSelectPoint(target) {
    return this.mapMesh && this.mapMesh.getSelectPoint(target);
  }
  setMapSelectPoint(v3) {
    this.mapMesh && this.mapMesh.setSelectPoint(v3);
  }

  //

  /* getMapColor() {
    return this.mapMesh.getColor();
  } */
  setMapColor(hex) {
    this.mapMesh && this.mapMesh.setColor(hex);
  }

  //

  setMapTokenMap(tokenMap) {
    this.mapMesh && this.mapMesh.setTokenMap(tokenMap);
  }
  setMapAddress(address) {
    this.mapMesh && this.mapMesh.setAddress(address);
  }

  // event methods

  listenForLandUpdates({
    supabaseClient,
  }, fn) {
    let channel = supabaseClient.supabase
      .channel(landUpdatesChannelName, {
        config: {
          broadcast: {
            self: true,
          },
        },
      })
      .on('broadcast', {
        event: landUpdateEventName,
      }, data => {
        const {
          payload,
        } = data;
        const {
          land,
        } = payload;
        fn(land);
      })
      .on('error', err => {
        console.warn('error', err);
      });
    this.channel = channel;

    (async () => {
      await new Promise((accept, reject) => {
        channel.subscribe(status => {
          accept();
        });
      });
    })();

    return {
      cancel() {
        channel.unsubscribe();
      },
    };
  }

  createSceneTracker({
    supabaseClient,
    sessionUserId,
    appManagerContext,
    appTracker,
    appManagerName,
  }) {
    let loaded = false;
    const allLands = new Map();

    let name = '';
    let description = '';
    let previewImg = '';
    let settings = {};
    let apps = [];

    //

    const update = () => {
      if (!loaded) return;

      const localPlayer = this.playersManager.getLocalPlayer();

      const playerX = Math.floor(localPlayer.position.x / chunkSize);
      const playerZ = Math.floor(localPlayer.position.z / chunkSize);
      const playerCoords = localVector2D.set(playerX, playerZ);

      if (!playerCoords.equals(lastPlayerCoords)) {
        lastPlayerCoords.copy(playerCoords);

        const coords = playerCoords.toArray();
        const key = getCoordsKey(coords);
        const land = allLands.get(key);
        
        if (land) {
          name = land.name ?? '';
          description = land.description ?? '';
          previewImg = land.previewImg ?? '';
          settings = land.settings ?? {};

          events.dispatchEvent(new MessageEvent('nameupdate', {
            data: {
              name,
            },
          }));
          events.dispatchEvent(new MessageEvent('descriptionupdate', {
            data: {
              description,
            },
          }));
          events.dispatchEvent(new MessageEvent('previewimgupdate', {
            data: {
              previewImg,
            },
          }));
          events.dispatchEvent(new MessageEvent('settingsupdate', {
            data: {
              settings,
            },
          }));
        }
      }
    };

    //

    // initial coordinate update
    const lastPlayerCoords = new THREE.Vector2(NaN, NaN);
    (async () => {
      // load all lands
      const results = await supabaseClient.supabase
        .from('land')
        .select('*')
        .order('id', {
          ascending: true,
        });
      const {
        data,
      } = results;

      for (let i = 0; i < data.length; i++) {
        const landObject = data[i];
        const {
          location,
          name,
          description,
          preview_url: previewImg,
          settings,
          objects,
        } = landObject;
        const coords = JSON.parse(location);

        const land = {
          coords,
          name,
          description,
          previewImg,
          objects,
          settings,
        };
        const key = getCoordsKey(coords);
        allLands.set(key, land);
        lastPlayerCoords.set(NaN, NaN);
      }

      loaded = true;

      // initial update
      update();
    })();

    const events = new EventTarget();

    // bind apps tracking
    const updateApps = app => {
      const appManager = appManagerContext.getAppManager(appManagerName);
      apps = appManager.getApps();

      events.dispatchEvent(new MessageEvent('appsupdate', {
        data: {
          apps,
        },
      }));
    };
    const {
      cleanup: unregisterAppTracker,
    } = appTracker.registerAppTracker({
      appManagerName,
      addCb: updateApps,
      removeCb: updateApps,
    });

    //

    events.editable = true;

    //

    events.getId = () => appManagerName;

    events.getName = () => name;
    events.getDescription = () => description;
    events.getPreviewImg = () => previewImg;
    events.getSettings = () => settings;
    events.getApps = () => apps;

    //

    events.getSceneJson = async () => {
      const localPlayer = this.playersManager.getLocalPlayer();
      const coords = [
        Math.floor(localPlayer.position.x / chunkSize),
        Math.floor(localPlayer.position.z / chunkSize),
      ];
      const coordsString = JSON.stringify(coords);
  
      const {
        data: oldLand,
      } = await supabaseClient.supabase
        .from('land')
        .select('*')
        .eq('location', coordsString)
        .maybeSingle();
  
      const appManager = this.appManagerContext.getAppManager(`land:${coords[0]}:${coords[1]}`);
      const apps = appManager.getApps();
      let objects = apps.map(app => app.toJson());
      objects = mapObjectsWorldToChunkCoords(objects, coords);
      const land = {
        ...oldLand,
        objects,
      };
      return land;
    };
    events.setSceneJson = async (json) => {
      const localPlayer = this.playersManager.getLocalPlayer();
      const coords = [
        Math.floor(localPlayer.position.x / chunkSize),
        Math.floor(localPlayer.position.z / chunkSize),
      ];
      const appManager = this.appManagerContext.getAppManager(`land:${coords[0]}:${coords[1]}`);
      json.objects = mapObjectsChunkToWorldCoords(json.objects, coords);
      await appManager.loadJson(json);
    };
    events.save = async (o) => {
      const localPlayer = this.playersManager.getLocalPlayer();
      const coords = [
        Math.floor(localPlayer.position.x / chunkSize),
        Math.floor(localPlayer.position.z / chunkSize),
      ];
      let json = await events.getSceneJson();
      json = {
        ...json,
        ...o,
      };
      const land = await saveCoord(
        coords,
        json,
        {
          supabaseClient,
          userId: sessionUserId,
        },
      );
      // setChanged(false);
    };
    const saveCoord = async (coord, sceneJson) => {
      // need to call listenForLandUpdates() first
      // the reason is that if we were to create the client outselves,
      // other clients would automatically unsubscribe themselves
      if (!this.channel) {
        console.warn('must be subscribed to land first');
      }
  
      const coordString = JSON.stringify(coord);
      const {
        data: oldLand,
      } = await supabaseClient.supabase
        .from('land')
        .select('*')
        .eq('location', coordString);
      const id = oldLand?.id ?? crypto.randomUUID();
  
      //
  
      const land = {
        ...sceneJson,
        id,
        location: coordString,
        user_id: sessionUserId,
      };
      const result = await supabaseClient.supabase
        .from('land')
        .upsert(land);
  
      if (!result.error) {
        // send the update on the supabase channel
        this.channel.send({
          type: 'broadcast',
          event: landUpdateEventName,
          payload: {
            land,
          },
        });
  
        return land;
      } else {
        throw new Error(result?.error?.message);
      }
    };

    //

    events.update = update;
    events.cancel = () => {
      unregisterAppTracker();
    };

    //

    return events;
  }

  createLandTracker({
    supabaseClient,
    range = 1,
  }) {
    const localPlayer = this.playersManager.getLocalPlayer();
    const isPlayerInChunkCoordRange = (playerCoords, chunkCoords, range) => {  
      const playerX = playerCoords.x;
      const playerZ = playerCoords.y;

      const chunkX = chunkCoords.x;
      const chunkZ = chunkCoords.y;

      const chunkXMin = chunkX - (range - 1);
      const chunkXMax = chunkX + (range - 1);
      const chunkZMin = chunkZ - (range - 1);
      const chunkZMax = chunkZ + (range - 1);

      const chunkXInRange = playerX >= chunkXMin && playerX <= chunkXMax;
      const chunkZInRange = playerZ >= chunkZMin && playerZ <= chunkZMax;
      
      const inRange = chunkXInRange && chunkZInRange;
      return inRange;
    };

    let loaded = false;
    const allLands = new Map();
    const liveLands = new Map();
    const lastPlayerCoords = new THREE.Vector2(NaN, NaN);

    //

    const update = () => {
      if (!loaded) return;

      const playerX = Math.floor(localPlayer.position.x / chunkSize);
      const playerZ = Math.floor(localPlayer.position.z / chunkSize);
      const playerCoords = localVector2D.set(playerX, playerZ);

      if (!playerCoords.equals(lastPlayerCoords)) {
        lastPlayerCoords.copy(playerCoords);

        const localPlayerCoords = playerCoords.clone();
        this.queueManager.waitForTurn(async () => {
          // add missing empty lands
          for (let dz = -range; dz <= range; dz++) {
            for (let dx = -range; dx <= range; dx++) {
              const chunkCoords = localVector2D2.set(
                playerCoords.x + dx,
                playerCoords.y + dz,
              );
              const coords = chunkCoords.toArray();
              const key = getCoordsKey(coords);
              if (!allLands.has(key)) {
                const land = {
                  coords,
                  name: '',
                  description: '',
                  previewImg: '',
                  objects: [],
                };
                allLands.set(key, land);
              }
            }
          }

          // compute live lands
          const chunksInRange = new Map();
          for (const [key, land] of allLands.entries()) {
            const chunkCoords = localVector2D2.fromArray(land.coords);
            if (isPlayerInChunkCoordRange(localPlayerCoords, chunkCoords, range)) {
              chunksInRange.set(key, land);
            }
          }

          // add new live lands
          for (const [key, land] of chunksInRange.entries()) {
            if (!liveLands.has(key)) {
              liveLands.set(key, land);
              events.dispatchEvent(new MessageEvent('landadd', {
                data: {
                  key,
                  land,
                },
              }));
            }
          }

          // remove dead lands
          for (const [key, land] of liveLands.entries()) {
            if (!chunksInRange.has(key)) {
              liveLands.delete(key);
              events.dispatchEvent(new MessageEvent('landremove', {
                data: {
                  key,
                  land,
                },
              }));
            }
          }
        });
      }
    };

    // initial coordinate update
    (async () => {
      // load all lands
      const results = await supabaseClient.supabase
        .from('land')
        .select('*')
        .order('id', {
          ascending: true,
        });
      const {
        data,
      } = results;

      for (let i = 0; i < data.length; i++) {
        const landObject = data[i];
        const {
          location,
          name,
          description,
          preview_url: previewImg,
          objects,
        } = landObject;
        const coords = JSON.parse(location);

        const land = {
          coords,
          name,
          description,
          previewImg,
          objects,
        };
        const key = getCoordsKey(coords);
        allLands.set(key, land);
        lastPlayerCoords.set(NaN, NaN);
      }

      loaded = true;

      // initial update
      update();
    })();

    // listen for coordinate updates
    const {
      cancel: cancelLandUpdates,
    } = this.listenForLandUpdates({
      supabaseClient,
    }, landObject => {
      const {
        location: coordsString,
        objects,
      } = landObject;

      let coords;
      try {
        coords = JSON.parse(coordsString);
      } catch (err) {
        console.warn(err);
      }
      if (
        Array.isArray(coords) &&
        coords.length === 2 &&
        typeof coords[0] === 'number' &&
        typeof coords[1] === 'number'
      ) {
        const key = getCoordsKey(coords);

        // old
        if (allLands.has(key)) {
          allLands.delete(key);
          lastPlayerCoords.set(NaN, NaN);
        }

        // new
        const land = {
          coords,
          objects,
        };
        allLands.set(key, land);
        lastPlayerCoords.set(NaN, NaN);

        update();
      }
    });

    //

    const events = new EventTarget();

    events.update = update;
    events.cancel = () => {
      cancelLandUpdates();
    };

    return events;
  }

  /* async getSceneJson() {
    const localPlayer = engine.playersManager.getLocalPlayer();
    const coords = [
      Math.floor(localPlayer.position.x / chunkSize),
      Math.floor(localPlayer.position.z / chunkSize),
    ];
    const coordsString = JSON.stringify(coords);

    const {
      data: oldLand,
    } = await supabaseClient.supabase
      .from('land')
      .select('*')
      .eq('location', coordsString);

    const appManager = engine.appManagerContext.getAppManager(`land:${coords[0]}:${coords[1]}`);
    const apps = appManager.getApps();
    let objects = apps.map(app => app.toJson());
    objects = mapObjectsWorldToChunkCoords(objects, coords);
    const land = {
      ...oldLand,
      objects,
    };
    return json;
  } */
  /* async setSceneJson(json) {
    const localPlayer = engine.playersManager.getLocalPlayer();
    const coords = [
      Math.floor(localPlayer.position.x / chunkSize),
      Math.floor(localPlayer.position.z / chunkSize),
    ];
    const appManager = engine.appManagerContext.getAppManager(`land:${coords[0]}:${coords[1]}`);
    json.objects = mapObjectsChunkToWorldCoords(json.objects, coords);
    await appManager.loadJson(json);
  } */
  /* async onSave(e) {
    const json = this.getSceneJson();
    const land = await engine.landManager.deployCoord(
      coords,
      json,
      {
        supabaseClient,
        userId: sessionUserId,
      },
    );
    setChanged(false);
  } */
  /* async saveCoord(coord, sceneJson, {
    supabaseClient,
    userId,
  }) {
    // need to call listenForLandUpdates() first
    // the reason is that if we were to create the client outselves,
    // other clients would automatically unsubscribe themselves
    if (!this.channel) {
      console.warn('must be subscribed to land first');
    }

    const coordString = JSON.stringify(coord);
    const {
      data: oldLand,
    } = await supabaseClient.supabase
      .from('land')
      .select('*')
      .eq('location', coordString);
    const oldLandId = oldLand ? oldLand.id : null;
    const id = oldLandId ?? crypto.randomUUID();

    //

    const {
      objects,
    } = sceneJson;

    const land = {
      id,
      location: coordString,
      objects,
      user_id: userId,
    };
    const result = await supabaseClient.supabase
      .from('land')
      .upsert(land);

    if (!result.error) {
      // send the update on the supabase channel
      this.channel.send({
        type: 'broadcast',
        event: landUpdateEventName,
        payload: {
          land,
        },
      });

      return land;
    } else {
      throw new Error(result?.error?.message);
    }
  } */

  update(timestamp, timeDiff) {
    this.gridMesh && this.gridMesh.update(timestamp, timeDiff);
    this.mapMesh && this.mapMesh.update(timestamp, timeDiff);
  }

  async waitForLoad() {
    await GridMesh.waitForLoad();
  }
}