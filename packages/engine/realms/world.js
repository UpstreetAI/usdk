import * as THREE from 'three';
import {
  AppManager,
} from '../app-manager.js';
import {
  HpManager,
} from '../hp-manager.js';
import {
  getSceneJson,
} from './realm-utils.js';
import {
  getCleanJwt,
  makeId,
} from '../util.js';
import {
  loadImage,
} from '../../zine-aux/utils/image-utils.js';
import {
  PortalMesh,
} from '../../zine-aux/meshes/portal-mesh.js';
import {
  setSphereGeometryPanoramaDepth,
} from '../../gen/src/generators/skybox-generator.js';
import {
  pointCloudArrayBufferToGeometry,
} from '../../zine/zine-geometry-utils.js';
// import physicsManager from '../physics/physics-manager.js';
import loaders from '../loaders.js';
import {
  aiProxyHost,
} from '../endpoints.js';

//

const localVector = new THREE.Vector3();
const localVector2D = new THREE.Vector3();
const localEuler = new THREE.Euler();

//

// Handles the world and objects in it, has an app manager just like a player
export class World extends THREE.Object3D {
  constructor({
    engine,
    sceneContextManager,
    ioBus,
    importManager,
    appContextFactory,
  }) {
    super();

    // members
    if (!engine || !sceneContextManager || !ioBus || !importManager || !appContextFactory) {
      console.warn('missing', {engine, sceneContextManager, ioBus, importManager, appContextFactory});
      debugger;
      throw new Error('missing');
    }
    this.engine = engine;
    this.sceneContextManager = sceneContextManager;
    this.ioBus = ioBus;
    this.importManager = importManager;
    this.appContextFactory = appContextFactory;

    // locals
    this.appManager = new AppManager({
      importManager,
      appContextFactory,
    });
    this.appManager.name = 'world';
    this.add(this.appManager);
    this.appManager.updateMatrixWorld();

    this.hpManager = new HpManager();

    const dropPortal = async () => {
      const localPlayer = engine.playersManager.getLocalPlayer();

      const {renderer, camera} = engine.engineRenderer;

      const portalScene = new THREE.Scene();
      portalScene.autoUpdate = false;
      {
          const {gltfLoader} = loaders;
          gltfLoader.load('/models/skybox.glb', gltf => {
              const skyboxMesh = gltf.scene;
              portalScene.add(skyboxMesh);  
              skyboxMesh.updateMatrixWorld();
          }, undefined, err => {
              console.warn(err);
          });
      }

      const noiseImage = await loadImage('/images/noise.png');

      const size = 2;

      const portalCamera = camera.clone();
      const portalMesh = new PortalMesh({
          renderer,
          portalScene,
          portalCamera,
          noiseImage,
      });
            
      localEuler.setFromQuaternion(localPlayer.quaternion, 'YXZ');
      localEuler.x = 0;
      localEuler.z = 0;
      portalMesh.quaternion.setFromEuler(localEuler);
      
      portalMesh.position.copy(localPlayer.position)
        .add(localVector.set(0, 0, -1.5).applyQuaternion(portalMesh.quaternion));

      portalMesh.scale.setScalar(size);
      portalMesh.scale.z = 1;
      
      this.appManager.add(portalMesh);
      portalMesh.updateMatrixWorld();

      const _recurse = () => {
        frame = requestAnimationFrame(_recurse);

        const xrCamera = renderer.xr.getSession() ? renderer.xr.getCamera(camera) : camera;
        portalCamera.position.copy(xrCamera.position);
        portalCamera.quaternion.copy(xrCamera.quaternion);
        portalCamera.updateMatrixWorld();

        const now = performance.now();
        // portalMesh.visible = false;
        portalMesh.update(now);
        // portalMesh.visible = true;
      };
      let frame = requestAnimationFrame(_recurse);
    };
    ioBus.registerHandler('dropPortal', dropPortal);

    //

    const getFile = async (e) => {
      const fileHandles = await globalThis.showOpenFilePicker({
        types: [
          {
            description: 'Images',
            accept: {
              'image/*': ['.png'],
            },
          },
        ],
      });
      const [fileHandle] = fileHandles;
      if (fileHandle) {
        const file = await fileHandle.getFile();
        return file;
      } else {
        return null;
      }
    };
    const getCaptrue = async () => {
      // get display media
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // cursor: 'always',
        },
        audio: false,
      });
      // read 1 frame from stream
      const video = document.createElement('video');
      video.srcObject = stream;
      video.muted = true;
      video.play();
      // video.currentTime = 0;
      // wait for frame
      await new Promise((accept, reject) => {
        video.requestVideoFrameCallback(accept);
      });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const {width, height} = stream.getVideoTracks()[0].getSettings();
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(video, 0, 0, width, height);

      // close the stream
      const tracks = stream.getTracks();
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        track.stop();
      }

      const blob = await new Promise((accept, reject) => {
        canvas.toBlob(accept, 'image/png');
      });
      return blob;
      // const arrayBuffer = await blob.arrayBuffer();
      // return arrayBuffer;
    };

    //

    const jwt = getCleanJwt();
    const imaginairyUrl = `https://${aiProxyHost}/api/imaginairy/`;
    const dropPrompt = async e => {
      // const file = await getFile();
      const {
        prompt,
      } = e;
      console.log('dropPrompt', {
        prompt,
      });
      // return file;

      const fd = new FormData();
      fd.append('prompt_texts', prompt);
      // fd.append('negative_prompt', '');
      // fd.append('width', 256);
      // fd.append('height', 256);
      fd.append('width', 512);
      fd.append('height', 512);

      const res = await fetch(`${imaginairyUrl}/imagine`, {
        method: 'POST',
        body: fd,
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      // console.log('res 1', res.ok, res.status);
      const blob = await res.blob();
      // console.log('res 2', )
      const url = URL.createObjectURL(blob);
      const img = await loadImage(url);
      img.style.cssText = `\
        position: absolute;
        z-index: 1;
      `;
      document.body.appendChild(img);
    };
    ioBus.registerHandler('dropPrompt', dropPrompt);

    const dropFile = async e => {
      const file = await getFile();
      console.log('dropFile', {
        file,
      });
      return file;
    };
    ioBus.registerHandler('dropFile', dropFile);

    const dropCapture = async e => {
      const file = await getFile();
      console.log('dropCapture', {
        file,
      });
      return file;
    };
    ioBus.registerHandler('dropCapture', dropCapture);

    //

    // world
    const generateWorldFromFile = async e => {
      const file = await getFile();
      // console.log('generateFromFile', {
      //   file,
      // });
      const imageArrayBuffer = await file.arrayBuffer();
      await genWorldApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      // console.log('done generating from file');
      // return file;
    };
    ioBus.registerHandler('generateWorldFromFile', generateWorldFromFile);
    const generateWorldFromCapture = async (e) => {
      const capture = await getCaptrue();
      const imageArrayBuffer = await capture.arrayBuffer();
      await genWorldApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      // console.log('done generating panel from capture');
      // return capture;
    };
    ioBus.registerHandler('generateWorldFromCapture', generateWorldFromCapture);

    // zine
    const generateZineFromFile = async e => {
      const file = await getFile();
      // console.log('generateFromFile', {
      //   file,
      // });
      const imageArrayBuffer = await file.arrayBuffer();
      await genZineApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      // console.log('done generating from file');
      // return file;
    };
    ioBus.registerHandler('generateZineFromFile', generateZineFromFile);
    const generateZineFromCapture = async (e) => {
      const capture = await getCaptrue();
      const imageArrayBuffer = await capture.arrayBuffer();
      await genZineApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      console.log('done generating panel from capture');
      // return capture;
    };
    ioBus.registerHandler('generateZineFromCapture', generateZineFromCapture);

    // panel
    const generatePanelFromFile = async e => {
      const file = await getFile();
      // console.log('generateFromFile', {
      //   file,
      // });
      const imageArrayBuffer = await file.arrayBuffer();
      await genPanelApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      // console.log('done generating from file');
      // return file;
    };
    ioBus.registerHandler('generatePanelFromFile', generatePanelFromFile);
    const generatePanelFromCapture = async (e) => {
      const capture = await getCaptrue();
      const imageArrayBuffer = await capture.arrayBuffer();
      await genPanelApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      console.log('done generating panel from capture');
      // return capture;
    };
    ioBus.registerHandler('generatePanelFromCapture', generatePanelFromCapture);

    // skybox
    const generateSkyboxFromFile = async e => {
      const file = await getFile();
      // console.log('generateFromFile', {
      //   file,
      // });
      const imageArrayBuffer = await file.arrayBuffer();
      await genSkyboxApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      // console.log('done generating from file');
      // return file;
    };
    ioBus.registerHandler('generateSkyboxFromFile', generateSkyboxFromFile);
    const generateSkyboxFromCapture = async (e) => {
      const capture = await getCaptrue();
      const imageArrayBuffer = await capture.arrayBuffer();
      await genSkyboxApp({
        imageArrayBuffer,
        appManager: this.appManager,
      });
      console.log('done generating skybox from capture');
      // return capture;
    };
    ioBus.registerHandler('generateSkyboxFromCapture', generateSkyboxFromCapture);

    //

    // XXX debug cube mesh
    // {
    //   const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    //   const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
    //   const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    //   // boxMesh.position.set(0, 0, 0);
    //   this.add(boxMesh);
    //   boxMesh.updateMatrixWorld();
    // }

    // const _getBindSceneForRenderPriority = renderPriority => {
    //   const {engineRenderer} = engine;
    //   switch (renderPriority) {
    //     case 'high': {
    //       return engineRenderer.sceneHighPriority;
    //     }
    //     case 'low': {
    //       return engineRenderer.sceneLowPriority;
    //     }
    //     case 'lower': {
    //       return engineRenderer.sceneLowerPriority;
    //     }
    //     case 'lowest': {
    //       return engineRenderer.sceneLowestPriority;
    //     }
    //     default: {
    //       return engineRenderer.scene;
    //     }
    //   }
    // };

    // this.winds = [];
    // This handles adding apps to the world scene
    // this.appManager.addEventListener('appadd', e => {
    //   const app = e.data;
    //   const bindScene = _getBindSceneForRenderPriority(app.getComponent('renderPriority'));
    //   bindScene.add(app);
    //   let boundAppManager = this.appManager;

    //   const isInvincible = app.getComponent('invincible');

    //   // regular glb models default to invincible for now
    //   if (!isInvincible) {
    //     const hitTracker = hpManager.makeHitTracker();
    //     hitTracker.bind(app);
    //     app.dispatchEvent({type: 'hittrackeradded'});

    //     const die = () => {
    //       boundAppManager.removeTrackedApp(app.instanceId);
    //     };
    //     app.addEventListener('die', die);
    //   }

    //   const migrated = (e) => {
    //     const {appManager} = e;
    //     boundAppManager = appManager;
    //   };
    //   app.addEventListener('migrated', migrated);
    // });

    // This handles removal of apps from the scene when we leave the world
    // this.appManager.addEventListener('appremove', async e => {
    //   const app = e.data;
    //   app.hitTracker.unbind();
    //   app.parent.remove(app);
    // });

    // this.#listen();
  }
  /* #listen() {
    const drop = async e => {
      // e.preventDefault();
      // console.log('got drop event', e);
      // debugger;

      const {clientX, clientY} = e;

      const {dataTransfer} = e;
      const items = Array.from(dataTransfer.items);
      const jsonItem = items.find(item => item.type === 'application/json');
      const jsonString = await new Promise((accept, reject) => {
        jsonItem.getAsString(accept);
      });
      const json = JSON.parse(jsonString);
      if (json) {
        const {
          type,
          content,
        } = json;
        if (typeof type === 'string' && content) {
          const mouse = localVector2D.set(
            (clientX / window.innerWidth) * 2 - 1,
            -(clientY / window.innerHeight) * 2 + 1
          );
          const position = new THREE.Vector3(
            mouse.x,
            mouse.y,
            0
          );
          // unproject from this.engine.engineRenderer.camera
          position.unproject(this.engine.engineRenderer.camera);
          position.add(
            localVector.set(0, 0, -3)
              .applyQuaternion(this.engine.engineRenderer.camera.quaternion)
          );
          await this.appManager.addAppAsync({
            type,
            content,
            position,
          });
        }
      }
      // console.log('got drop event', json);
      // const {files} = dataTransfer;
      // const file = files[0];

      // const imageArrayBuffer = await file.arrayBuffer();
      // await genZineApp({
      //   imageArrayBuffer,
      //   appManager: this.appManager,
      // });
    };
    document.addEventListener('drop', drop);
    const dragover = e => {
      e.preventDefault();
      // debugger;
    };
    document.addEventListener('dragover', dragover);
    const dragenter = e => {
      e.preventDefault();
      // debugger;
    };
    document.addEventListener('dragenter', dragenter);

    this.#unlisten = () => {
      document.removeEventListener('drop', drop);
      document.removeEventListener('dragover', dragover);
      document.removeEventListener('dragenter', dragenter);
    };
  } */
  #unlisten = null;
  clear() {
    super.clear();
    this.appManager.clear();
    // this.hpManager.clear();
  }
  destroy() {
    this.#unlisten();

    this.clear();
    this.remove(this.appManager);
    this.appManager.destroy();
    this.appManager = null;
    // this.hpManager.destroy();
    this.hpManager = null;
  }
  async setRealmSpec(realmSpec) {
    const sceneJson = await getSceneJson(realmSpec);
    // console.log('got scene json', realmSpec, sceneJson);

    if (sceneJson !== null) {
      await this.appManager.loadScnFromJson(sceneJson);
      // this.engine.sceneContextManager.setSceneContext(sceneJson);
    }
  }
}

