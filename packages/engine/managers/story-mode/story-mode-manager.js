import * as THREE from 'three';
import physicsManager from '../../physics/physics-manager.js';
import {
  imgSrcs,
} from './zineskybox-sources.json'
// import PF from 'pathfinding';
import PF from '../../../PathFinding.js/pathfinding-browser.js';
// import alea from 'alea';
// globalThis.PF = PF;

// console.log('got sources', {
//   imgSrcs,
// });
const hash = '2db7a7828037da56028a63522d79befca49e33c2';
const baseUrl = `https://rawcdn.githack.com/avaer/content/${hash}/worldzines/`;

//

const localVector = new THREE.Vector3();
const localMatrix = new THREE.Matrix4();
const localPlane = new THREE.Plane();

//

const downQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

//

export class StoryModeManager extends THREE.Object3D {
  constructor({
    engineRenderer,
    realmManager,
    floorManager,
    playersManager,
    npcManager,
  }) {
    super();

    this.engineRenderer = engineRenderer;
    this.realmManager = realmManager;
    this.floorManager = floorManager;
    this.playersManager = playersManager;
    this.npcManager = npcManager;
  }
  async startStoryMode() {
    // console.log('start story mode 1');

    const imgSrc = imgSrcs[Math.floor(Math.random() * imgSrcs.length)];

    const rootRealm = this.realmManager.getRootRealm();
    const worldZineApp = await rootRealm.appManager.addAppAsync({
      type: 'application/zineskybox',
      content: {
        imgSrc: `${baseUrl}${imgSrc}`,
      },
    });
    worldZineApp.setSelected(true);
    // console.log('got world zine', worldZineApp);
    const worldZineMesh = worldZineApp.getMesh();

    // console.log('start story mode 2');

    let apps = [
      worldZineApp,
    ];

    // disable floor
    this.floorManager.disableFloor();

    // load content

    const raycastResolution = 128;
    const boundingBox = new THREE.Box3()
      .setFromObject(worldZineMesh);
    const size = boundingBox.getSize(new THREE.Vector3());
    const getHitMap = () => {
      const ps = [];
      const qs = [];
      for (let h = 0; h < raycastResolution; h++) {
        for (let w = 0; w < raycastResolution; w++) {
          const p = new THREE.Vector3()
            .copy(boundingBox.min)
            .add(new THREE.Vector3(
              w / raycastResolution * size.x,
              0,
              h / raycastResolution * size.z
            ));
          // p.y = boundingBox.max.y + 1;
          p.y = 0;
          const q = downQuaternion;
          ps.push(p);
          qs.push(q);
        }
      }
      const physicsScene = physicsManager.getScene();
      const hitMap = physicsScene.raycastArray(ps, qs, ps.length);
      
      hitMap.coords = Array(hitMap.hit.length);
      hitMap.validCoords = new Set();
      for (let i = 0; i < hitMap.hit.length; i++) {
        const hit = hitMap.hit[i];
        if (hit) {
          const x = i % raycastResolution;
          const y = Math.floor(i / raycastResolution);

          let hasAllNeighbors = true;
          for (let dx = -5; dx <= 5; dx++) {
            for (let dy = -5; dy <= 5; dy++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < raycastResolution && ny >= 0 && ny < raycastResolution) {
                const ni = ny * raycastResolution + nx;
                if (!hitMap.hit[ni]) {
                  hasAllNeighbors = false;
                  break;
                }
              }
            }
          }

          const position = new THREE.Vector3().fromArray(hitMap.point, i * 3);
          // position.y += 1.5;
          hitMap.coords[i] = position;

          if (hasAllNeighbors) {
            const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI * 2 * Math.random());
            hitMap.validCoords.add({
              position,
              quaternion,
            });
          }
        } else {
          hitMap.coords[i] = null;
        }
      }
      
