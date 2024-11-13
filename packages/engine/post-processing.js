/*
this file implements post processing.
*/

import * as THREE from 'three';
import {UnrealBloomPass} from './UnrealBloomPass.js';
// import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass.js';
import {BokehPass} from './BokehPass.js';
import {SSAOPass} from './SSAOPass.js';
import {DepthPass} from './DepthPass.js';
// import {
//   getRenderer,
//   getComposer,
//   rootScene,
//   sceneHighPriority,
//   scene,
//   camera,
// } from './renderer.js';
// import {
//   CameraManager,
// } from './camera-manager.js';
import {
  EngineRenderPass,
} from './engine-render-pass.js';
// import renderSettingsManager from './rendersettings-manager.js';
// import {
//   RenderSettingsManager,
// } from './rendersettings-manager.js';
// import { PlayersManager } from './players-manager.js';
// import metaversefileApi from 'metaversefile';

const postprocessingSpecs = {
  'None': {},
  'DOF': {
    dof: {},
  },
  'Bloom + DOF': {
    dof: {},
    bloom: {},
  },
};
export const postprocessingModes = Object.keys(postprocessingSpecs);

const localVector2D = new THREE.Vector2();
const localVector2D2 = new THREE.Vector2();

const defaultFocusZ = 1;

const bloomValues = {};
const dofValues = {};

/* class EncodingPass extends ShaderPass {
  constructor() {
    super({
      uniforms: {
        tDiffuse: {
          value: null,
        },
      },
      vertexShader: `\
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `\
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(tDiffuse, vUv);
          c = LinearTosRGB(c);
          // c = sRGBToLinear(c);
          // c.rgb = pow2(c.rgb, 0.8);
          // c.a = 1.;
          gl_FragColor = c;
        }
      `,
      depthTest: false,
      depthWrite: false,
    });
  }
} */

// const encodingPass = new EncodingPass();

//

/* class MainEngineRenderPass extends EngineRenderPass {
  constructor({
    engineRenderer,
    // cameraManager,
    // playersManager,
  }) {
    super({
      engineRenderer,
    });
  }
} */

//

export class PostProcessing extends EventTarget {
  constructor({
    engineRenderer,
    // cameraManager,
    // playersManager,
  }) {
    super();

    if (!engineRenderer /*|| !playersManager*/) {
      console.warn('no engineRenderer');
      debugger;
    }
    this.engineRenderer = engineRenderer;

    this.upstreetRenderPass = new /* Main*/EngineRenderPass({
      engineRenderer,
      // cameraManager,
      // playersManager,
    });

    this.mode = postprocessingModes[postprocessingModes.length - 1];
    this.focusZ = defaultFocusZ;

    this.#listen();
  }