// XXX

const requestIframe = async (iframe, funcName, args, transfers) => {
  iframe.contentWindow.postMessage({
    method: 'generate',
    funcName,
    args,
  }, '*', transfers);
  console.log('did iframe postMessage');
  
  const result = await new Promise((accept, reject) => {
    const message = e => {
      // console.log('top level got message', e);
      const {
        method,
        error,
        result,
      } = e.data;
      if (method === 'engineResponse') {
        console.log('got engineResponse message', {
          method,
          error,
          result,
        });
        if (error) {
          reject(error);
        } else {
          accept(result);
        }
        cleanup();
      }
    };
    globalThis.addEventListener('message', message);

    const cleanup = () => {
      globalThis.removeEventListener('message', message);
    };
  });
  return result;
};
const makeIframe = async () => {
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `\
    position: fixed;
    top: -10px;
    left: -10px;
    width: 5px;
    height: 5px;
  `;
  console.log('wait for iframe', iframe);
  await new Promise((accept, reject) => {
    iframe.onload = async () => {
      accept();
      cleanup();
    };
    iframe.onerror = err => {
      console.warn(err);
      reject(err);
      cleanup();
    };
    const cleanup = () => {
      iframe.onload = null;
      iframe.onerror = null;
    };
    document.body.appendChild(iframe);
    iframe.src = 'https://local.webaverse.com:9999/engine.html';
  });
  console.log('iframe waiting for engineReady');
  // wait for 'engineReady' message
  await new Promise((accept, reject) => {
    const message = e => {
      const {
        data,
      } = e;
      // console.log('got message 2', data);
      const {
        method,
      } = data;
      if (method === 'engineReady') {
        console.log('got engine ready');
        accept();
        cleanup();
      }
    };
    globalThis.addEventListener('message', message);

    const cleanup = () => {
      globalThis.removeEventListener('message', message);
    };
  });
  console.log('done waiting for iframe');
  return iframe;
};
const generateZine = async imageArrayBuffer => {
  const iframe = await makeIframe();

  // console.log('posting message down');
  const funcName = 'compileScene';
  const args = {
    imageArrayBuffer,
  };
  const result = await requestIframe(iframe, funcName, args, [
    imageArrayBuffer,
  ]);
  iframe.remove();
  return result;
};
const generatePanel = async imageArrayBuffer => {
  const iframe = await makeIframe();

  // console.log('posting message down');
  const funcName = 'compilePanel';
  const args = {
    imageArrayBuffer,
  };
  const result = await requestIframe(iframe, funcName, args, [
    imageArrayBuffer,
  ]);
  iframe.remove();
  return result;
};
const generateSkybox = async imageArrayBuffer => {
  const iframe = await makeIframe();

  // console.log('posting message down');
  const funcName = 'compileSkybox';
  const args = {
    imageArrayBuffer,
  };
  const result = await requestIframe(iframe, funcName, args, [
    imageArrayBuffer,
  ]);
  iframe.remove();
  return result;
};

