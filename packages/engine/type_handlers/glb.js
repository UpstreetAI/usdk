import * as THREE from 'three';
import React, {
  useState,
  useEffect,
} from 'react';
import reactHelpers from '../react-helpers.js';

import {
  getObjectUrl,
} from '../../app-runtime/import-manager.js';

//

const {
  div,
  span,
  label,
  input,
} = reactHelpers;
const meshComponentNames = [
  'receiveShadow',
  'castShadow',
];

//

export default srcUrl => ctx => {
  const {
    useApp,
    useEngine,
    useFrame,
    useActivate,
    useCleanup,
    // useExport,
    useLoaders,
    usePhysics,
    usePhysicsTracker,
    useAssetCache,
    useLoreManager,
    useComponentUi,
  } = ctx;

  const app = useApp();
  
  const {createFullGltfLoader, exrLoader} = useLoaders();
  // const renderer = useRenderer();
  const engine = useEngine();
  const {engineRenderer, playersManager} = engine;
  const {renderer} = engineRenderer;
  const physics = usePhysics();
  const physicsTracker = usePhysicsTracker();
  const assetCache = useAssetCache();
  const loreManager = useLoreManager();
  const localPlayer = playersManager.getLocalPlayer();

  app.appType = 'glb';
  app.name = srcUrl.match(/([^\/]*)$/)[1];
  app.description = '';

  const shadow = app.getComponent('shadow');

  for (const {key, value} of app.components) {
    app.setComponent(key, value);
  }
 
  app.glb = null;
  const animationMixers = [];
  const uvScrolls = [];

  const setMeshComponentEnabed = (scene, componentName, enabled) => {
    scene.traverse(o => {
      if (o.isMesh) {
        o[componentName] = enabled;
      }
    });
  };
  
  // glb state
  let animations;
  
  // sit state
  let sitSpec = null;

  const loadModel = async (srcUrl) => {
    let o;
    try {
      o = await new Promise((accept, reject) => {
        const gltfLoader = createFullGltfLoader();
        const cachedAsset = assetCache.getAsset(srcUrl);
        if (cachedAsset) {
          const {
            arrayBuffer,
          } = cachedAsset;
          gltfLoader.parse(arrayBuffer, srcUrl, accept, reject);
        } else {
          gltfLoader.load(srcUrl, accept, function onProgress() {}, reject);
        }
      });
    } catch(err) {
      console.warn(err);
    }

    const cleanups = [];

    const _disposeMaterial = m => {
      m.dispose();

      for (const uniformName in m.uniforms) {
        const uniform = m.uniforms[uniformName];
        if (uniform.value?.isTexture && uniform.value?.data instanceof ImageBitmap) {
          uniform.value.data.close();
        } else if (Array.isArray(uniform.value)) {
          for (const v of uniform.value) {
            if (v?.isTexture && v?.data instanceof ImageBitmap) {
              v.data.close();
            }
          }
        }
      }
    };
    const _dispose = () => {
      for (const scene of o.scenes) {
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
      cleanups.push(_dispose);
    } else {
      _dispose();
      return;
    }

    const {parser} = o;
    animations = o.animations;

    if (shadow) {
      o.scene.traverse(o => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
    }

    // components
    const envMapComponent = app.getComponent('envMap');
    
    const _addAntialiasing = aaLevel => {
      o.scene.traverse(o => {
        if (o.isMesh) {
          ['alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 'emissiveMap', 'envMap', 'lightMap', 'map', 'metalnessMap', 'normalMap', 'roughnessMap'].forEach(mapType => {
            if (o.material[mapType]) {
              o.material[mapType].anisotropy = aaLevel;
            }
          });
          /* if (o.material.transmission !== undefined) {
            o.material.transmission = 0;
            o.material.opacity = 0.25;
          } */
        }
      });
    };
    _addAntialiasing(16);
    
    const _loadHubsComponents = () => {
      const _loadAnimations = () => {
        const baseAnimationName = app.getComponent('animation') ?? '';
        if (baseAnimationName) {
          const idleAnimation = animations.find(a => a.name === baseAnimationName);
          const clips = idleAnimation ? [idleAnimation] : [animations[0]];
          for (const clip of clips) {
            const mixer = new THREE.AnimationMixer(o);
            
            const action = mixer.clipAction(clip);
            action.play();

            animationMixers.push(mixer);
          }
        }
      };
      if (!app.hasComponent('pet')) {
        _loadAnimations();
      }

      const _loadLightmaps = () => {
        const _loadLightmap = async (parser, materialIndex) => {
          const lightmapDef = parser.json.materials[materialIndex].extensions.MOZ_lightmap;
          const [material, lightMap] = await Promise.all([
            parser.getDependency('material', materialIndex),
            parser.getDependency('texture', lightmapDef.index)
          ]);
          material.lightMap = lightMap;
          material.lightMapIntensity = lightmapDef.intensity !== undefined ? lightmapDef.intensity : 1;
          material.needsUpdate = true;
          return lightMap;
        };
        if (parser.json.materials) {
          for (let i = 0; i < parser.json.materials.length; i++) {
            const materialNode = parser.json.materials[i];

            if (!materialNode.extensions) continue;

            if (materialNode.extensions.MOZ_lightmap) {
              _loadLightmap(parser, i);
            }
          }
        }
      };
      _loadLightmaps();
      
      const _loadUvScroll = () => {
        const textureToData = new Map();
        const registeredTextures = [];
        o.scene.traverse(o => {
          if (o.isMesh && o?.userData?.gltfExtensions?.MOZ_hubs_components?.['uv-scroll']) {
            const uvScrollSpec = o.userData.gltfExtensions.MOZ_hubs_components['uv-scroll'];
            const {increment, speed} = uvScrollSpec;
            
            const mesh = o; // this.el.getObject3D("mesh") || this.el.getObject3D("skinnedmesh");
            const {material} = mesh;
            if (material) {
              const spec = {
                data: {
                  increment,
                  speed,
                },
              };

              // We store mesh here instead of the material directly because we end up swapping out the material in injectCustomShaderChunks.
              // We need material in the first place because of MobileStandardMaterial
              const instance = { component: spec, mesh };

              spec.instance = instance;
              spec.map = material.map || material.emissiveMap;

              if (spec.map && !textureToData.has(spec.map)) {
                textureToData.set(spec.map, {
                  offset: new THREE.Vector2(),
                  instances: [instance]
                });
                registeredTextures.push(spec.map);
              } else if (!spec.map) {
                console.warn("Ignoring uv-scroll added to mesh with no scrollable texture.");
              } else {
                console.warn(
                  "Multiple uv-scroll instances added to objects sharing a texture, only the speed/increment from the first one will have any effect"
                );
                textureToData.get(spec.map).instances.push(instance);
              }
            }
            let lastTimestamp = Date.now();
            const update = now => {
              const dt = now - lastTimestamp;
              for (let i = 0; i < registeredTextures.length; i++) {
                const map = registeredTextures[i];
                const { offset, instances } = textureToData.get(map);
                const { component } = instances[0];

                offset.addScaledVector(component.data.speed, dt / 1000);

                offset.x = offset.x % 1.0;
                offset.y = offset.y % 1.0;

                const increment = component.data.increment;
                map.offset.x = increment.x ? offset.x - (offset.x % increment.x) : offset.x;
                map.offset.y = increment.y ? offset.y - (offset.y % increment.y) : offset.y;
              }
              lastTimestamp = now;
            };
            uvScrolls.push({
              update,
            });
          }
        });
      };
      _loadUvScroll();
    };
    _loadHubsComponents();

    // env map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader(); 

    const _loadExr = async path => {
      let t;
      try {
        t = await new Promise((accept, reject) => {
          exrLoader.load(path, accept, function onprogress() {}, reject);
        });
      } catch(err) {
        console.warn(err);
      }
      return t;
    };
    const _setupEnvMap = texture => {
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
      return exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
    };
    const _addEnvMap = (o, envMap) => {
      o.material.envMap = envMap;
      o.material.needsUpdate = true;
    };

    if (envMapComponent) {
      const envMapTexture = await Promise.resolve(await _loadExr(envMapComponent));
      app.envMap = _setupEnvMap(envMapTexture);
    }
    o.scene.traverse(o => {
      if (o.isMesh) {
        o.frustumCulled = false;
        o.castShadow = true;
        o.receiveShadow = true;
        if(app.envMap) {
          _addEnvMap(o, app.envMap);
        }
      }
    });

    // initialize mesh components
    meshComponentNames.forEach(componentName => {
      if (app.getComponent(componentName)) {
        setMeshComponentEnabed(o.scene, componentName, true);
      }
    });

    // bind mesh components
    meshComponentNames.forEach(componentName => {
      const componentsupdate = e => {
        const {keys} = e;
        if (keys.includes(componentName)) {
          const enabled = !!app.getComponent(componentName);
          setMeshComponentEnabed(o.scene, componentName, enabled);
        }
      };
      app.addEventListener('componentsupdate', componentsupdate);
      
      cleanups.push(() => {
        app.removeEventListener('componentsupdate', componentsupdate);
      });
    });

    return {
      glb: o,
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
      glb,
      cleanups: _modelCleanupFns,
    } = await loadModel(srcUrl);

    // add glb
    {
      app.add(glb.scene);
      glb.scene.updateMatrixWorld();

      _modelCleanupFns.push(() => {
        glb.scene.parent.remove(glb.scene);
      });
    }

    // add physics
    {
      let appHasPhysics = true;
      const hasPhysicsComponent = app.hasComponent('physics');
      if (hasPhysicsComponent) {
        const physicsComponent = app.getComponent('physics');
        appHasPhysics = physicsComponent;
      }
      if (appHasPhysics) {
        const physicsObject = physics.addGeometry(glb.scene);
        physicsObject.name = app.name;
        physicsObject.description = app.description;
        
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
        //   object: physicsObject,
        // });
        // loreManager.addActor(actor);

        //

        _modelCleanupFns.push(() => {
          physics.removeGeometry(physicsObject);
          physicsTracker.removeAppPhysicsObject(app, physicsObject);

          // loreManager.removeActor(actor);
        });
      }
    }

    // latch
    app.glb = glb;
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

  const _unwear = () => {
    if (sitSpec) {
      const sitAction = localPlayer.getAction('sit');
      if (sitAction) {
        localPlayer.removeAction('sit');
      }
    }
  };
  app.addEventListener('wearupdate', e => {
    if (e.wear) {
      if (app.glb) {
        // const {animations} = app.glb;

        sitSpec = app.getComponent('sit');
        if (sitSpec) {
          let rideMesh = null;
          app.glb.scene.traverse(o => {
            if (rideMesh === null && o.isSkinnedMesh) {
              rideMesh = o;
            }
          });

          const {instanceId} = app;
          const localPlayer = useLocalPlayer();

          const rideBone = sitSpec.sitBone ? rideMesh.skeleton.bones.find(bone => bone.name === sitSpec.sitBone) : null;
          const sitAction = {
            type: 'sit',
            time: 0,
            animation: sitSpec.subtype,
            controllingId: instanceId,
            controllingBone: rideBone,
          };
          localPlayer.setControlAction(sitAction);
        }
      }
    } else {
      _unwear();
    }
  });
  useCleanup(() => {
    _unwear();
  });

  useFrame((timestamp, timeDiff) => {
    const _updateAnimation = () => {
      const deltaSeconds = timeDiff / 1000;
      for (const mixer of animationMixers) {
        mixer.update(deltaSeconds);
        app.updateMatrixWorld();
      }
    };
    _updateAnimation();
    
    const _updateUvScroll = () => {
      for (const uvScroll of uvScrolls) {
        uvScroll.update(timestamp);
      }
    };
    _updateUvScroll();
  });

  /* useExport(async ({mimeType, args}) => {
    console.log('got mime type', JSON.stringify(mimeType), JSON.stringify(args));

    const width = 512;
    const height = 512;

    if (mimeType === 'image/png+360-video') {
      const {webmWriter} = useWriters();
      console.log('got webm writer', webmWriter);
      
      // video writer
      const videoWriter = new webmWriter({
        quality: 1,
        fileWriter: null,
        fd: null,
        frameDuration: null,
        frameRate: FPS,
      });

      console.log('video 1');

      // write canvas
      // const writeCanvas = document.createElement('canvas');
      // writeCanvas.width = width;
      // writeCanvas.height = height;
      // const writeCtx = writeCanvas.getContext('2d');
      const _pushFrame = () => {
        // draw
        // writeCtx.drawImage(renderer.domElement, 0, 0);
        videoWriter.addFrame(renderer.domElement);
      };

      console.log('video 2');

      // main canvas
      const localWidth = parseInt(args.width, 10) || width;
      const localHeight = parseInt(args.height, 10) || height;
      const canvas = document.createElement('canvas');
      canvas.width = localWidth;
      canvas.height = localHeight;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
      });
      renderer.autoClear = false;
      renderer.sortObjects = false;
      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.xr.enabled = true;
      
      const scene = new THREE.Scene();
      scene.autoUpdate = false;

      const ambientLight = new THREE.AmbientLight(0xffffff, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(0, 1, 2);
      directionalLight.updateMatrixWorld();
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
      scene.add(directionalLight);
      
      scene.add(app);

      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      camera.position.set(5, 1.6, 5);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      console.log('video 3');

      const numAngles = 32;
      for (let i = 0; i < numAngles; i++) {
        console.log('render angle', i, numAngles);
        const angle = i * Math.PI * 2 / numAngles;
        const x = Math.cos(angle);
        const z = Math.sin(angle);
        camera.position.set(x * 5, 1.6, z * 5);
        camera.lookAt(0, 0, 0);
        camera.updateMatrixWorld();
        renderer.clear();
        renderer.render(scene, camera);
        _pushFrame();
      }

      console.log('video 4');

      const blob = await videoWriter.complete();
      return blob;
    } else if (mimeType === 'image/png+profile') {
      const localWidth = parseInt(args.width, 10) || width;
      const localHeight = parseInt(args.height, 10) || height;
      const canvas = new OffscreenCanvas(localWidth, localHeight);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
      });
      renderer.autoClear = false;
      renderer.sortObjects = false;
      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.xr.enabled = true;
      
      const scene = new THREE.Scene();
      scene.autoUpdate = false;

      const ambientLight = new THREE.AmbientLight(0xffffff, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(0, 1, 2);
      directionalLight.updateMatrixWorld();
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
      scene.add(directionalLight);
      
      scene.add(app);

      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      camera.position.set(5, 1.6, 5);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      // renderer.setClearColor(0xFF0000, 1);
      // renderer.clear();
      renderer.render(scene, camera);

      // get the blob
      const blob = await canvas.convertToBlob();
      return blob;
    } else if (mimeType === 'image/png+birdseye') {
      const localWidth = parseInt(args.width, 10) || width;
      const localHeight = parseInt(args.height, 10) || height;
      const canvas = new OffscreenCanvas(localWidth, localHeight);
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
      });
      renderer.autoClear = false;
      renderer.sortObjects = false;
      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.xr.enabled = true;
      
      const scene = new THREE.Scene();
      scene.autoUpdate = false;

      const ambientLight = new THREE.AmbientLight(0xffffff, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(0, 1, 2);
      directionalLight.updateMatrixWorld();
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 500;
      scene.add(directionalLight);
      
      scene.add(app);

      // const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      const worldWidth = 40;
      const worldHeight = 40;
      const camera = new THREE.OrthographicCamera(
        worldWidth / - 2, worldWidth / 2,
        worldHeight / 2, worldHeight / - 2,
        0.1, 1000
      );
      camera.position.set(0, 40, 0);
      camera.quaternion.copy(downQuaternion);
      // camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();

      renderer.setClearColor(0xFFFFFF, 1);
      renderer.clear();
      renderer.render(scene, camera);

      // get the blob
      const blob = await canvas.convertToBlob();
      return blob;
    } else {
      return null;
    }
  }); */

  // app.stop = () => {
  //   for (const mixer of animationMixers) {
  //     console.log('got mixer', mixer);
  //     mixer.stopAllAction();
  //   }
  //   animationMixers.length = 0;
  // };

  // bind activate
  useActivate(() => {
    if (app.getComponent('sit')) {
      app.wear();
    }
  });

  // register components ui
  useComponentUi(() => {
    const [receiveShadow, setReceiveShadow] = useState(() => !!app.getComponent('receiveShadow'));
    const [castShadow, setCastShadow] = useState(() => !!app.getComponent('castShadow'));

    //

    useEffect(() => {
      const oldReceiveShadow = app.getComponent('receiveShadow');
      if (receiveShadow !== oldReceiveShadow) {
        app.setComponent('receiveShadow', receiveShadow);
      }
    }, [
      receiveShadow,
    ]);

    useEffect(() => {
      const oldCastShadow = app.getComponent('castShadow');
      if (castShadow !== oldCastShadow) {
        app.setComponent('castShadow', castShadow);
      }
    }, [
      castShadow,
    ]);

    //

    return div([
      div([
        label([
          span('receiveShadow'),
          input({
            type: 'checkbox',
            onChange: e => {
              setReceiveShadow(e.target.checked);
            },
            checked: receiveShadow,
          }),
        ]),
      ]),
      div([
        label([
          span('castShadow'),
          input({
            type: 'checkbox',
            onChange: e => {
              setCastShadow(e.target.checked);
            },
            checked: castShadow,
          }),
        ]),
      ]),
    ]);
  });

  //

  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'glb';
// export const components = ${this.components};