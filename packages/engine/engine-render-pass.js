import {Pass} from 'three/examples/jsm/postprocessing/Pass.js';
// import {
//   rootScene,
//   camera,
// } from './renderer.js';

export class EngineRenderPass extends Pass {
  constructor({
    engineRenderer,
  }) {
    super();

    // members
    this.engineRenderer = engineRenderer;

    // locals
    this.clear = false;
    this.needsSwap = true;

    // internals
    // this.internalDepthPass = null;
    // this.internalRenderPass = null;
    this.onBeforeRenders = engineRenderer.onBeforeRenders;
    this.onAfterRenders = engineRenderer.onAfterRenders;
  }

  setSize(width, height) {
    /* if (this.internalDepthPass) {
      this.internalDepthPass.setSize(width, height);
    }
    if (this.internalRenderPass) {
      this.internalRenderPass.setSize(width, height);
    } */
	}

  render(renderer, renderTarget, readBuffer, deltaTime, maskActive) {
    for (const onBeforeRender of this.onBeforeRenders) {
      onBeforeRender();
    }

    renderer.setRenderTarget(this.renderToScreen ? null : renderTarget);
    renderer.clear();
    renderer.render(
      this.engineRenderer.rootScene,
      this.engineRenderer.camera
    );
    
    /* // render
    if (this.internalDepthPass) {
      this.internalDepthPass.renderToScreen = false;
      this.internalDepthPass.render(renderer, renderTarget, readBuffer, deltaTime, maskActive);
    }
    if (this.internalRenderPass) {
      this.internalRenderPass.renderToScreen = this.renderToScreen;
      this.internalRenderPass.render(renderer, renderTarget, readBuffer, deltaTime, maskActive);
    } else {
      // console.log('render to screen', this.renderToScreen);
      renderer.setRenderTarget(this.renderToScreen ? null : renderTarget);
      renderer.clear();
      renderer.render(
        this.engineRenderer.rootScene,
        this.engineRenderer.camera
      );
    } */
    
    for (const onAfterRender of this.onAfterRenders) {
      onAfterRender();
    }
  }
}