//

const _saveFile = async (data, type) => {
  const id = makeId(8);
  const fileName = `${id}.${type}`;
  const url = `https://local.webaverse.com/tmp/${fileName}`;
  const res = await fetch(url, {
    method: 'PUT',
    body: data,
  });
  const blob = await res.blob();
  return url;
};
const genWorldApp = async ({
  imageArrayBuffer,
  appManager,
}) => {
  // const zineUint8Array = await generateZine(imageArrayBuffer);
  const imgUrl = await _saveFile(imageArrayBuffer, 'png');
  const worldZineJson = {
    imgSrc: imgUrl,
  };
  const worldZineJsonString = JSON.stringify(worldZineJson);
  const worldZineUrl = await _saveFile(worldZineJsonString, 'worldzine');

  // const url = await _saveFile(worldZineJson, 'worldzine');
  // console.log('got url', url);

  const worldZineApp = await appManager.addAppAsync({
    contentId: worldZineUrl,
  });
  console.log('got world zine app', worldZineApp);
};

//

const genZineApp = async ({
  imageArrayBuffer,
  appManager,
}) => {
  const zineUint8Array = await generateZine(imageArrayBuffer);

  let url;
  {
    const id = makeId(8);
    const fileName = `${id}.zine`;
    url = `https://local.webaverse.com/tmp/${fileName}`;
    const res = await fetch(url, {
      method: 'PUT',
      body: zineUint8Array,
    });
    const blob = await res.blob();
  }
  console.log('got url', url);

  {
    const zineApp = await appManager.addAppAsync({
      contentId: url,
    });
    console.log('got zine app', zineApp);
  }
};

