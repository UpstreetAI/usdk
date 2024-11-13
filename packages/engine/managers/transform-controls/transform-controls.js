import {
  TransformControls,
} from '../../transform-controls/TransformControls.js';

//
export class TransformControlsManager extends EventTarget {
  constructor({
    engineRenderer,
    physicsTracker,
    appManagerContext,
    raycastManager,
  }) {
    super();

    this.engineRenderer = engineRenderer;
    this.physicsTracker = physicsTracker;
    this.appManagerContext = appManagerContext;
    this.raycastManager = raycastManager;

    this.transformControls = new Set();
    this.transformControlsEnabled = false;

    this.hoveredPhysicsApp = null;
    this.hoveredPhysicsObject = null;
  }

  createTransformControls() {
    const {renderer, scene, camera} = this.engineRenderer;
    const transformControls = new TransformControls(camera, renderer.domElement);
    scene.add(transformControls);
    transformControls.updateMatrixWorld();
    transformControls.setMode('translate');

    const modes = [
      'translate',
      'rotate',
      'scale',
    ];
    transformControls.toggleMode = function() {
      const mode = this.getMode();
      const index = modes.indexOf(mode);
      const newMode = modes[(index + 1) % modes.length];
      this.setMode(newMode);
    };

    this.transformControls.add(transformControls);

    return transformControls;
  }
  destroyTransformControls(transformControls) {
    transformControls.parent.remove(transformControls);

    this.transformControls.delete(transformControls);
  }

  isEnabled() {
    return this.transformControls.size > 0;
  }
  isHovered() {
    for (const transformControls of this.transformControls) {
      if (transformControls.axis !== null) {
        return true;
      }
    }
    return false;
  }
  toggleMode() {
    for (const transformControls of this.transformControls) {
      transformControls.toggleMode();
    }
  }

  pointerDown(e) {
    let handled = false;
    for (const transformControls of this.transformControls) {
      if (transformControls._onPointerDown(e)) {
        handled = true;
      }
    }
    return handled;
  }
  pointerUp(e) {
    let handled = false;
    for (const transformControls of this.transformControls) {
      if (transformControls._onPointerUp(e)) {
        handled = true;
      }
    }

    // try to select hovered physics object
    if (!handled) {
      if (this.hoveredPhysicsObject) {
        this.dispatchEvent(new MessageEvent('select', {
          data: {
            app: this.hoveredPhysicsApp,
            physicsObject: this.hoveredPhysicsObject,
          },
        }));

        handled = true;
      } else {
        this.dispatchEvent(new MessageEvent('select', {
          data: {
            app: null,
            physicsObject: null,
          },
        }));
      }
    }

    return handled;
  }
  clearHoveredPhysicsObject() {
    if (this.hoveredPhyiscsApp) {
      this.hoveredPhysicsApp = null;
    }
    if (this.hoveredPhysicsObject) {
      this.hoveredPhysicsObject.parent.remove(this.hoveredPhysicsObject);
      this.hoveredPhysicsObject = null;
    }
  }
  clearSelectedPhysicsObject() {
    const transformControlsArray = Array.from(this.transformControls);
    for (const transformControls of transformControlsArray) {
      transformControls.detach();
      this.destroyTransformControls(transformControls);
    }
  }
  pointerMove(e) {
    let handled = false;
    for (const transformControls of this.transformControls) {
      if (transformControls._onPointerMove(e)) {
        handled = true;
      }
    }

    if (!handled) {
      this.clearHoveredPhysicsObject();

      if (this.transformControlsEnabled) {
        const hoveredPair = this.raycastManager.getHoveredPair(e);
        const app = hoveredPair?.[0];
        const physicsObject = hoveredPair?.[1];
        if (app && physicsObject) {
          const appManagers = this.appManagerContext.getAppManagers();
          for (const appManager of appManagers) {
            if (appManager.isEditable()) {
              const apps = appManager.getApps();
              if (apps.includes(app) && !physicsObject.isTerrain) {
                this.hoveredPhysicsApp = app;

                const {scene} = this.engineRenderer;
                this.hoveredPhysicsObject = physicsObject;
                scene.add(this.hoveredPhysicsObject);
              }
            }
          }
        }
      }
    }

    return handled;
  }
  pointerHover(e) {
    let handled = false;
    for (const transformControls of this.transformControls) {
      if (transformControls._onPointerHover(e)) {
        handled = true;
      }
    }
    return handled;
  }

  getControlsEnabled() {
    return this.transformControlsEnabled;
  }
  setControlsEnabled(enabled) {
    this.transformControlsEnabled = enabled;

    if (!enabled) {
      this.clearHoveredPhysicsObject();
    }
  }

  update(timestamp, timeDiff) {
    for (const transformControls of this.transformControls) {
      transformControls.updateMatrixWorld();
    }
  }
}