      return hitMap;
    };
    const makeHitMesh = hitMap => {
      // instanced cube mesh
      const baseGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const baseMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
      });
      const instancedMesh = new THREE.InstancedMesh(baseGeometry, baseMaterial, hitMap.hit.length);
      instancedMesh.frustumCulled = false;
      instancedMesh.name = 'instancedMesh';
      instancedMesh.count = 0;

      for (let i = 0; i < hitMap.hit.length; i++) {
        const hit = hitMap.hit[i];
        if (hit) {
          const point = new THREE.Vector3().fromArray(hitMap.point, i * 3);
          instancedMesh.setMatrixAt(
            i,
            localMatrix
              .makeTranslation(point.x, point.y, point.z)
          );
        }
        instancedMesh.count++;
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

      return instancedMesh;
    };
    const makePathMesh = (line) => {
      const baseGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
      const baseMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      });
      const instancedMesh = new THREE.InstancedMesh(baseGeometry, baseMaterial, line.length);
      instancedMesh.frustumCulled = false;
      instancedMesh.name = 'instancedMesh';
      instancedMesh.count = 0;

      for (let i = 0; i < line.length; i++) {
        const point = new THREE.Vector3().fromArray(line[i]);
        instancedMesh.setMatrixAt(
          i,
          localMatrix
            .makeTranslation(point.x, point.y, point.z)
        );
        instancedMesh.count++;
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

      return instancedMesh;
    };
    const addContent = async (hitMap) => {
      const _listenPortalApp = portalApp => {
        const localPlayer = this.playersManager.getLocalPlayer();
        let lastPosition = localPlayer.position.clone();
        let transitionedLastFrame = false;
        const recurse = () => {
          frame = requestAnimationFrame(recurse);

          const portalPlane = localPlane.setFromNormalAndCoplanarPoint(
            localVector.set(0, 0, 1)
              .applyQuaternion(portalApp.quaternion),
            portalApp.position
          );
          const lastDistance = portalPlane.distanceToPoint(lastPosition);
          const distance = portalPlane.distanceToPoint(localPlayer.position);

          if (lastDistance >= 0 && distance < 0) {
            // console.log('transition to portal');
            // now check whether we passed through the portal bounding square (within 2m of each side)
            const projectedPoint = localPlane.projectPoint(localPlayer.position, localVector);
            const distanceToCenter = projectedPoint.sub(portalApp.position);
            distanceToCenter.x = Math.abs(distanceToCenter.x);
            distanceToCenter.y = Math.abs(distanceToCenter.y);
            
            // console.log('got distance', distanceToCenter.x, distanceToCenter.y);
            if (distanceToCenter.x <= 0.5 && distanceToCenter.y <= 1) {
              // move current world into portal
              // const rootRealm = this.realmManager.getRootRealm();
              // const portalAppManager = portalApp.getAppManager();
              // rootRealm.appManager.transplantApp(worldZineApp, portalAppManager);
              const oldApps = apps.slice();
              // disable old apps
              for (let i = 0; i < oldApps.length; i++) {
                const oldApp = oldApps[i];
                oldApp.setSelected(false);
              }

              // swap world with portal
              const newApps = portalApp.swapApps(oldApps, rootRealm.appManager);
              for (let i = 0; i < newApps.length; i++) {
                const newApp = newApps[i];
                newApp.setSelected(true);
              }
              apps = newApps;

              transitionedLastFrame = true;
            }
          }

          lastPosition.copy(localPlayer.position);
          transitionedLastFrame = false;
        };
        let frame = requestAnimationFrame(recurse);
      };
      const _addPortals = async () => {
        const numPortals = 1;
        
        const specs = [];
        for (let i = 0; i < numPortals; i++) {
          const validCoord = Array.from(hitMap.validCoords)[Math.floor(Math.random() * hitMap.validCoords.size)];
          const imgSrc = imgSrcs[Math.floor(Math.random() * imgSrcs.length)];
          const spec = {
            validCoord,
            imgSrc,
          };
          specs.push(spec);
        }

        for (let i = 0; i < specs.length; i++) {
          const spec = specs[i];
          const {
            validCoord,
            imgSrc,
          } = spec;
          
          let {
            position,
            quaternion,
          } = validCoord;

          const rootScene = this.realmManager.getRootRealm();
          position = position.clone();
          position.y += 1.5;
          const portalApp = await rootScene.appManager.addAppAsync({
            type: 'application/portal',
            position,
            quaternion,
            content: {
              portalContents: [
                {
                  type: 'application/zineskybox',
                  content: {
                    imgSrc,
                  },
                },
              ],
            },
          });
          _listenPortalApp(portalApp);
          console.log('add content portal 2');
        }
      };
      await _addPortals();
    };

    // XXX bind local player
    // const _bindLocalPlayerTarget = () => {
    //   const localPlayer = this.playersManager.getLocalPlayer();

    //   const recurse = () => {
    //     frame = requestAnimationFrame(recurse);

    //     const closestNpc = this.npcManager.getClosestNpcPlayer(localPlayer.position);
    //     if (closestNpc) {
    //       const headBonePosition = new THREE.Vector3()
    //         .setFromMatrixPosition(closestNpc.avatar.modelBoneOutputs.Head.matrixWorld);
    //       localPlayer.setTarget(headBonePosition);
    //     } else {
    //       localPlayer.setTarget(null);
    //     }
    //   };
    //   let frame = requestAnimationFrame(recurse);
    // };
    // _bindLocalPlayerTarget();

    // bind npcs
    const _bindNpcPlayerTarget = player => {
      const recurse = () => {
        frame = requestAnimationFrame(recurse);
        
        const localPlayer = this.playersManager.getLocalPlayer();
        const headBonePosition = new THREE.Vector3()
          .setFromMatrixPosition(localPlayer.avatar.modelBoneOutputs.Head.matrixWorld);
        player.setTarget(headBonePosition);
      };
      let frame = requestAnimationFrame(recurse);
    };
    const _bindNpcPlayerTargets = () => {
      const players = Array.from(this.npcManager.npcPlayers);

      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        _bindNpcPlayerTarget(player);
      }
      this.npcManager.addEventListener('npcadd', e => {
        const {
          player,
        } = e;
        _bindNpcPlayerTarget(player);
      });
    };
    _bindNpcPlayerTargets();

    {
      const hitMap = getHitMap();

      // console.log('hitMap', hitMap);
      // debugger;

      globalThis.addEventListener('keydown', e => {
        if (e.key === '7') {
          const {
            camera,
          } = this.engineRenderer;

          const _getIndex = (x, z) => {
            return x + z * raycastResolution;
          };

          const players = Array.from(this.npcManager.npcPlayers);
          // globalThis.players = players;
          // const physicsScene = physicsManager.getScene();

          const _getPathBetweenPoints = (hitMap, startX, startZ, endX, endZ) => {
            const matrix = [] ;
            for (let z = 0; z < raycastResolution; z++) {
              const row = [];
              for (let x = 0; x < raycastResolution; x++) {
                const index = _getIndex(x, z);
                const hit = hitMap.hit[index];
                row.push(hit ? 0 : 1);
              }
              matrix.push(row);
            }

            const grid = new PF.Grid(matrix);
            const finder = new PF.AStarFinder({
              allowDiagonal: true,
              heuristic(dx, dy, node, neighbor) {
                const aHit = hitMap.hit[_getIndex(node.x, node.y)];
                const bHit = hitMap.hit[_getIndex(neighbor.x, neighbor.y)];

                if (aHit && bHit) {
                  const aCoord = hitMap.coords[_getIndex(node.x, node.y)];
                  const bCoord = hitMap.coords[_getIndex(neighbor.x, neighbor.y)];

                  const aY = aCoord.y;
                  const bY = bCoord.y;

                  const heightDelta = bY - aY;
                  const maxWalkHeight = 0.3;
                  if (heightDelta < maxWalkHeight) {
                    return aCoord.distanceTo(bCoord);
                  } else {
                    return Infinity;
                  }
                } else {
                  return Infinity;
                }
              },
            });

            // const startX = Math.floor(raycastResolution / 2);
            // const startZ = Math.floor(raycastResolution / 2) - 1;

            // const endX = Math.floor(raycastResolution / 2);
            // const endZ = Math.floor(raycastResolution / 2) + 1;

            const path = finder.findPath(startX, startZ, endX, endZ, grid);
            // console.log('got path', path);

            let totalDistance = 0;
            for (let i = 0; i < path.length - 1; i++) {
              const node = path[i];
              const [x, z] = node;
              const index = _getIndex(x, z);
              const coord = hitMap.coords[index];
              if (coord) {
                const nextNode = path[i + 1];
                const [nextX, nextZ] = nextNode;
                const nextIndex = _getIndex(nextX, nextZ);
                const nextCoord = hitMap.coords[nextIndex];
                if (nextCoord) {
                  totalDistance += coord.distanceTo(nextCoord);
                } else {
                  totalDistance += Infinity;
                }
              } else {
                totalDistance += Infinity;
              }
            }
            // console.log('got total distance', totalDistance);

            return path;
          };

          //

          const physicsScene = physicsManager.getScene();
          const hit = physicsScene.raycast(camera.position, camera.quaternion);

          const lines = players.map(player => {
            if (hit) {
              const start = player.position;
              const end = new THREE.Vector3().fromArray(hit.point);
  
              // get the position of the player in the hitMap matrix, which is (raycastResolution x raycastResolution)
              const startX = Math.floor((start.x - boundingBox.min.x) / size.x * raycastResolution);
              const startZ = Math.floor((start.z - boundingBox.min.z) / size.z * raycastResolution);
              const endX = Math.floor((end.x - boundingBox.min.x) / size.x * raycastResolution);
              const endZ = Math.floor((end.z - boundingBox.min.z) / size.z * raycastResolution);
              // console.log('get path 1', {
              //   startX, startZ, endX, endZ,
              // });
              const path = _getPathBetweenPoints(hitMap, startX, startZ, endX, endZ);
              // console.log('get path 2', path, {startX, startZ, endX, endZ, start, end, boundingBox}, [
              //   start.x - boundingBox.min.x,
              //   start.z - boundingBox.min.z,
              //   end.x - boundingBox.min.x,
              //   end.z - boundingBox.min.z,
              // ]);
              const pathPoints = path.map(p => {
                const x = boundingBox.min.x + p[0] / raycastResolution * size.x;
                const z = boundingBox.min.z + p[1] / raycastResolution * size.z;
                const y = hitMap.coords[_getIndex(p[0], p[1])].y + 0.1;
                // return new THREE.Vector3(x, y, z);
                return [
                  x,
                  y,
                  z,
                ];
              });
              return pathPoints;
            } else {
              return null;
            }
          }).filter(line => line);

          // make path meshes
          lines.forEach(line => {
            const pathMesh = makePathMesh(line);
            this.add(pathMesh);
          });

          //

          (async () => {
            console.log('get path app 1', lines);
            const rootRealm = this.realmManager.getRootRealm();
            const pathApp = await rootRealm.appManager.addAppAsync({
              contentId: '/public/core-modules/path/',
              components: [
                {
                  key: 'lines',
                  value: lines,
                },
              ],
            });
            console.log('get path app 2', {pathApp});
          })();
        }
      });
      
      const hitMesh = makeHitMesh(hitMap);
      // this.add(hitMesh);
      hitMesh.updateMatrixWorld();
      
      (async () => {
        console.log('add content 1', hitMap);
        await addContent(hitMap);
        console.log('add content 2');
      })();
    }
  }
  stopStoryMode() {
    console.warn('not implemented');
    debugger;
  }
}