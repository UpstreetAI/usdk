import * as THREE from 'three';
import {
  StreetLineGeometry,
} from './StreetGeometry.js';
import PF from '../PathFinding.js/pathfinding-browser.js';

import physicsManager from './physics/physics-manager.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localMatrix = new THREE.Matrix4();

//

export const getFuzzyTargetObject = ({
  localPlayer,
  target,
  playersManager,
  loreManager,
  npcManager,
  physicsTracker,
}) => {
  // find the target in the lore
  const targetPlayerStrings = loreManager.searchPlayers(target);
  const targetItemStrings = loreManager.searchItems(target);
  const targetPlayers = targetPlayerStrings.map(targetPlayerString => {
    const match = targetPlayerString.item.match(/^(.+?)\n/);
    const playerId = match ? match[1] : '';
    const player = playersManager.getPlayer(playerId) ??
      npcManager.getNpcByPlayerId(playerId);
    return player;
  });
  const targetItems = targetItemStrings.map(targetItemString => {
    const match = targetItemString.item.match(/^(.+?):(.+?)\n/);
    // const appId = match ? match[1] : '';
    const physicsIdString = match ? match[2] : '';
    const physicsId = parseInt(physicsIdString, 10);
    const result = physicsTracker.getPairByPhysicsId(physicsId);
    const [
      app,
      physicsObject,
    ] = result;
    return physicsObject;
  });

  let objects = targetPlayers.concat(targetItems);
  objects = objects
    .map(o => {
      const distance = localVector.setFromMatrixPosition(o.matrixWorld)
        .distanceTo(localPlayer.position);
      return {
        distance,
        object: o,
      };
    })
    .sort((a, b) => {
      return a.distance - b.distance;
    })
    .map(o => o.object);
  const closestObject = objects[0];
  return closestObject;
};

export const raycastResolution = 128;
export const boundingBoxSize = 100;
export const raycastHeight = 10;
export const getHitMapIndex = (x, z) => x + z * raycastResolution;
export const getHitMap = ({
  localPlayer,
  
  playersManager,
  npcManager,

  physicsTracker,
  physicsObjects,
}) => {
  const position = localPlayer.position;
  const range = new THREE.Vector3().setScalar(boundingBoxSize);
  const boundingBox = new THREE.Box3()
    .setFromCenterAndSize(
      position,
      range,
    );
  const size = boundingBox.getSize(new THREE.Vector3());
  const downQuaternion = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    -Math.PI / 2
  );

  const ps = [];
  const qs = [];
  for (let h = 0; h < raycastResolution; h++) {
    for (let w = 0; w < raycastResolution; w++) {
      const p = new THREE.Vector3()
        .copy(boundingBox.min)
        .add(new THREE.Vector3(
          w / raycastResolution * size.x,
          size.y / 2 + raycastHeight,
          h / raycastResolution * size.z
        ));
      const q = downQuaternion;
      ps.push(p);
      qs.push(q);
    }
  }

  //

  const physicsScene = physicsManager.getScene();

  // disable player physics queries
  const restoreGeometryQueries = (() => {
    if (playersManager && npcManager) {
      const playersArray = playersManager.getAllPlayers();
      const npcPlayersArray = Array.from(npcManager.npcPlayers);
      const allPlayersArray = playersArray.concat(npcPlayersArray);
      const allCharacterPhysicsArray = allPlayersArray.map(p => {
        return p.characterPhysics.characterController;
      }).filter(o => !!o);

      for (const physicsObject of allCharacterPhysicsArray) {
        physicsScene.disableGeometryQueries(physicsObject);
      }
  
      return () => {
        for (const physicsObject of allCharacterPhysicsArray) {
          physicsScene.enableGeometryQueries(physicsObject);
        }
      };
    } else if (physicsTracker && physicsObjects) {
      const allObjects = physicsTracker.getPhysicsObjects();

      for (const physicsObject of allObjects) {
        if (!physicsObjects.includes(physicsObject)) {
          physicsScene.disableGeometryQueries(physicsObject);
        }
      }

      return () => {
        for (const physicsObject of allObjects) {
          if (!physicsObjects.includes(physicsObject)) {
            physicsScene.enableGeometryQueries(physicsObject);
          }
        }
      };
    } else {
      throw new Error('invalid arguments');
    }
  })();
  const hitMap = physicsScene.raycastArray(ps, qs, ps.length);
  restoreGeometryQueries();
  // console.log('hit length', ps.length, hitMap.hit.length)

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
  hitMap.boundingBox = boundingBox;

  return hitMap;
};
export const sampleHitMapCoord = (coords, x, z, target) => {
  // x and z are floats
  let ix = Math.floor(x);
  ix = Math.min(Math.max(ix, 0), raycastResolution - 1);
  let iz = Math.floor(z);
  iz = Math.min(Math.max(iz, 0), raycastResolution - 1);

  // bilinear interpolation. make sure to account for out of bounds.
  const i1 = iz * raycastResolution + ix;
  const i2 = iz * raycastResolution + Math.min(ix + 1, raycastResolution - 1);
  const i3 = Math.min(iz + 1, raycastResolution - 1) * raycastResolution + ix;
  const i4 = Math.min(iz + 1, raycastResolution - 1) * raycastResolution + Math.min(ix + 1, raycastResolution - 1);
  
  const c1 = coords[i1];
  const c2 = coords[i2];
  const c3 = coords[i3];
  const c4 = coords[i4];

  const fx = x - ix;
  const fz = z - iz;

  const c12 = localVector.copy(c1).lerp(c2, fx);
  const c34 = localVector2.copy(c3).lerp(c4, fx);
  const c = target.lerpVectors(c12, c34, fz);
  return c;
};

