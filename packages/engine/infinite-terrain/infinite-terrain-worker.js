import Module from '../../../public/terrain.js';
import {
  ScratchStack,
} from '../geometry-util.js';

const infiniteTerrainWorker = {};
infiniteTerrainWorker.waitForLoad = Module.waitForLoad;

infiniteTerrainWorker._getTerrain = (scratchStack, length) => {
  Module._getTerrain(scratchStack, length);
};

let loaded = false;
let scratchStack = null;

const modulePromise = (async () => {
  await infiniteTerrainWorker.waitForLoad();
  loaded = true;
  const scratchStackSize = 8 * 1024 * 1024;
  // console.log('Module', Module);
  scratchStack = new ScratchStack(Module, scratchStackSize);
})();
const waitForModule = () => modulePromise;


function hashCode(str) {
  let hash = 0;
  if (str.length == 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    let char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

onmessage = async function(event) {
  await waitForModule();
  if (loaded) {
    const id = event.data.id;
    const minSize = event.data.minSize;
    const size = event.data.size;
    const baseX = event.data.x;
    const baseZ = event.data.z;
    const seed = hashCode(event.data.seed);
    const subdivisions = event.data.subdivisions;
    const lacunarity = event.data.lacunarity;
    const persistence = event.data.persistence;
    const iterations = event.data.iterations;
    const baseFrequency = event.data.baseFrequency;
    const baseAmplitude = event.data.baseAmplitude;
    const power = event.data.power;
    const elevationOffset = event.data.elevationOffset;
    const iterationsOffsets = event.data.iterationsOffsets;

    const maxIterations = event.data.maxIterations;

    const bounding = event.data.bounding;
    const xMin = bounding.xMin;
    const xMax = bounding.xMax;
    const zMin = bounding.zMin;
    const zMax = bounding.zMax;
    let inputIndex = 0;
    scratchStack.f32[inputIndex++] = minSize;
    scratchStack.f32[inputIndex++] = size;
    scratchStack.f32[inputIndex++] = baseX;
    scratchStack.f32[inputIndex++] = baseZ;
    scratchStack.f32[inputIndex++] = seed;
    scratchStack.f32[inputIndex++] = subdivisions;
    scratchStack.f32[inputIndex++] = lacunarity;
    scratchStack.f32[inputIndex++] = persistence;
    scratchStack.f32[inputIndex++] = iterations;
    scratchStack.f32[inputIndex++] = baseFrequency;
    scratchStack.f32[inputIndex++] = baseAmplitude;
    scratchStack.f32[inputIndex++] = power;
    scratchStack.f32[inputIndex++] = elevationOffset;
    scratchStack.f32[inputIndex++] = maxIterations;

    scratchStack.f32[inputIndex++] = xMin;
    scratchStack.f32[inputIndex++] = xMax;
    scratchStack.f32[inputIndex++] = zMin;
    scratchStack.f32[inputIndex++] = zMax;

    
    let iterationsOffsetsIndex = 0;
    const maxInputIndex = inputIndex + maxIterations * 2;
    for (; inputIndex < maxInputIndex;) {
      scratchStack.f32[inputIndex++] = iterationsOffsets[iterationsOffsetsIndex][0];
      scratchStack.f32[inputIndex++] = iterationsOffsets[iterationsOffsetsIndex][1];
      iterationsOffsetsIndex ++;
    }

    infiniteTerrainWorker._getTerrain(
      scratchStack.ptr,
    )

    let currentIndexOfResult = 0;
    const getResultArray = (array, size) => {
      array.set(scratchStack.f32.subarray(currentIndexOfResult, currentIndexOfResult + size), 0);
      currentIndexOfResult = currentIndexOfResult + size;
    }

    const segments = subdivisions + 1;
    const skirtCount = subdivisions * 4 + 4;

    const elevationsSize = segments * segments;
    const elevationsArray = new Float32Array(elevationsSize);
    getResultArray(elevationsArray, elevationsSize);
    
    const positionsSize = segments * segments * 3 + skirtCount * 3;
    const positionsArray = new Float32Array(positionsSize);
    getResultArray(positionsArray, positionsSize);
    
    const normalsSize = segments * segments * 3 + skirtCount * 3;
    const normalsArray = new Float32Array(normalsSize);
    getResultArray(normalsArray, normalsSize);
    
    const indicesNumber = subdivisions * subdivisions;
    const indicesSize = indicesNumber * 6 + subdivisions * 4 * 6 * 4;
    const indicesArray = new Uint32Array(indicesSize);
    getResultArray(indicesArray, indicesSize);

    const textureSize = segments * segments * 4;
    const textureArray = new Float32Array(textureSize);
    getResultArray(textureArray, textureSize);
    
    const uvSize = segments * segments * 2 + skirtCount * 2;
    const uvArray = new Float32Array(uvSize);
    getResultArray(uvArray, uvSize);
    
    const biomeWeightSize = segments * segments * 4 + skirtCount * 4;
    const biomeWeightArray = new Float32Array(biomeWeightSize);
    getResultArray(biomeWeightArray, biomeWeightSize);
    
    const grassPositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const grassPositionsArray = new Float32Array(grassPositionsSize);
    getResultArray(grassPositionsArray, grassPositionsSize);
    
    const grassTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const grassTerrainSlopesArray = new Float32Array(grassTerrainSlopesSize);
    getResultArray(grassTerrainSlopesArray, grassTerrainSlopesSize);
    
    const flowerPositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const flowerPositionsArray = new Float32Array(flowerPositionsSize);
    getResultArray(flowerPositionsArray, flowerPositionsSize);
    
    const flowerTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const flowerTerrainSlopesArray = new Float32Array(flowerTerrainSlopesSize);
    getResultArray(flowerTerrainSlopesArray, flowerTerrainSlopesSize);
    
    const bushPositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const bushPositionsArray = new Float32Array(bushPositionsSize);
    getResultArray(bushPositionsArray, bushPositionsSize);
    
    const bushTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const bushTerrainSlopesArray = new Float32Array(bushTerrainSlopesSize);
    getResultArray(bushTerrainSlopesArray, bushTerrainSlopesSize);

    const reedPositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const reedPositionsArray = new Float32Array(reedPositionsSize);
    getResultArray(reedPositionsArray, reedPositionsSize);
    
    const reedTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const reedTerrainSlopesArray = new Float32Array(reedTerrainSlopesSize);
    getResultArray(reedTerrainSlopesArray, reedTerrainSlopesSize);
    
    const rockPositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const rockPositionsArray = new Float32Array(rockPositionsSize);
    getResultArray(rockPositionsArray, rockPositionsSize);
    
    const rockTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const rockTerrainSlopesArray = new Float32Array(rockTerrainSlopesSize);
    getResultArray(rockTerrainSlopesArray, rockTerrainSlopesSize);
    
    const rockInfosSize = scratchStack.f32[currentIndexOfResult ++];
    const rockInfosArray = new Float32Array(rockInfosSize);
    getResultArray(rockInfosArray, rockInfosSize);
    
    const treeOnePositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const treeOnePositionsArray = new Float32Array(treeOnePositionsSize);
    getResultArray(treeOnePositionsArray, treeOnePositionsSize);

    const treeOneTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const treeOneTerrainSlopesArray = new Float32Array(treeOneTerrainSlopesSize);
    getResultArray(treeOneTerrainSlopesArray, treeOneTerrainSlopesSize);

    const treeOneInfosSize = scratchStack.f32[currentIndexOfResult ++];
    const treeOneInfosArray = new Float32Array(treeOneInfosSize);
    getResultArray(treeOneInfosArray, treeOneInfosSize);

    const treeTwoPositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const treeTwoPositionsArray = new Float32Array(treeTwoPositionsSize);
    getResultArray(treeTwoPositionsArray, treeTwoPositionsSize);

    const treeTwoTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const treeTwoTerrainSlopesArray = new Float32Array(treeTwoTerrainSlopesSize);
    getResultArray(treeTwoTerrainSlopesArray, treeTwoTerrainSlopesSize);

    const treeTwoInfosSize = scratchStack.f32[currentIndexOfResult ++];
    const treeTwoInfosArray = new Float32Array(treeTwoInfosSize);
    getResultArray(treeTwoInfosArray, treeTwoInfosSize);

    const treeThreePositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const treeThreePositionsArray = new Float32Array(treeThreePositionsSize);
    getResultArray(treeThreePositionsArray, treeThreePositionsSize);
    
    const treeThreeTerrainSlopesSize = scratchStack.f32[currentIndexOfResult ++];
    const treeThreeTerrainSlopesArray = new Float32Array(treeThreeTerrainSlopesSize);
    getResultArray(treeThreeTerrainSlopesArray, treeThreeTerrainSlopesSize);

    const treeThreeInfosSize = scratchStack.f32[currentIndexOfResult ++];
    const treeThreeInfosArray = new Float32Array(treeThreeInfosSize);
    getResultArray(treeThreeInfosArray, treeThreeInfosSize);

    //

    const layer1PositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer1PositionsArray = new Float32Array(layer1PositionsSize);
    getResultArray(layer1PositionsArray, layer1PositionsSize);

    const layer1QuaternionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer1QuaternionsArray = new Float32Array(layer1QuaternionsSize);
    getResultArray(layer1QuaternionsArray, layer1QuaternionsSize);

    const layer1InfosSize = scratchStack.f32[currentIndexOfResult ++];
    const layer1InfosArray = new Float32Array(layer1InfosSize);
    getResultArray(layer1InfosArray, layer1InfosSize);

    const layer2PositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer2PositionsArray = new Float32Array(layer2PositionsSize);
    getResultArray(layer2PositionsArray, layer2PositionsSize);

    const layer2QuaternionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer2QuaternionsArray = new Float32Array(layer2QuaternionsSize);
    getResultArray(layer2QuaternionsArray, layer2QuaternionsSize);

    const layer2InfosSize = scratchStack.f32[currentIndexOfResult ++];
    const layer2InfosArray = new Float32Array(layer2InfosSize);
    getResultArray(layer2InfosArray, layer2InfosSize);

    const layer3PositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer3PositionsArray = new Float32Array(layer3PositionsSize);
    getResultArray(layer3PositionsArray, layer3PositionsSize);

    const layer3QuaternionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer3QuaternionsArray = new Float32Array(layer3QuaternionsSize);
    getResultArray(layer3QuaternionsArray, layer3QuaternionsSize);

    const layer3InfosSize = scratchStack.f32[currentIndexOfResult ++];
    const layer3InfosArray = new Float32Array(layer3InfosSize);
    getResultArray(layer3InfosArray, layer3InfosSize);

    const layer4PositionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer4PositionsArray = new Float32Array(layer4PositionsSize);
    getResultArray(layer4PositionsArray, layer4PositionsSize);

    const layer4QuaternionsSize = scratchStack.f32[currentIndexOfResult ++];
    const layer4QuaternionsArray = new Float32Array(layer4QuaternionsSize);
    getResultArray(layer4QuaternionsArray, layer4QuaternionsSize);

    const layer4InfosSize = scratchStack.f32[currentIndexOfResult ++];
    const layer4InfosArray = new Float32Array(layer4InfosSize);
    getResultArray(layer4InfosArray, layer4InfosSize);

    // console.log('got lengths', [
    //   layer1PositionsArray.length,
    //   layer2PositionsArray.length,
    //   layer3PositionsArray.length,
    //   layer4PositionsArray.length,
    // ]);

    // Post
    postMessage({
      id: id,

      elevations: elevationsArray,

      positions: positionsArray,
      normals: normalsArray,
      indices: indicesArray,
      texture: textureArray,
      uv: uvArray,
      biomeWeight: biomeWeightArray,

      grassPositions: grassPositionsArray,
      grassTerrainSlopes: grassTerrainSlopesArray,

      flowerPositions: flowerPositionsArray,
      flowerTerrainSlopes: flowerTerrainSlopesArray,

      bushPositions: bushPositionsArray,
      bushTerrainSlopes: bushTerrainSlopesArray,

      reedPositions: reedPositionsArray,
      reedTerrainSlopes: reedTerrainSlopesArray,

      rockPositions: rockPositionsArray,
      rockTerrainSlopes: rockTerrainSlopesArray,
      rockInfos: rockInfosArray,

      treeOnePositions: treeOnePositionsArray,
      treeOneTerrainSlopes: treeOneTerrainSlopesArray,
      treeOneInfos: treeOneInfosArray,

      treeTwoPositions: treeTwoPositionsArray,
      treeTwoTerrainSlopes: treeTwoTerrainSlopesArray,
      treeTwoInfos: treeTwoInfosArray,

      treeThreePositions: treeThreePositionsArray,
      treeThreeTerrainSlopes: treeThreeTerrainSlopesArray,
      treeThreeInfos: treeThreeInfosArray,

      layer1Positions: layer1PositionsArray,
      layer1Quaternions: layer1QuaternionsArray,
      layer1Infos: layer1InfosArray,

      layer2Positions: layer2PositionsArray,
      layer2Quaternions: layer2QuaternionsArray,
      layer2Infos: layer2InfosArray,

      layer3Positions: layer3PositionsArray,
      layer3Quaternions: layer3QuaternionsArray,
      layer3Infos: layer3InfosArray,

      layer4Positions: layer4PositionsArray,
      layer4Quaternions: layer4QuaternionsArray,
      layer4Infos: layer4InfosArray,
    })
  }
}