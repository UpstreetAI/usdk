import * as THREE from 'three';
// import {AvatarManager} from '../avatars/avatar-manager.js';
// import Avatar from '../avatars/avatars.js';

import {
  getObjectUrl,
} from '../../app-runtime/import-manager.js';

// const q180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
// const localMatrix = new THREE.Matrix4();

const _forAllMeshes = (o, fn) => {
  o.traverse(o => {
    o.isMesh && fn(o);
  });
};
const _unfrustumCull = o => {
  o.frustumCulled = false;
};
const _enableShadows = o => {
  o.castShadow = true;
  o.receiveShadow = true;
};

//

/* const cloneCachedAsset = (o) => {
  const o2 = {
    ...o,
  };

  o2.scene = o.scene.clone();
  o2.scenes = o.scenes.map(scene => {
    if (scene === o.scene) {
      return o2.scene;
    } else {
      return scene.clone();
    }
  });

  // reference nodes
  const nodes = [];
  const nodes2 = [];
  o.scene.traverse(o => {
    nodes.push(o);
  });
  o2.scene.traverse(o => {
    nodes2.push(o);
  });
  const nodeMap = new Map();
  for (let i = 0; i < nodes.length; i++) {
    nodeMap.set(nodes[i], nodes2[i]);
  }
  const seenSet = new Set();
  const traverseCopy = o => {
    for (const k in o) {
      const v = o[k];
      if (!seenSet.has(v)) {
        seenSet.add(v);

        const mappedNode = nodeMap.get(v);
        if (mappedNode !== undefined) {
          o[k] = mappedNode;
        } else if (v && typeof v === 'object') {
          traverseCopy(v);
        }
      }
    }
  };
  for (const key in o2) {
    if (!['scene', 'scenes'].includes(key)) {
      const v = o2[key];
      if (v && typeof v === 'object') {
        traverseCopy(v);
      }
    }
  }
  return o2;
}; */

//

