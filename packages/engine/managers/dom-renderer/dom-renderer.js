import * as THREE from 'three';

//

export class DomRenderer {
  #iframeContainer = null;
  constructor({
    engine,
  }) {
    this.engine = engine;

    this.appIframes = [];

    const destroy = e => {
      if (this.#iframeContainer) {
        this.#iframeContainer.remove();
        this.#iframeContainer = null;
      }
      cleanup();
    };
    this.engine.addEventListener('destroy', destroy);
    const resize = e => {
      if (this.#iframeContainer) {
        this.#iframeContainer.updateSize();
      }
    };
    globalThis.addEventListener('resize', resize);

    const cleanup = () => {
      this.engine.removeEventListener('destroy', destroy);
      globalThis.removeEventListener('resize', resize);
    };
  }
  getIframeContainer() {
    if (this.#iframeContainer === null) {
      const {engineRenderer} = this.engine;
      const {renderer, camera} = engineRenderer;

      this.#iframeContainer = document.createElement('div');
      this.#iframeContainer.id = 'iframe-container';
      this.#iframeContainer.classList.add('iframe-container');

      this.#iframeContainer.getFov = () => camera.projectionMatrix.elements[5] * (globalThis.innerHeight / 2);
      this.#iframeContainer.updateSize = () => {
        const fov = this.#iframeContainer.getFov();
        this.#iframeContainer.style.cssText = `\
          position: fixed;
          left: 0;
          top: 0;
          /* width: ${globalThis.innerWidth}px;
          height: ${globalThis.innerHeight}px; */
          width: 100vw;
          height: 100vh;
          perspective: ${fov}px;
          /* pointer-events: none; */
          user-select: none;
        `;
      };
      this.#iframeContainer.updateSize();

      const canvas = renderer.domElement;
      if (!canvas) {
        throw new Error('no canvas');
      }
      canvas.parentNode.insertBefore(this.#iframeContainer, canvas);
    }
    return this.#iframeContainer;
  }
  pointerMove(e) {
    const {transformControlsManager, raycastManager} = this.engine;
    const {engineRenderer} = this.engine;
    const {renderer} = engineRenderer;
    const canvas = renderer.domElement;

    const _setEnabled = (enabled) => {
      if (enabled) {
        if (canvas.style.pointerEvents !== 'none') {
          canvas.style.pointerEvents = 'none';
        }
      } else {
        if (canvas.style.pointerEvents === 'none') {
          canvas.style.pointerEvents = null;
        }
      }
    };

    // console.log('check pointer move', transformControlsManager.isEnabled(), transformControlsManager.getControlsEnabled());
    if (!transformControlsManager.getControlsEnabled() && !transformControlsManager.isEnabled()) {
      const hoveredPair = raycastManager.getHoveredPair(e);
      const hoveredPhysicsApp = hoveredPair?.[0];
      // const hoveredPhysicsObject = hoveredPair?.[1];

      // console.log('got hovered physics app', hoveredPhysicsApp?.isHtmlApp, hoveredPhysicsApp);
      
      _setEnabled(!!hoveredPhysicsApp?.isHtmlApp);
    } else {
      _setEnabled(false);
    }
  }
  // registerAppIframe(app, iframeWrap) {
  //   this.appIframes.push({
  //     app,
  //     iframeWrap,
  //   });
  // }
  // update() {
  //   if (this.appIframes.length > 0) {
  //     const {engineRenderer} = this.engine;
  //     const {camera} = engineRenderer;

  //     const fov = this.#iframeContainer.getFov();

  //     for (const {app, iframeWrap} of this.appIframes) {
  //       iframeWrap.style.transform = getCameraCSSMatrix(
  //         localMatrix.copy(camera.matrixWorldInverse)
  //           .premultiply(
  //             localMatrix2.makeTranslation(0, 0, fov)
  //           )
  //           .multiply(
  //             app.matrixWorld
  //           )
  //       );
  //     }
  //   }
  // }
}