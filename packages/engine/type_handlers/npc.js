import * as THREE from 'three';
import React, {
  useState,
  useEffect,
} from 'react';
import convexHull from 'convex-hull-wp';
import {
  getHitMap,
  makeHitMesh,
  getLine,
  makePathLineGeometry,

  raycastResolution,
  boundingBoxSize,
  getHitMapIndex,
  sampleHitMapCoord,
} from '../pathfinding.js';
import reactHelpers from '../react-helpers.js';

// import {
//   wearableAssetTypes,
// } from '../../../pages/components/content-window/asset-types.js';

import {
  getObjectUrl,
} from '../../app-runtime/import-manager.js';

//

const {
  div,
  span,
  label,
  input,
  button,
} = reactHelpers;

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector2D = new THREE.Vector2();
const zeroVector = new THREE.Vector3();
const upVector = new THREE.Vector3(0, 1, 0);
const topVector = new THREE.Vector3(0, 10000, 0);
const localEuler = new THREE.Euler();
const waypointRange = 300;

//

export default srcUrl => ctx => {
  const {
    useApp,
    useEngineRenderer,
    usePlayersManager,
    useNpcManager,
    useStoryManager,
    usePhysics,
    useComponentUi,
    useFrame,
    useCleanup,
  } = ctx;
  const app = useApp();
  const engineRenderer = useEngineRenderer();
  const {scene} = engineRenderer;
  const playersManager = usePlayersManager();
  const npcManager = useNpcManager();
  const storyManager = useStoryManager();
  const physicsManager = usePhysics();

  app.appType = 'npc';

  const getVisible = () => app.getComponent('visible') ?? true;

  let live = true;
  const cleanupFns = [];
  app.npc = null;
  ctx.waitUntil((async () => {
    const npc = await npcManager.addNpcApp(app, srcUrl);
    if (!live) return;

    app.name = npc.playerSpec.name || '';
    app.description = npc.playerSpec.description || '';

    app.npc = npc;
    npc.playerApp = app;

    {
      const npcs = new Set();
      const npcBindings = new Map();
      const _startMovement = (playerId, player) => {
        if (!npcBindings.has(playerId) && !storyManager.currentConversation) {
          const abortController = new AbortController();
    
          const _walkNewPath = async () => {
            const source = player.position;
            const destinationOffset = new THREE.Vector3(
              (Math.random() - 0.5) * 2 * waypointRange,
              0,
              (Math.random() - 0.5) * 2 * waypointRange
            );
            const destination = source.clone()
              .add(destinationOffset);
    
            // get the quaternion between the source and the destination
            const quaternion = new THREE.Quaternion()
              .setFromRotationMatrix(
                new THREE.Matrix4()
                  .lookAt(
                    source,
                    destination,
                    upVector,
                  )
              );
            
            // amount of points between the destination
            const internalPoints = 10;
            const points = [source];
            for (let i = 0; i < internalPoints; i++) {
              const point = source.clone()
                .lerp(destination, (i + 1) / (internalPoints + 1));
              const rightVector = new THREE.Vector3(1, 0, 0)
                .applyQuaternion(quaternion);
              // randomly offset left or right along the point
              const offset = rightVector.clone()
                .multiplyScalar((Math.random() - 0.5) * 2 * 10);
              point.add(offset);
              points.push(point);
            }
            // final point
            points.push(destination);
    
            // create the curve
            const curve = new THREE.CatmullRomCurve3(points);
            
            // walk along the curve
            let currentPointIndex = 1;
            await new Promise((accept, reject) => {
              const _setNextWaypoint = () => {
                // start the waypoint
                const currentPoint = curve.points[currentPointIndex];
                const timestamp = performance.now();
                player.characterBehavior.addWaypointAction(
                  currentPoint,
                  timestamp,
                  {
                    speed: 2.5,
                  },
                );
    
                // when the waypoint is done
                const actionremoved = e => {
                  const {action} = e.data;
                  if (action.type === 'behavior' && action.behaviorType === 'waypoint') {
                    player.actionManager.removeEventListener('actionremoved', actionremoved);
                    abortController.signal.removeEventListener('abort', abort);
    
                    if (currentPointIndex < curve.points.length - 1) {
                      currentPointIndex++;
                      _setNextWaypoint();
                    } else {
                      accept();
                    }
                  }
                };
                player.actionManager.addEventListener('actionremoved', actionremoved);
    
                const conversationchange = e => {
                  const {
                    conversation,
                  } = e.data;
                  if (conversation) {
                    // stop the waypoint
                    player.characterBehavior.clearWaypointActions();
                    storyManager.removeEventListener('conversationchange', conversationchange);
                    abortController.signal.removeEventListener('abort', abort);
      
                    // wait for conversation to end so we can start the waypoint again
                    storyManager.addEventListener('conversationchange', conversationchange2);
                  }
                };
                const conversationchange2 = e => {
                  const {
                    conversation,
                  } = e.data;
                  if (!conversation) {
                    storyManager.removeEventListener('conversationchange', conversationchange2);
    
                    // start the waypoint again
                    _setNextWaypoint();
                  }
                };
                // wait for conversation to interrupt waypoint
                storyManager.addEventListener('conversationchange', conversationchange);
    
                const abort = e => {
                  storyManager.removeEventListener('conversationchange', conversationchange);
                  storyManager.removeEventListener('conversationchange', conversationchange2);
                  player.actionManager.removeEventListener('actionremoved', actionremoved);
    
                  player.characterBehavior.clearWaypointActions();
                  // note: this line hacks around a bug where the character will continue to walk with velocity despite no waypoint action
                  player.characterPhysics.applyWasd(zeroVector, engineRenderer.camera, 0);
                };
                abortController.signal.addEventListener('abort', abort);
              };
              _setNextWaypoint();
            });
    
            _walkNewPath();
          };
          _walkNewPath();
    
          npcBindings.set(playerId, {
            player,
            cleanup: () => {
              abortController.abort();
            },
          });
        }
      };
      const _stopMovement = (playerId, player) => {
        const npcBinding = npcBindings.get(playerId);
        if (npcBinding) {
          npcBinding.cleanup();
          npcBindings.delete(playerId);
        }
      };
      const _bindBehaviors = () => {    
        // start movement initially
        app.getComponent('randomWalk') && _startMovement(npc.playerId, npc);

        // stop movement on conversation
        const conversationchange = e => {
          const {
            conversation,
          } = e.data;
          if (conversation) {
            for (const npc of npcs) {
              _stopMovement(npc.playerId, npc);
            }
          } else {
            for (const npc of npcs) {
              _startMovement(npc.playerId, npc);
            }
          }
        };
        storyManager.addEventListener('conversationchange', conversationchange);

        cleanupFns.push(() => {
          _stopMovement(npc.playerId, npc);
        });
      };
      _bindBehaviors();

      //

      const updateNpcVisibility = () => {
        const visible = getVisible();
        app.npc.enabled = visible;

        app.npc.avatarApp.visible = visible;

        const characterController = app.npc.characterPhysics.characterController;
        if (visible) {
          physicsManager.enableActor(characterController);
        } else {
          physicsManager.disableActor(characterController);
          physicsManager.setCharacterControllerPosition(
            characterController,
            topVector,
          );
        }
      };
      if (!getVisible()) {
        updateNpcVisibility();
      }

      app.addEventListener('componentsupdate', e => {
        const {
          keys,
        } = e;
        if (keys.includes('visible')) {
          updateNpcVisibility();
        }
        if (keys.includes('randomWalk')) {
          if (app.getComponent('randomWalk')) {
            _startMovement(npc.playerId, npc);
          } else {
            _stopMovement(npc.playerId, npc);
          }
        }
      });
    }

    //

    {
      let hitMap = null;
      let hitMesh = null;
      let lineMesh
      const _startDebugDraw = () => {
        // const localPlayer = playersManager.getLocalPlayer();

        hitMap = getHitMap({
          // localPlayer,
          localPlayer: npc,
          playersManager,
          npcManager,
        });
        hitMesh = makeHitMesh(hitMap);
        scene.add(hitMesh);

        // make 2d convex hull around the hit map
        const numPoints = 32;
        const points = [];
        for (let i = 0; i < numPoints; i++) {
          const x = -1 + Math.random() * 2;
          const y = -1 + Math.random() * 2;
          // normalize the distance
          localVector2D.set(x, y)
            .normalize()
            .multiplyScalar(Math.random() * raycastResolution / 2 * 0.25);
          localVector2D.x += raycastResolution / 2;
          localVector2D.y += raycastResolution / 2;
          localVector2D.x = Math.floor(localVector2D.x);
          localVector2D.y = Math.floor(localVector2D.y);
          const index = getHitMapIndex(
            localVector2D.x,
            localVector2D.y,
          );
          const point = hitMap.coords[index];
          points.push([
            point.x,
            point.z,
          ]);
        }
        const ch = convexHull(points);
        const chPoints3D = ch.map(xz => new THREE.Vector3(
          xz[0],
          0,
          xz[1],
        ));

        // position the points around the root point
        const rootPointIndex = Math.floor(Math.random() * chPoints3D.length);
        const rootPoint = localVector2.copy(chPoints3D[rootPointIndex]);
        rootPoint.y = 0;
        const npcPosition = localVector3.copy(npc.position);
        npcPosition.y = 0;
        chPoints3D.forEach(p => p.sub(rootPoint).add(npcPosition));

        // add intermediate points
        const maxLineSegmentLength = 0.5;
        const chPoints3D2 = [];
        for (let i = 0; i < chPoints3D.length - 1; i++) {
          const p1 = chPoints3D[i];
          const p2 = chPoints3D[(i + 1) % chPoints3D.length];
          const d = p1.distanceTo(p2);

          const numExtraPoints = Math.floor(d / maxLineSegmentLength);
          for (let i = 0; i < numExtraPoints; i++) {
            const p = p1.clone()
              .lerp(p2, i / numExtraPoints);
            chPoints3D2.push(p);
          }
        }

        // fix the y values
        const hitMapBase = hitMap.boundingBox.getCenter(localVector);
        hitMapBase.x -= boundingBoxSize / 2;
        hitMapBase.z -= boundingBoxSize / 2;
        chPoints3D2.forEach(p => {
          p.y = sampleHitMapCoord(
            hitMap.coords,
            (p.x - hitMapBase.x) / boundingBoxSize * raycastResolution,
            (p.z - hitMapBase.z) / boundingBoxSize * raycastResolution,
            localVector2
          ).y;
        });

        // raise the points a bit
        chPoints3D2.forEach(p => {
          p.y += 0.15;
        });

        const line = chPoints3D2;
        if (line.length > 0) {
          const geometry = makePathLineGeometry(line);
          const map = new THREE.TextureLoader()
            .load(`/images/arrowtail.png`);
          const material = new THREE.MeshBasicMaterial({
            map,
            side: THREE.DoubleSide,
          });
          lineMesh = new THREE.Mesh(geometry, material);
          lineMesh.frustumCulled = false;
          lineMesh.visible = geometry.attributes.position.array.length > 0;
          scene.add(lineMesh);
          lineMesh.updateMatrixWorld();
        }
      };
      const _stopDebugDraw = () => {
        if (hitMesh) {
          scene.remove(hitMesh);
          hitMesh = null;
        }
        if (lineMesh) {
          scene.remove(lineMesh);
          lineMesh = null;
        }
      };

      cleanupFns.push(() => {
        _stopDebugDraw();
      });

      app.getComponent('debugDraw') && _startDebugDraw();

      app.addEventListener('componentsupdate', e => {
        const {keys} = e;
        if (keys.includes('debugDraw')) {
          if (app.getComponent('debugDraw')) {
            _startDebugDraw();
          } else {
            _stopDebugDraw();
          }
        }
      });
    }

    //

    app.addEventListener('contentupdate', async e => {
      const newSrcUrl = getObjectUrl(app.spec);

      await npc.setPlayerSpec({
        ...npc.playerSpec,
        avatarUrl: newSrcUrl,
      });
    });

    //

    cleanupFns.push(() => {
      npcManager.removeNpcApp(app);
    });
  })());

  // update transforms
  const lastMatrixWorld = app.matrixWorld.clone();
  useFrame(() => {
    if (!app.matrixWorld.equals(lastMatrixWorld)) {
      lastMatrixWorld.copy(app.matrixWorld);

      if (app.npc && getVisible()) {
        localVector.copy(app.position);
        localVector.y += app.npc.avatar.height;
        app.npc.characterPhysics.setPosition(localVector);

        localEuler.setFromQuaternion(app.quaternion, 'YXZ');
        localEuler.x = 0;
        localEuler.z = 0;
        app.npc.quaternion.setFromEuler(localEuler);
      }
    }
  });

  // register components ui
  useComponentUi(({
    contentPath,
    setContentPath,
    debug,
  }) => {
    const [randomWalk, setRandomWalk] = useState(() => !!app.getComponent('randomWalk'));
    const [debugDraw, setDebugDraw] = useState(() => !!app.getComponent('debugDraw'));

    //

    useEffect(() => {
      const oldRandomWalk = app.getComponent('randomWalk');
      if (randomWalk !== oldRandomWalk) {
        app.setComponent('randomWalk', randomWalk);
      }
    }, [
      randomWalk,
    ]);

    useEffect(() => {
      const oldDebugDraw = app.getComponent('debugDraw');
      if (debugDraw !== oldDebugDraw) {
        app.setComponent('debugDraw', debugDraw);
      }
    }, [
      debugDraw,
    ]);

    //

    return div([
      /* debug && div([
        label([
          span('Wearables'),
          div([
            button({
              onClick: () => {
                const newContentPath = [
                  ...contentPath,
                  {
                    type: 'editNpcWearables',
                    // item: {
                    //   app,
                    // },
                    assetType: wearableAssetTypes,
                    items: [],
                  },
                ];
                setContentPath(newContentPath);
              },
            }, [
              'Edit',
            ]),
          ]),
        ]),
      ]), */

      div([
        label([
          span('Random Walk'),
          input({
            type: 'checkbox',
            onChange: e => {
              setRandomWalk(e.target.checked);
            },
            checked: randomWalk,
          }),
        ]),
      ]),

      debug && div([
        label([
          span('Debug Draw'),
          input({
            type: 'checkbox',
            onChange: e => {
              setDebugDraw(e.target.checked);
            },
            checked: debugDraw,
          }),
        ]),
      ]),
    ]);
  });

  // cleanup
  useCleanup(() => {
    live = false;

    for (const cleanupFn of cleanupFns) {
      cleanupFn();
    }
  });

  return app;
};