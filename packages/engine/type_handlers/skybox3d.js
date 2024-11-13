import * as THREE from 'three';
import {
  useState,
  useEffect,
} from 'react';
import alea from 'alea';
import {
  getHitMap,
  // makeHitMesh,
  // getLine,
  // makePathLineGeometry,

  raycastResolution,
  boundingBoxSize,
  getHitMapIndex,
  // sampleHitMapCoord,
} from '../pathfinding.js';

import {
  getObjectUrl,
} from '../../app-runtime/import-manager.js';

// export const raycastResolution = 128;
// export const boundingBoxSize = 100;
// export const raycastHeight = 10;
// export const getHitMapIndex = (x, z) => x + z * raycastResolution;

import {
  Skybox360Mesh,
} from '../meshes/skybox360/Skybox360Mesh.js';
import {
  SkyboxSphereMesh,
} from '../meshes/skybox360/SkyboxSphereMesh.js';

import reactHelpers from '../react-helpers.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();

const zeroVector = new THREE.Vector3(0, 0, 0);
const upVector = new THREE.Vector3(0, 1, 0);

//

const {
  div,
  span,
  label,
  select,
  option,
  input,
  button,
} = reactHelpers;

//

const modes = [
  '3d',
  '2d',
];

//

export default srcUrl => ctx => {
  const {
    useApp,
    useScene,
    usePhysics,
    // usePlayersManager,
    // useNpcManager,
    usePhysicsTracker,
    useSpawnManager,
    useAutoSpawnManager,
    useCleanup,
    useComponentUi,
    // useEngineRenderer,
    useLoreManager,
    useFrame,
  } = ctx;

  const app = useApp();

  // const scene = useScene();
  // const playersManager = usePlayersManager();
  // const npcManager = useNpcManager();
  const physics = usePhysics();
  const physicsTracker = usePhysicsTracker();
  const spawnManager = useSpawnManager();
  const autoSpawnManager = useAutoSpawnManager();
  // const engineRenderer = useEngineRenderer();
  const loreManager = useLoreManager();
  //

  app.appType = 'skybox3d';
  app.name = srcUrl.match(/([^\/]*)$/)[1];
  app.description = '';

  //

  app.setComponent('interactive', false);

  //

  const getMode = () => {
    const mode = app.getComponent('mode');
    if (modes.includes(mode)) {
      return mode;
    }
    return modes[0];
  };
  const getVisible = () => app.getComponent('visible') ?? true;
  const get3DVisible = () => getVisible() && getMode() === '3d';
  const get2DVisible = () => getVisible() && getMode() === '2d';
  const getPhysicsEnabled = () => get3DVisible() && (app.getComponent('physics') ?? true)
  const getShowSpawnPoints = () => (app.getComponent('showSpawnPoints') ?? false) &&
    getPhysicsEnabled();

  //

  app.setHighlightImage = (image) => {
    const octahedronMesh = app.children[0];

    if (image) {
      octahedronMesh.material.uniforms.highlightImage.value.image = image;
      octahedronMesh.material.uniforms.highlightImage.value.needsUpdate = true;
    }

    octahedronMesh.material.uniforms.highlightImageValid.value = +!!image;
    octahedronMesh.material.uniforms.highlightImageValid.needsUpdate = true;
  };

  //

  const updateModeVisibility = () => {
    if (octahedronMesh) {
       octahedronMesh.visible = get3DVisible();
    }
    if (sphereMesh) {
      sphereMesh.visible = get2DVisible();
    }
  };
  app.addEventListener('componentsupdate', e => {
    const {
      keys,
    } = e;
    if (keys.includes('mode')) {
      updateModeVisibility();
    }
  });

  //

  const updateSpawnpointsVisibility = () => {
    const showSpawnPoints = getShowSpawnPoints();
    for (const mesh of spawnpointMeshes) {
      mesh.visible = showSpawnPoints;
    }
  };

  let cleanup = null;
  useCleanup(() => {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  });

  // add center
  {
    app.center = new THREE.Object3D();
    // app.center.position.y = centerYOffset;
    app.add(app.center);
    app.center.updateMatrixWorld();
  }

  // main physics
  let scenePhysicsObject = null;
  const enablePhysics = () => {
    const scenePhysicsMesh = new THREE.Mesh(
      octahedronMesh.geometry.clone()
        .applyMatrix4(app.matrixWorld),
      octahedronMesh.material
    );

    scenePhysicsObject = physics.addGeometry(scenePhysicsMesh);
    physicsTracker.addAppPhysicsObject(app, scenePhysicsObject);
    scenePhysicsObject.updateMatrixWorld();

    scenePhysicsObject.name = app.name;
    scenePhysicsObject.description = app.description;
  };
  const disablePhysics = () => {
    physics.removeGeometry(scenePhysicsObject);
    physicsTracker.removeAppPhysicsObject(app, scenePhysicsObject);
    scenePhysicsObject = null;
  };
  const updatePhysics = () => {
    const physicsEnabled = getPhysicsEnabled();
    // console.log('check physics enabled', physicsEnabled, app);
    if (physicsEnabled && !scenePhysicsObject) {
      // console.log('enable physics', app);
      enablePhysics();
    } else if (!physicsEnabled && scenePhysicsObject) {
      // console.log('disable physics', app);
      disablePhysics();
    }
  };
  const updatePhysicsAsync = () => {
    queueMicrotask(updatePhysics);
  };

  // spawn candidates
  const spawnCandidates = [];
  const spawnpointMeshes = [];
  const updateSpawnCandidates = ({
    hitMap,
  }) => {
    // remove old candidates (this includes the spawn meshes)
    for (const candidate of spawnCandidates) {
      autoSpawnManager.removeSpawnCandidate(candidate);
      app.remove(candidate);
    }
    spawnCandidates.length = 0;
    spawnpointMeshes.length = 0;

    // add new
    const numPoints = 20;
    const pointsRage = 30;
    const pointRadiusRequired = 1;
    const pointRadiusRequiredPx = Math.ceil(pointRadiusRequired / boundingBoxSize * raycastResolution);
    const pointsYRange = 2;
    const rng = alea(srcUrl);
    const numRetries = 4096;
    const appMatrixWorldInverse = app.matrixWorld.clone().invert();
    for (let i = 0; i < numPoints; i++) {
      let j;
      for (j = 0; j < numRetries; j++) {
        const x = raycastResolution / 2 + Math.round(((rng() * 2) - 1) * pointsRage);
        const z = raycastResolution / 2 + Math.round(((rng() * 2) - 1) * pointsRage);
        const hitMapIndex = getHitMapIndex(x, z);
        const hit = hitMap.hit[hitMapIndex];
        if (hit) {
          // check that it's not in range of the center, where the player will spawn
          const centerBoxMinX = centerX - pointRadiusRequiredPx;
          const centerBoxMinZ = centerZ - pointRadiusRequiredPx;
          const centerBoxMaxX = centerX + pointRadiusRequiredPx;
          const centerBoxMaxZ = centerZ + pointRadiusRequiredPx;
          const isInCenter = x >= centerBoxMinX && x <= centerBoxMaxX && z >= centerBoxMinZ && z <= centerBoxMaxZ;

          if (!isInCenter) {
            // check that neighbors have room
            let hasAllNeighbors = true;
            const centerOfPoint = localVector.fromArray(hitMap.point, hitMapIndex * 3);
            for (let dx = -pointRadiusRequiredPx; dx <= pointRadiusRequiredPx; dx++) {
              for (let dz = -pointRadiusRequiredPx; dz <= pointRadiusRequiredPx; dz++) {
                const px = x + dx;
                const pz = z + dz;
                const nHitMapIndex = getHitMapIndex(px, pz);
                const nHit = hitMap.hit[nHitMapIndex];
                if (nHit) {
                  const point = localVector2.fromArray(hitMap.point, nHitMapIndex * 3);
                  const yDistance = Math.abs(point.y - centerOfPoint.y);
                  if (yDistance < pointsYRange) {
                    // nothing
                  } else {
                    hasAllNeighbors = false;
                    break;
                  }
                } else {
                  hasAllNeighbors = false;
                  break;
                }
              }
              if (!hasAllNeighbors) {
                break;
              }
            }

            if (hasAllNeighbors) {
              if (!spawnCandidates.some(c => c.index === hitMapIndex)) {
                const point = localVector2.fromArray(hitMap.point, hitMapIndex * 3);
                point.applyMatrix4(appMatrixWorldInverse);
                point.y += centerYOffset;

                const candidate = new THREE.Object3D();
                candidate.index = hitMapIndex;
                candidate.position.copy(point);
                candidate.quaternion.setFromRotationMatrix(
                  localMatrix.lookAt(
                    localVector3.set(candidate.position.x, 0, candidate.position.z),
                    zeroVector,
                    upVector
                  )
                )
                app.add(candidate);
                app.updateMatrixWorld();

                autoSpawnManager.addSpawnCandidate(candidate);
                spawnCandidates.push(candidate);
              }

              break;
            }
          }
        }
      }
      if (j === numRetries) {
        console.warn('failed to find point');
        break;
      }
    }

    const testGeometry = new THREE.BoxGeometry(0.05, 10, 0.05)
      .translate(0, 10 / 2, 0);
    const testMaterial = new THREE.MeshNormalMaterial();
    for (const candidate of spawnCandidates) {
      const mesh = new THREE.Mesh(testGeometry, testMaterial);
      candidate.add(mesh);
      mesh.updateMatrixWorld();
      spawnpointMeshes.push(mesh);
    }
  };

  // spawn points
  let spawnPoint = null;
  const updateSpawnPoint = () => {
    if (spawnPoint !== null) {
      spawnManager.unsetSpawnPoint(spawnPoint);
      spawnPoint = null;
    }

    if (getPhysicsEnabled()) {
      spawnPoint = spawnManager.setSpawnPoint(
        app.position.clone(),
        app.quaternion.clone()
      );
    }
  };
  useCleanup(() => {
    if (spawnPoint) {
      spawnManager.unsetSpawnPoint(spawnPoint);
      spawnPoint = null;
    }
  });

  // create meshes
  let octahedronMesh = null;
  let sphereMesh = null;
  const centerX = Math.floor(raycastResolution / 2);
  const centerZ = Math.floor(raycastResolution / 2);
  let centerYOffset;
  const loadSrc = async (srcUrl) => {
    const res = await fetch(srcUrl);
    const json = await res.json();
    app.spec = {start_url: srcUrl, ...json};

    const {
      // name,
      // description,
      fileUrl,
      depthMapUrl,
    } = app.spec;

    //

    // load the images
    const [
      img,
      depthMap,
    ] = await Promise.all([
      (async () => {
        const imgBlob = await (async () => {
          const res = await fetch(fileUrl);
          const blob = await res.blob();
          return blob;
        })();
        const img = await createImageBitmap(imgBlob, {
          imageOrientation: 'flipY',
        });
        return img;
      })(),
      (async () => {
        const res = await fetch(depthMapUrl);
        const blob = await res.blob();
        const depthMap = await createImageBitmap(blob);
        return depthMap;
      })(),
    ]);

    // octahedron mesh
    // const mode = getMode();
    const needsOctahedronMesh = true; // mode === '3d';
    if (needsOctahedronMesh) {
      const updateOctahedronGeometry = async () => {
        console.log('update octahedron geometry', octahedronMesh);

        await octahedronMesh.load({
          img,
          depthMap,
        });

        //

        // update geometry
        {
          const appMatrixWorldInverse = app.matrixWorld.clone().invert();

          const octahedronMeshGeometry = octahedronMesh.geometry.clone()
            .applyMatrix4(app.matrixWorld);
          {
            // flip the triangles
            const localTriangle = new THREE.Triangle();
            const positions = octahedronMeshGeometry.attributes.position.array;
            const index = octahedronMeshGeometry.index.array;
            const maxLength = 10;
            for (let i = 0; i < index.length; i += 3) {
              const a = index[i + 0];
              const b = index[i + 1];
              const c = index[i + 2];
              localTriangle.a.fromArray(positions, a * 3);
              localTriangle.b.fromArray(positions, b * 3);
              localTriangle.c.fromArray(positions, c * 3);
              if (
                localTriangle.a.length() > maxLength ||
                localTriangle.b.length() > maxLength ||
                localTriangle.c.length() > maxLength
              ) {
                index[i + 0] = 0;
                index[i + 1] = 0;
                index[i + 2] = 0;
              }
            }
          }

          // prepare a temp scene physics object
          const scenePhysicsMesh = new THREE.Mesh(
            octahedronMeshGeometry,
            octahedronMesh.material
          );
          const tempScenePhysicsObject = physics.addGeometry(scenePhysicsMesh);
          physicsTracker.addAppPhysicsObject(app, tempScenePhysicsObject);
          tempScenePhysicsObject.updateMatrixWorld();

          // create the hit map
          const hitMap = getHitMap({
            localPlayer: app,

            // playersManager,
            // npcManager,

            physicsTracker,
            physicsObjects: [tempScenePhysicsObject],
          });
          
          const _updateCenterYOffset = () => {
            // compute center offset
            const centerPointIndex = getHitMapIndex(centerX, centerZ);
            const centerPoint = new THREE.Vector3().fromArray(hitMap.point, centerPointIndex * 3);
            centerPoint.applyMatrix4(appMatrixWorldInverse);
            centerYOffset = -centerPoint.y;
          };
          _updateCenterYOffset();

          //

          // const hitMesh = makeHitMesh(hitMap);
          // hitMesh.matrix.copy(appMatrixWorldInverse)
          //   .decompose(hitMesh.position, hitMesh.quaternion, hitMesh.scale);
          // hitMesh.position.y += centerYOffset;
          // app.add(hitMesh);
          // hitMesh.updateMatrixWorld();

          // global updates
          updateSpawnCandidates({
            hitMap,
          });
          updateSpawnPoint();
          updateSpawnpointsVisibility();

          updatePhysics();

          const _offsetOrigin = () => {
            // adjust up to height
            octahedronMesh.geometry.translate(0, centerYOffset, 0);

            // update app center
            app.center.position.y = centerYOffset;
            app.center.updateMatrixWorld();
          };
          _offsetOrigin();

          // remove temp physics object
          physicsTracker.removeAppPhysicsObject(app, tempScenePhysicsObject);
          physics.removeGeometry(tempScenePhysicsObject);
        }
      };

      if (!octahedronMesh) {
        // instantiate new octahedron mesh
        octahedronMesh = new Skybox360Mesh();

        // update geometry
        await updateOctahedronGeometry();

        // add to app
        octahedronMesh.visible = get3DVisible();
        app.add(octahedronMesh);
        octahedronMesh.updateMatrixWorld();
      } else {
        await updateOctahedronGeometry();
      }
    }

    //

    const needsSphereMesh = true; // mode === '2d';
    if (needsSphereMesh) {
      if (!sphereMesh) {
        sphereMesh = new SkyboxSphereMesh();
      }

      await sphereMesh.load({
        img,
        // depthMap,
      });

      sphereMesh.visible = get2DVisible();

      app.add(sphereMesh);
      sphereMesh.updateMatrixWorld();
    }

    //
    // bindings
    //

    // update physics based on position/quaternion/scale
    const _bindPhysicsUpdateLoop = () => {
      const lastPosition = new THREE.Vector3();
      const lastQuaternion = new THREE.Quaternion();
      const lastScale = new THREE.Vector3();

      const getTransform = (position, quaternion, scale) => {
        octahedronMesh.matrixWorld.decompose(
          localVector,
          localQuaternion,
          localVector2
        );
        position.copy(localVector);
        quaternion.copy(localQuaternion);
        scale.copy(localVector2);
      };
      useFrame(() => {
        if (scenePhysicsObject) {
          getTransform(localVector3, localQuaternion2, localVector4);
          if (
            !localVector3.equals(lastPosition) ||
            !localQuaternion2.equals(lastQuaternion) ||
            !localVector4.equals(lastScale)
          ) {
            lastPosition.copy(localVector3);
            lastQuaternion.copy(localQuaternion2);
            lastScale.copy(localVector4);
            disablePhysics();
            enablePhysics();
          }
        }
      });
    };
    _bindPhysicsUpdateLoop();

    // bind spawn points visibility
    const componentsupdate = e => {
      const {
        keys,
      } = e;
      if (keys.includes('showSpawnPoints') || keys.includes('visible')) {
        updateSpawnpointsVisibility();            
      }
    };
    app.addEventListener('componentsupdate', componentsupdate);

    // bind visibility
    app.addEventListener('componentsupdate', e => {
      const {
        keys,
      } = e;
      if (keys.includes('visible')) {
        updatePhysicsAsync();
        octahedronMesh.visible = get3DVisible()
        updateSpawnPoint();
      }
    });
    useCleanup(() => {
      if (scenePhysicsObject) {
        disablePhysics();
      }
    });

    // add lore
    {
      loreManager.addLocation(app);

      useCleanup(() => {
        loreManager.removeLocation(app);
      });
    }
  };

  ctx.waitUntil((async () => {
    // console.log('skybox3d wait for load 1');
    await loadSrc(srcUrl);

    app.addEventListener('contentupdate', async e => {
      const newSrcUrl = getObjectUrl(app.spec);
      await loadSrc(newSrcUrl);
    });
    // console.log('skybox3d wait for load 2');
  })());

  // register components ui
  useComponentUi(({
    contentPath,
    setContentPath,
    debug,
  }) => {
    const [mode, setMode] = useState(() => app.getComponent('mode') ?? modes[0]);
    const [showSpawnPoints, setShowSpawnPoints] = useState(() => app.getComponent('showSpawnPoints') ?? false);

    //

    useEffect(() => {
      const oldMode = app.getComponent('mode');
      if (mode !== oldMode) {
        app.setComponent('mode', mode);
      }
      const oldSpawnPoints = app.getComponent('showSpawnPoints');
      if (showSpawnPoints !== oldSpawnPoints) {
        app.setComponent('showSpawnPoints', showSpawnPoints);
      }
    }, [
      mode,
      showSpawnPoints,
    ]);

    //

    return div([
      div([
        label([
          span('Mode'),
          select({
            value: mode,
            onChange: e => {
              setMode(e.target.value);
            },
          }, modes.map(mode => option({
            key: mode,
            value: mode,
          }, mode))),
        ]),
      ]),
      label([
        span('Show spawnpoints'),
        input({
          type: 'checkbox',
          checked: showSpawnPoints,
          onChange: e => {
            setShowSpawnPoints(e.target.checked);
          },
        }),
      ]),
    ]);
  });

  return app;
};