//

const panoramaRadius = 3;
const panoramaWidthSegments = 256;
const panoramaHeightSegments = 64;
const genSkyboxApp = async ({
  imageArrayBuffer,
  appManager,
}) => {
  const file = new Blob([
    imageArrayBuffer,
  ], {
    type: 'image/png',
  });

  const depths = await generateSkybox(imageArrayBuffer);
  console.log('generated skybox depths', depths);

  // panorama texture
  console.log('load texture 1');
  const textureLoader = new THREE.TextureLoader();
  const panoramaTexture = await new Promise((accept, reject) => {
    const u = URL.createObjectURL(file);
    const cleanup = () => {
      URL.revokeObjectURL(u);
    };
    textureLoader.load(u, (tex) => {
      accept(tex);
      cleanup();
    }, undefined, err => {
      reject(err);
      cleanup();
    });
  });
  panoramaTexture.wrapS = THREE.RepeatWrapping;
  panoramaTexture.wrapT = THREE.RepeatWrapping;
  panoramaTexture.needsUpdate = true;
  // const panoramaTextureImage = panoramaTexture.image;
  // document.body.appendChild(panoramaTextureImage);
  console.log('load texture 2');

  // sphere mesh
  const _makeSphereMesh = () => {
    const sphereGeometry = new THREE.SphereGeometry(
      panoramaRadius,
      panoramaWidthSegments,
      panoramaHeightSegments,
    );
    // flip inside out
    for (let i = 0; i < sphereGeometry.index.array.length; i += 3) {
      const a = sphereGeometry.index.array[i + 0];
      const b = sphereGeometry.index.array[i + 1];
      const c = sphereGeometry.index.array[i + 2];
      sphereGeometry.index.array[i + 0] = c;
      sphereGeometry.index.array[i + 1] = b;
      sphereGeometry.index.array[i + 2] = a;
    }

    const sphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: panoramaTexture,
        }
      },
      vertexShader: `\
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `\
        uniform sampler2D map;
        varying vec2 vUv;

        void main() {
          vec4 c = texture2D(map, vUv);

          gl_FragColor = vec4(vUv * 0.1, 0.0, 1.0);
          gl_FragColor.rgb += c.rgb;
        }
      `,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    return sphereMesh;
  };
  const sphereMesh = _makeSphereMesh();
  // sphereMesh.position.set(0, 20, 0);
  // sphereMesh.position.set(0, cameraY, 0);
  appManager.add(sphereMesh);
  sphereMesh.updateMatrixWorld();
  // scene.sphereMesh = sphereMesh;
  // globalThis.sphereMesh = sphereMesh;

  setSphereGeometryPanoramaDepth(
    sphereMesh.geometry,
    depths,
    panoramaWidthSegments,
    panoramaHeightSegments,
  );
};
const genPanelApp = async ({
  imageArrayBuffer,
  appManager,
}) => {
  const imgBlob = new Blob([imageArrayBuffer], {
    type: 'image/png',
  });

  const {
    pointCloudArrayBuffer,
    width,
    height,
  } = await generatePanel(imageArrayBuffer);
    // console.log('generated panel', {
    //   pointCloudArrayBuffer,
    //   width,
    //   height,
    // });

    const map = new THREE.Texture();
    map.encoding = THREE.sRGBEncoding;
    const material = new THREE.MeshBasicMaterial({
      map,
    });

    // scene mesh
    let geometry = pointCloudArrayBufferToGeometry(
      pointCloudArrayBuffer,
      width,
      height,
    );
    // const segmentArray = reconstructValueMaskFromLabelsIndices(segmentLabels, segmentLabelIndices);
    // geometry.setAttribute('segment', new THREE.BufferAttribute(segmentArray, 1));
    // const segmentColor = getColorArrayFromValueArray(segmentArray);
    // geometry.setAttribute('segmentColor', new THREE.BufferAttribute(segmentColor, 3));
    // const planeArray = reconstructValueMaskFromLabelsIndices(planeLabels, planeLabelIndices);
    // geometry.setAttribute('plane', new THREE.BufferAttribute(planeArray, 1));
    // const planeColor = getColorArrayFromValueArray(planeArray);
    // geometry.setAttribute('planeColor', new THREE.BufferAttribute(planeColor, 3));
    // // const portalColor = getHighlightArrayFromValueArray(portalArray);
    // // geometry.setAttribute('portalColor', new THREE.BufferAttribute(portalColor, 3));
    // const indexedGeometry = geometry;
    // geometry = geometry.toNonIndexed();
    // decorateGeometryTriangleIds(geometry);

    const sceneMesh = new THREE.Mesh(geometry, material);
    sceneMesh.name = 'sceneMesh';
    appManager.add(sceneMesh);
    sceneMesh.updateMatrixWorld();

    (async () => { // load the texture image
      sceneMesh.visible = false;

      map.image = await createImageBitmap(imgBlob, {
        imageOrientation: 'flipY',
        // encoding: 'linear',
      });
      // map.encoding = THREE.sRGBEncoding;
      map.needsUpdate = true;

      sceneMesh.visible = true;

      // this.dispatchEvent({
      //   type: 'load',
      // });
    })();

    // sceneMesh.frustumCulled = false;
    // sceneMesh.indexedGeometry = indexedGeometry;
    // sceneMesh.segmentLabels = segmentLabels;
    // sceneMesh.segmentLabelIndices = segmentLabelIndices;
    // sceneMesh.planeLabels = planeLabels;
    // sceneMesh.planeLabelIndices = planeLabelIndices;
    // sceneMesh.portalLabels = portalLabels;
    // sceneMesh.segmentArray = segmentArray;
    // sceneMesh.firstFloorPlaneIndex = firstFloorPlaneIndex;
    // sceneMesh.update = (selector) => {
    //   sceneMesh.material.uniforms.uMouseDown.value = +selector.mousedown;
    //   sceneMesh.material.uniforms.uMouseDown.needsUpdate = true;
    // };

  // let url;
  // {
  //   const id = makeId(8);
  //   const fileName = `${id}.zine`;
  //   url = `https://local.webaverse.com/tmp/${fileName}`;
  //   const res = await fetch(url, {
  //     method: 'PUT',
  //     body: zineUint8Array,
  //   });
  //   const blob = await res.blob();
  // }
  // console.log('got url', url);

  // {
  //   const zineApp = await appManager.addAppAsync({
  //     contentId: url,
  //   });
  //   console.log('got zine app', zineApp);
  // }
};