export const makeHitMesh = hitMap => {
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

const _getPathBetweenPoints = (hitMap, startX, startZ, endX, endZ) => {
  const matrix = [];
  for (let z = 0; z < raycastResolution; z++) {
    const row = [];
    for (let x = 0; x < raycastResolution; x++) {
      const index = getHitMapIndex(x, z);
      const hit = hitMap.hit[index];
      row.push(hit ? 0 : 1);
    }
    matrix.push(row);
  }

  const grid = new PF.Grid(matrix);
  const finder = new PF.AStarFinder({
    allowDiagonal: true,
    heuristic(dx, dy, node, neighbor) {
      const aHit = hitMap.hit[getHitMapIndex(node.x, node.y)];
      const bHit = hitMap.hit[getHitMapIndex(neighbor.x, neighbor.y)];

      if (aHit && bHit) {
        const aCoord = hitMap.coords[getHitMapIndex(node.x, node.y)];
        const bCoord = hitMap.coords[getHitMapIndex(neighbor.x, neighbor.y)];

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

  const path = finder.findPath(startX, startZ, endX, endZ, grid);

  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const node = path[i];
    const [x, z] = node;
    const index = getHitMapIndex(x, z);
    const coord = hitMap.coords[index];
    if (coord) {
      const nextNode = path[i + 1];
      const [nextX, nextZ] = nextNode;
      const nextIndex = getHitMapIndex(nextX, nextZ);
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

  return path;
};
export const getLine = (hitMap, start, end) => {
  // if the start or end is outside of the hitMap bounding box
  const {boundingBox} = hitMap;
  if (!boundingBox.containsPoint(start) || !boundingBox.containsPoint(end)) {
    console.log('elide');
    return [];
  }

  const size = boundingBox.getSize(new THREE.Vector3());

  // get the position of the player in the hitMap matrix, which is (raycastResolution x raycastResolution)
  const startX = Math.floor((start.x - boundingBox.min.x) / size.x * raycastResolution);
  const startZ = Math.floor((start.z - boundingBox.min.z) / size.z * raycastResolution);
  const endX = Math.floor((end.x - boundingBox.min.x) / size.x * raycastResolution);
  const endZ = Math.floor((end.z - boundingBox.min.z) / size.z * raycastResolution);
  const path = _getPathBetweenPoints(hitMap, startX, startZ, endX, endZ);
  const pathPoints = path.map(p => {
    const x = boundingBox.min.x + p[0] / raycastResolution * size.x;
    const z = boundingBox.min.z + p[1] / raycastResolution * size.z;
    const y = hitMap.coords[getHitMapIndex(p[0], p[1])].y + 0.1;
    return new THREE.Vector3(
      x,
      y,
      z,
    );
  });
  return pathPoints;
};

export const makePathLineGeometry = points => {
  if (points.length < 2) {
    const geometry = new THREE.BufferGeometry();
    return geometry;
  } else {
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new StreetLineGeometry(
      curve, // path
      points.length, // tubularSegments
      0.05, // radiusX
      0, // radiusY
    );
    return geometry;
  }
};