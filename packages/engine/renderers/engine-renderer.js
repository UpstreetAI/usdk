/*
this file contains the main objects we use for rendering.
the purpose of this file is to hold these objects and to make sure they are correctly configured (e.g. handle canvas resize)
*/

import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
// import {makePromise} from '../util.js';
import {minFov, minCanvasSize} from '../constants.js';
import {UpstreetScene} from '../upstreet-scene.js';
// import {
//   PostProcessing,
// } from '../post-processing.js';
import {
  makeDefaultPerspectiveCamera,
} from '../renderer-utils.js';
import mobile from 'is-mobile';
const isMobile = mobile();

//

const renderEvent = new MessageEvent('render');

//

const defaultSize = 1024;
export class EngineRenderer extends EventTarget {
  constructor() {
    super();

    const scene = new THREE.Scene();
    scene.name = 'scene';
    this.scene = scene;

    const sceneHighPriority = new THREE.Scene();
    sceneHighPriority.name = 'highPriority';
    this.sceneHighPriority = sceneHighPriority;

    const sceneLowPriority = new THREE.Scene();
    sceneLowPriority.name = 'lowPriority';
    this.sceneLowPriority = sceneLowPriority;

    // const sceneLowerPriority = new THREE.Scene();
    // sceneLowerPriority.name = 'lowerPriority';
    // this.sceneLowerPriority = sceneLowerPriority;

    // const sceneLowestPriority = new THREE.Scene();
    // sceneLowestPriority.name = 'lowestPriority';
    // this.sceneLowestPriority = sceneLowestPriority;

    const rootScene = new UpstreetScene();
    rootScene.name = 'root';
    rootScene.autoUpdate = false;
    rootScene.add(sceneHighPriority);
    rootScene.add(scene);
    rootScene.add(sceneLowPriority);
    // rootScene.add(sceneLowerPriority);
    // rootScene.add(sceneLowestPriority);
    this.rootScene = rootScene;

    const camera = makeDefaultPerspectiveCamera();
    scene.add(camera);
    this.camera = camera;

    this.renderer = null;
    this.renderTarget = null;
    this.composer = null;

    this.passes = [];
    this.onBeforeRenders = [];
    this.onAfterRenders = [];

    //

    window.addEventListener('pagehide', () => {
      navigator.sendBeacon('/log/pagehide');

      if (this.renderer) {
        if (this.renderer.domElement) {
          this.renderer.domElement.width = 0;
          this.renderer.domElement.height = 0;
          // remove from the dom
          this.renderer.domElement.parentNode && this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
        this.renderer.forceContextLoss();
        this.renderer.dispose();
      }
    });
  }
  setCanvas(canvas) {
    if (canvas) {
      // renderer
      this.renderer = new THREE.WebGLRenderer({
        // canvas: this.offscreenCanvas,
        canvas,
        antialias: true,
        alpha: true,
        rendererExtensionFragDepth: true,
        preserveDrawingBuffer: true,
      });

      this.renderer.autoClear = false;
      this.renderer.sortObjects = false;
      this.renderer.physicallyCorrectLights = true;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      // this.renderer.premultipliedAlpha = false;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.xr.enabled = true;
      // this.renderer.xr.cameraAutoUpdate = false;

      // initialize post-processing
      const renderTarget = new THREE.WebGLRenderTarget(
        defaultSize,
        defaultSize,
        {
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          encoding: THREE.sRGBEncoding,
        },
      );
      renderTarget.name = 'effectComposerRenderTarget';
      const context = this.renderer.getContext();
      renderTarget.samples = context.MAX_SAMPLES;
      renderTarget.texture.generateMipmaps = false;
      this.renderTarget = renderTarget;

      this.composer = new EffectComposer(this.renderer, this.renderTarget);
      this.composer.passes = this.passes;

      // initialize camera
      this.setCameraSize(defaultSize, defaultSize);

      this.setSizes(canvas);
      this.bindCanvasEvents(canvas);

      this.dispatchEvent(new MessageEvent('canvaschange', {
        data: {
          canvas,
        },
      }));
    } else {
      if (this.composer) {
        this.composer = null;
      }

      if (this.renderTarget) {
        this.renderTarget.dispose();
        this.renderTarget = null;
      }

      if (this.renderer) {
        this.renderer.domElement.unobserveEvents();
        this.renderer.forceContextLoss();
        this.renderer.dispose();
        this.renderer = null;
      }

      this.dispatchEvent(new MessageEvent('canvaschange', {
        data: {
          canvas: null,
        },
      }));
    }
  }
  bindCanvasEvents(canvas) {
    const resize = e => {
      this.setSizes(canvas);
    };
    window.addEventListener('resize', resize);
    canvas.unobserveEvents = () => {
      window.removeEventListener('resize', resize);
    };
  }
  setSizes(canvas) {
    const rect = canvas.getBoundingClientRect();
    let {
      width,
      height,
    } = rect;
    width = Math.max(width, minCanvasSize);
    height = Math.max(height, minCanvasSize);

    this.setCameraSize(width, height);

    const pixelRatio = globalThis.devicePixelRatio;
    this.setRendererSize(width, height, pixelRatio);
    this.setRenderTargetSize(width, height, pixelRatio);
    this.setComposerSize(width, height, pixelRatio);
  }
  setRendererSize(width, height, pixelRatio) {
    const {renderer} = this;
    if (renderer.xr.getSession()) {
      renderer.xr.isPresenting = false;
    }

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(isMobile ? 1 : globalThis.devicePixelRatio);

    // resume XR
    if (renderer.xr.getSession()) {
      renderer.xr.isPresenting = true;
    }
  }
  pushSize(w, h) {
    const oldSize = new THREE.Vector2();
    this.renderer.getSize(oldSize);
    const oldPixelRatio = this.renderer.getPixelRatio();
    const oldCameraAspect = this.camera.aspect;

    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(1);

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    return () => {
      this.camera.aspect = oldCameraAspect;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(oldSize.x, oldSize.y, false);
      this.renderer.setPixelRatio(oldPixelRatio);
    };
  }
  setRenderTargetSize(width, height, pixelRatio) {
    this.renderTarget.setSize(width * pixelRatio, height * pixelRatio);
  }
  setComposerSize(width, height, pixelRatio) {
    const {composer} = this;
    if (composer) {
      composer.setSize(width, height);
      composer.setPixelRatio(pixelRatio);
    }
  }
  setCameraSize(width, height) {
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  render({
    postProcessing = false,
    scene = this.rootScene,
    camera = this.camera,
  } = {}) {
    if (!postProcessing || this.composer.passes.length === 0) {
      for (const onBeforeRender of this.onBeforeRenders) {
        onBeforeRender();
      }

      const {renderer} = this;
      renderer.clear();
      renderer.render(scene, camera);

      for (const onAfterRender of this.onAfterRenders) {
        onAfterRender();
      }
    } else {
      this.composer.render();
    }

    this.dispatchEvent(renderEvent);
  }
  async waitForRender() {
    await new Promise((accept, reject) => {
      const render = e => {
        accept();
        cleanup();
      };
      this.addEventListener('render', render);

      const cleanup = () => {
        this.removeEventListener('render', render);
      };
    });
  }
}
