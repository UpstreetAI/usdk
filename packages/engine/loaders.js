/*
this file contains common file format loaders which are re-used throughout the engine and userspace apps.
*/

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';
import {KTX2Loader} from 'three/examples/jsm/loaders/KTX2Loader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader.js';
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';
// import {getRenderer} from './renderer.js';
import {ShadertoyLoader} from './shadertoy.js';
import {GIFLoader} from './GIFLoader.js';
import {VOXLoader} from './VOXLoader.js';
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader.js';
import {memoize} from './util.js';
import {VRMLoaderPlugin} from '@pixiv/three-vrm';

class MozLightMapExtension {
  constructor(parser) {
    this.parser = parser;
    this.name = 'MOZ_lightmap';
  }

  // @TODO: Ideally we should use extendMaterialParams hook.
  //        But the current official glTF loader doesn't fire extendMaterialParams
  //        hook for unlit and specular-glossiness materials.
  //        So using loadMaterial hook as workaround so far.
  //        Cons is loadMaterial hook is fired as _invokeOne so
  //        if other plugins defining loadMaterial is registered
  //        there is a chance that this light map extension handler isn't called.
  //        The glTF loader should be updated to remove the limitation.
  loadMaterial(materialIndex) {
    const parser = this.parser;
    const json = parser.json;
    const materialDef = json.materials[materialIndex];

    if (!materialDef.extensions || !materialDef.extensions[this.name]) {
      return null;
    }

    const extensionDef = materialDef.extensions[this.name];

    const pending = [];

    pending.push(parser.loadMaterial(materialIndex));
    pending.push(parser.getDependency('texture', extensionDef.index));

    return Promise.all(pending).then(results => {
      const material = results[0];
      const lightMap = results[1];
      material.lightMap = lightMap;
      material.lightMapIntensity = extensionDef.intensity !== undefined ? extensionDef.intensity : 1;
      return material;
    });
  }
}

const _dracoLoader = memoize(() => {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/three/draco/');
  return dracoLoader;
});
const _textureLoader = memoize(() => {
  const textureLoader = new THREE.TextureLoader();
  return textureLoader;
});
const _ktx2Loader = memoize(() => {
  const ktx2Loader = new KTX2Loader();
  ktx2Loader.load = (_load => function load() {
    if (!this.workerConfig) {
      // const renderer = getRenderer();
      const renderer = new THREE.WebGLRenderer({
        canvas: new OffscreenCanvas(1, 1),
      });
      this.detectSupport(renderer);
    }
    return _load.apply(this, arguments);
  })(ktx2Loader.load);
  ktx2Loader.setTranscoderPath('/three/basis/');
  return ktx2Loader;
});
const _meshoptDecoder = memoize(() => {
  return MeshoptDecoder;
});
const createGltfLoader = (manager) => {
  const gltfLoader = new GLTFLoader(manager);
  {
    const dracoLoader = _dracoLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
  }
  {
    const ktx2Loader = _ktx2Loader();
    gltfLoader.setKTX2Loader(ktx2Loader);
  }
  {
    const meshoptDecoder = _meshoptDecoder();
    gltfLoader.setMeshoptDecoder(meshoptDecoder);
  }

  gltfLoader.register(parser => new MozLightMapExtension(parser));
  gltfLoader.register(parser => new VRMLoaderPlugin(parser));

  return gltfLoader;
};
const _gltfLoader = memoize(createGltfLoader);
const _fbxLoader = memoize(() => {
  const fbxLoader = new FBXLoader();
  return fbxLoader;
});
const _shadertoyLoader = memoize(() => new ShadertoyLoader());
const _gifLoader = memoize(() => new GIFLoader());
const _voxLoader = memoize(() => new VOXLoader({
  scale: 0.01,
}));
const _exrLoader = memoize(() => new EXRLoader());

const loaders = {
  get dracoLoader() {
    return _dracoLoader();
  },
  get textureLoader() {
    return _textureLoader();
  },
  get ktx2Loader() {
    return _ktx2Loader();
  },
  get meshoptDecoder() {
    return _meshoptDecoder();
  },
  get gltfLoader() {
    return _gltfLoader();
  },
  createFullGltfLoader() {
    const loadingManager = new THREE.LoadingManager();
    const gltfLoader = createGltfLoader(loadingManager);
    const {load} = gltfLoader;
    gltfLoader.load = function fullLoad(url, onLoad, onProgress, onError) {
      let result;
      loadingManager.onLoad = () => {
        if (result === undefined) {
          throw new Error('prematurely loaded ' + url);
        }
        onLoad(result);
      };
      load.call(gltfLoader, url, function onDone(o) {
        result = o;
      }, onProgress, onError);
    };
    return gltfLoader;
  },
  get fbxLoader() {
    return _fbxLoader();
  },
  get shadertoyLoader() {
    return _shadertoyLoader();
  },
  get gifLoader() {
    return _gifLoader();
  },
  get voxLoader() {
    return _voxLoader();
  },
  get exrLoader() {
    return _exrLoader();
  },
};
export default loaders;