  #listen() {
    this.engineRenderer.addEventListener('canvaschange', e => {
      const {
        canvas,
      } = e.data;
      if (canvas) {
        this.setMode(this.mode); // call to set the passes
      }
    });
    this.engineRenderer.addEventListener('postprocessingvalueschange', e => {
      bloomValues.strength = e.data.bloomStrength;
      bloomValues.radius = e.data.bloomRadius;
      bloomValues.threshold = e.data.bloomThreshold;
      dofValues.aperture = e.data.dofAperture;
      dofValues.maxblur = e.data.dofMaxBlur;
      this.setMode(this.mode);
    });
  }

  getMode() {
    return this.mode;
  }
  setMode(mode) {
    const postprocessingSpec = postprocessingSpecs[mode];

    if (postprocessingSpec) {
      this.mode = mode;

      this.setPasses(postprocessingSpec);

      this.dispatchEvent(new MessageEvent('modechange', {
        data: {
          mode,
        },
      }));
    } else {
      throw new Error('invalid mode: ' + mode);
    }
  }

  // internal passes
  #makeDepthPass() {
    // const renderer = getRenderer();
    const {
      renderer,
      sceneHighPriority,
      scene,
      rootScene,
      camera,
    } = this.engineRenderer;
    const size = renderer.getSize(localVector2D)
      .multiplyScalar(renderer.getPixelRatio());

    // const regularScenes = [
    //   sceneHighPriority,
    //   scene,
    // ];
    const depthPass = new DepthPass(rootScene, camera, {
      width: size.x,
      height: size.y,
      onBeforeRenders: this.engineRenderer.onBeforeRenders,
      onAfterRenders: this.engineRenderer.onAfterRenders,
      // onBeforeRenderScene(scene) {
      //   return () => {};
      //   // return renderSettingsManager.push(rootScene, scene);
      // },
    });
    depthPass.needsSwap = false;
    // depthPass.enabled = hqDefault;
    // depthPass.enabled = true;
    return depthPass;
  }
  #makeSsaoRenderPass({
    kernelSize = 8,
    kernelRadius = 16,
    minDistance = 0.005,
    maxDistance = 0.1,
  }, depthPass) {
    // const renderer = getRenderer();
    const {renderer} = this.engineRenderer;
    const size = renderer.getSize(localVector2D)
      .multiplyScalar(renderer.getPixelRatio());

    const ssaoRenderPass = new SSAOPass(rootScene, camera, size.x, size.y, depthPass);
    ssaoRenderPass.kernelSize = kernelSize;
    ssaoRenderPass.kernelRadius = kernelRadius;
    ssaoRenderPass.minDistance = minDistance;
    ssaoRenderPass.maxDistance = maxDistance;
    // ssaoRenderPass.output = SSAOPass.OUTPUT.SSAO;
    return ssaoRenderPass;
  }
  #makeDofPass({
    // focus = 1.0,
    aperture = 0.1,
    maxblur = 0.001,
  }, depthPass) {
    const {
      renderer,
      rootScene,
      camera,
    } = this.engineRenderer;
    const size = renderer.getSize(localVector2D)
      .multiplyScalar(renderer.getPixelRatio());

    const bokehPass = new BokehPass(rootScene, camera, {
      // focus,
      aperture,
      maxblur,
      width: size.x,
      height: size.y,
    }, depthPass);
    bokehPass.needsSwap = true;
    bokehPass.setFocusZ(this.focusZ);
    // bokehPass.enabled = hqDefault;
    return bokehPass;
  }
  #makeHdrPass({
    adaptive = true,
    resolution = 256,
    adaptionRate = 100,
    maxLuminance = 10,
    minLuminance = 0,
    middleGrey = 3,
  }) {
    debugger;
    const adaptToneMappingPass = new AdaptiveToneMappingPass(adaptive, resolution);
    adaptToneMappingPass.setAdaptionRate(adaptionRate);
    adaptToneMappingPass.setMaxLuminance(maxLuminance);
    adaptToneMappingPass.setMinLuminance(minLuminance);
    adaptToneMappingPass.setMiddleGrey(middleGrey);
    adaptToneMappingPass.needsSwap = true;
    return adaptToneMappingPass;
  }
  #makeBloomPass({
    strength = 0.4,
    radius = 0.4,
    threshold = 0.9,
  }) {
    // const renderer = getRenderer();
    const {renderer} = this.engineRenderer;
    const size = renderer.getSize(localVector2D)
      .multiplyScalar(renderer.getPixelRatio());
    const resolution = size;

    const unrealBloomPass = new UnrealBloomPass(resolution, strength, radius, threshold);
    // unrealBloomPass.threshold = params.bloomThreshold;
    // unrealBloomPass.strength = params.bloomStrength;
    // unrealBloomPass.radius = params.bloomRadius;
    // unrealBloomPass.copyUniforms['opacity'].value = 0.5;
    // unrealBloomPass.enabled = hqDefault;
    return unrealBloomPass;
  }
  /* #makeWebaWaterPass(webaWater) {
    const renderer = getRenderer();
    const webaWaterPass = new WebaWaterPass( {
        renderer,
        scene,
        camera,
        width: window.innerWidth,
        height: window.innerHeight,
        selects: [],
        invisibleSelects: [],
    });

    return webaWaterPass;
  } */

  makePasses(rendersettings) {
    const passes = [];
    // const internalPasses = [];

    // if (rendersettings) {
      const {/*ssao, */dof, hdr, bloom, /* postPostProcessScene, */ /* swirl, */ webaWater} = (rendersettings ?? {});
      let depthPass = null;
      if (/*ssao || */dof) {
        depthPass = this.#makeDepthPass();
        // internalPasses.push(depthPass);
        passes.push(depthPass);
      }

      passes.push(this.upstreetRenderPass);

      /* if (ssao) {
        const ssaoPass = this.#makeSsaoRenderPass(ssao, depthPass);
        internalPasses.push(ssaoPass);
      } */
      /* if (webaWater) {
        const webaWaterPass = this.#makeWebaWaterPass(webaWater);
        passes.push(webaWaterPass);
      } */
      if (dof) {
        const baseDofAperture = dofValues.aperture;
        const baseDofMaxBlur = dofValues.maxblur;

        if (baseDofAperture && baseDofMaxBlur) {
          dof.aperture = baseDofAperture;
          dof.maxblur = baseDofMaxBlur;
        }

        const dofPass = this.#makeDofPass(dof, depthPass);
        passes.push(dofPass);
      }
      if (hdr) {
        const hdrPass = this.#makeHdrPass(hdr);
        passes.push(hdrPass);
      }
      if (bloom) {
        const baseBloomStrength = bloomValues.strength;
        const baseBloomRadius = bloomValues.radius;
        const baseBloomThreshold = bloomValues.threshold;

        if (baseBloomStrength&&baseBloomRadius&&baseBloomThreshold) {
          bloom.strength = baseBloomStrength;
          bloom.radius = baseBloomRadius;
          bloom.threshold = baseBloomThreshold;
        }

        const bloomPass = this.#makeBloomPass(bloom);
        passes.push(bloomPass);
      }

      // const glitchPass = new GlitchPass();
      // passes.push(glitchPass);

      /* if (postPostProcessScene) {
        const {postPerspectiveScene, postOrthographicScene} = postPostProcessScene;
        if (postPerspectiveScene) {
          const postRenderPass = new RenderPass(postScenePerspective, camera);
          passes.push(postRenderPass);
        }
        if (postOrthographicScene) {
          const postRenderPass = new RenderPass(postSceneOrthographic, orthographicCamera);
          passes.push(postRenderPass);
        }
      } */
    // }

    // passes.push(encodingPass);

    return passes;
    // return {
    //   passes,
    //   internalPasses,
    // };
  }
  setPasses(rendersettings) {
    this.engineRenderer.passes.length = 0;

    const passes = this.makePasses(rendersettings);
    for (const pass of passes) {
      this.engineRenderer.passes.push(pass);
    }
  }
  setFocusZ(focusZ) {
    if (typeof focusZ !== 'number') {
      focusZ = defaultFocusZ;
    }

    this.focusZ = focusZ;
    for (const pass of this.engineRenderer.passes) {
      pass.setFocusZ && pass.setFocusZ(focusZ);
    }
  }

  /* setPasses(passes, internalPasses) {
    // const composer = getComposer();
    const {composer} = this.engineRenderer;

    composer.passes = passes;
    this.upstreetRenderPass.internalRenderPass = internalPasses.find(pass => pass.isSSAOPass) ?? null;
    this.upstreetRenderPass.internalDepthPass = internalPasses.find(pass => pass.isDepthPass) ?? null;

    // this.dispatchEvent(new MessageEvent('update'));
  } */

  update() {
    // this.updatePasses(this.defaultPasses, this.defaultInternalPasses);

    // update pass sizes
    // const composer = getComposer();
    const {composer} = this.engineRenderer;

    const w = composer._width * composer._pixelRatio;
    const h = composer._height * composer._pixelRatio;
    const _updateSize = pass => {
      if (!pass.getSize) {
        (() => {
          let localW = 0;
          let localH = 0;
          pass.setSize = (setSize => function(newW, newH) {
            localW = newW;
            localH = newH;
            return setSize.call(this, newW, newH);
          })(pass.setSize);
          pass.getSize = function(target) {
            return target.set(localW, localH);
          };
        })();
      }

      const oldSize = pass.getSize(localVector2D);
      const newSize = localVector2D2.set(w, h);
      if (!newSize.equals(oldSize)) {
        pass.setSize(w, h);
      }
    };
    for (const pass of passes) {
      _updateSize(pass);
    }
    for (const internalPass of internalPasses) {
      _updateSize(internalPass);
    }

    // this.dispatchEvent(new MessageEvent('update'));
  }
}
// const postProcessing = new PostProcessing();
// export default postProcessing;