export default srcUrl => ctx => {
  // const app = useApp();
  // const camera = useCamera();
  // const physics = usePhysics();
  // console.log('got context', ctx);
  const {
    useApp,
    // useFrame,
    useActivate,
    // useCleanup,
    // useCamera,
    // usePhysics,
    // useExport,
    useEngine,
    useFrame,
    useLoaders,
    // useAvatarManager,
    // useTempManager,
    usePhysics,
    usePhysicsTracker,
    useAssetCache,
    // useLoreManager,
    useCleanup,
  } = ctx;
  // const THREE = ctx.useTHREE();
  const app = useApp();
  // const camera = useCamera();
  // const physics = usePhysics();
  const engine = useEngine();
  const physicsScene = usePhysics();
  const physicsTracker = usePhysicsTracker();
  // const assetCache = useAssetCache();
  // const loreManager = useLoreManager();
  // const {createFullGltfLoader} = useLoaders();
  const {gltfLoader} = useLoaders();
  // const avatarManager = useAvatarManager();
  // const tmpManager = useTempManager();

  app.appType = 'vrm';
  app.name = srcUrl.match(/([^\/]*)$/)[1];
  app.description = 'An avatar';

  // const quality = app.getComponent('quality') ?? undefined;

  // let avatarRenderer = null;
  // let physicsIds = [];
  // let frameCb = null;

  const loadModel = async (srcUrl) => {
    const cleanups = [];

    // const gltfLoader = createFullGltfLoader();

    // const arrayBuffer = await _fetchArrayBuffer(srcUrl);
    const vrm = await new Promise((accept, reject) => {
      // const cachedAsset = assetCache.getAsset(srcUrl);
      // if (cachedAsset) {
      //   const {
      //     arrayBuffer,
      //   } = cachedAsset;
      //   gltfLoader.parse(arrayBuffer, srcUrl, accept, reject);
      // } else {
        gltfLoader.load(srcUrl, accept, function onProgress() {}, reject);
      // }
    });
    const _disposeMaterial = m => {
      m.dispose();
      for (const uniformName in m.uniforms) {
        const uniform = m.uniforms[uniformName];
        if (uniform.value?.isTexture && uniform.value?.source?.data instanceof ImageBitmap) {
          uniform.value.dispose();
          uniform.value.source.data.close();
        } else if (Array.isArray(uniform.value)) {
          for (const v of uniform.value) {
            if (v?.isTexture && v?.source?.data instanceof ImageBitmap) {
              v.dispose();
              v.data.source.close();
            }
          }
        }
      }
    };
    const _dispose = () => {
      for (const scene of vrm.scenes) {
        scene.traverse(o => {
          if (o.isMesh) {
            o.geometry.dispose();
            if (Array.isArray(o.material)) {
              for (const m of o.material) {
                _disposeMaterial(m);
              }
            } else {
              _disposeMaterial(o.material);
            }
          }
        });
      }
    };
    if (app.live) {
      cleanups.push(() => {
        _dispose();
      });
    } else {
      _dispose();
      return;
    }

    return {
      vrm,
      cleanups,
    };
  };
  const loadSrc = async (srcUrl) => {
    // clean up existing model
    for (const fn of modelCleanupFns) {
      fn();
    }
    modelCleanupFns = [];

    // load model
    const {
      vrm,
      cleanups: _modelCleanupFns,
    } = await loadModel(srcUrl);

    // const avatarQuality = AvatarManager.makeQuality(gltf);
    // // avatarQuality = avatarManager.makeQuality({
    // //   arrayBuffer,
    // //   srcUrl,
    // //   camera,
    // //   quality,
    // // });
    // app.avatarQuality = avatarQuality;
    // // await avatarRenderer.waitForLoad();
    _forAllMeshes(vrm.scene, m => {
      _unfrustumCull(m);
      _enableShadows(m);
    });

    // add vrm
    {
      app.add(vrm.scene);
      vrm.scene.updateMatrixWorld();
      // avatarQuality.scene.updateMatrixWorld();

      _modelCleanupFns.push(() => {
        vrm.scene.parent.remove(vrm.scene);
      });
    }

    /* Object.defineProperty(app, 'avatarQuality', {
      get() {
        debugger;
        return avatarQuality;
      },
      set(avatarQuality) {
        debugger;
      },
    }); */

    // add physics
    {
      const _addPhysics = () => {
        // const {height, width} = app.avatarRenderer.getAvatarSize();
        const width = 0.3;
        const height = 1.6 - width;
        // const widthPadding = 0.5; // Padding around the avatar since the base width is computed from shoulder distance

        const capsuleRadius = width;
        const capsuleHalfHeight = height / 2;

        // const halfAvatarCapsuleHeight = (height + width) / 2; // (full world height of the capsule) / 2

        // localMatrix.compose(
        //   localVector.set(0, halfAvatarCapsuleHeight, 0), // start position
        //   localQuaternion.setFromAxisAngle(localVector2.set(0, 0, 1), Math.PI / 2), // rotate 90 degrees 
        //   localVector2.set(capsuleRadius, halfAvatarCapsuleHeight, capsuleRadius)
        // )
        //   .premultiply(app.matrixWorld)
        //   .decompose(localVector, localQuaternion, localVector2);

        vrm.scene.matrixWorld.decompose(
          localVector,
          localQuaternion,
          localVector2,
        );
        const position = localVector;
        position.y += capsuleHalfHeight;
        const quaternion = localQuaternion.setFromAxisAngle(localVector2.set(0, 0, 1), Math.PI / 2);
        const physicsObject = physicsScene.addCapsuleGeometry(
          // localVector,
          // localQuaternion,
          position,
          quaternion,
          capsuleRadius,
          capsuleHalfHeight,
          false
        );

        // console.log('set app name', physicsObject);
        physicsObject.name = app.name;
        physicsObject.description = app.description;
        // physicsObjects.push(physicsObject);
        
        //

        physicsTracker.addAppPhysicsObject(app, physicsObject);
        
        //

        // const k = app.instanceId + ':' + (physicsObject.physicsId + '').padStart(5, '0');
        // const actor = loreManager.createActor({
        //   id: app.instanceId,
        //   type: 'object',
        //   spec: {
        //     name: physicsObject.name,
        //     description: physicsObject.description,
        //   },
        //   object: app,
        // });
        // loreManager.addActor(actor);

        //

        _modelCleanupFns.push(() => {
          physicsScene.removeGeometry(physicsObject);
          physicsTracker.removeAppPhysicsObject(app, physicsObject);

          // loreManager.removeActor(actor);
        });
      };
      app.getComponent('physics') && _addPhysics();

      // we don't want to have per-frame bone updates for unworn avatars
      const _disableSkeletonMatrixUpdates = () => {
        vrm.scene.traverse(o => {
          if (o.isBone) {
            o.matrixAutoUpdate = false;
          }
        });
      };
      _disableSkeletonMatrixUpdates();
    }

    // frameCb = ({timestamp, timeDiff}) => {
    //   if (!avatarRenderer.isControlled) {
    //     avatarRenderer.scene.updateMatrixWorld();
    //     avatarRenderer.update(timestamp, timeDiff);
    //   }
    // };

    // latch
    app.vrm = vrm;
    modelCleanupFns = _modelCleanupFns;
  };
  let modelCleanupFns = [];
  useCleanup(() => {
    for (const fn of modelCleanupFns) {
      fn();
    }
  });

  ctx.waitUntil((async () => {
    await loadSrc(srcUrl);

    app.addEventListener('contentupdate', async e => {
      const newSrcUrl = getObjectUrl(app.spec);
      await loadSrc(newSrcUrl);
    });
  })());

  useFrame(() => {
    app.vrm && app.vrm.scene.updateMatrixWorld();
  });

  // useFrame((e) => {
  //   frameCb && frameCb(e);
  // });

  // controlled tracking
  /* const _setPhysicsEnabled = enabled => {
    if (enabled) {
      for (const physicsId of physicsIds) {
        physics.disableGeometry(physicsId);
        physics.disableGeometryQueries(physicsId);
      }
    } else {
      for (const physicsId of physicsIds) {
        physics.enableGeometry(physicsId);
        physics.enableGeometryQueries(physicsId);
      }
    }
  }; */
  /* const _setControlled = controlled => {
    avatarRenderer && avatarRenderer.setControlled(controlled);
    _setPhysicsEnabled(controlled);
  };
  _setControlled(!!app.getComponent('controlled'));
  app.addEventListener('componentupdate', e => {
    const {key, value} = e;
    if (key === 'controlled') {
      _setControlled(value);
    }
  }); */

  // cleanup
  /* useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
    physicsIds.length = 0;
  }); */

  /* useExport(async (opts) => {
    // console.log('use export', JSON.stringify(opts));
    const {mimeType} = opts;
    if (mimeType === 'image/png+icon') {
      // console.log('yes mime type', JSON.stringify({mimeType}));
      const avatarIconer = useAvatarIconer();
      const {getDefaultCanvas} = avatarIconer;
      
      const canvas = await getDefaultCanvas(srcUrl, 300, 300);
      let blob;
      try {
        blob = await new Promise((accept, reject) => {
          canvas.toBlob(accept, 'image/png');
        });
      } catch(err) {
        console.warn(err);
      }
      return blob;
    } else {
      return null;
    }
  }); */

  // handle wearing
  useActivate(async () => {
    const {
      playersManager,
    } = engine;
    const localPlayer = playersManager.getLocalPlayer();
    localPlayer.setAvatarApp(app);
  });

  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'vrm';
// export const components = ${this.components};