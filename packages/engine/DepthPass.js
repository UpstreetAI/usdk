import {
	Color,
	MeshNormalMaterial,
	NearestFilter,
	NoBlending,
	WebGLRenderTarget,
	Scene,
	DepthTexture,
	RGBAFormat,
} from 'three';
import {Pass} from 'three/examples/jsm/postprocessing/Pass.js';

const localColor = new Color();

// const oldParentCache = new WeakMap();
// const oldMaterialCache = new WeakMap();

/**
 * Depth-of-field post-process with bokeh shader
 */

const _makeNormalRenderTarget = (width, height) => {
	return new WebGLRenderTarget(width, height, {
		minFilter: NearestFilter,
		magFilter: NearestFilter,
		format: RGBAFormat,
		depthTexture: new DepthTexture(width, height),
	});
};
class DepthPass extends Pass {

	constructor(scene, camera, {width, height, onBeforeRenders, onAfterRenders}) {

		super();

		this.isDepthPass = true;

    this.scene = scene;
    this.camera = camera;
    this.width = width;
    this.height = height;
    this.onBeforeRenders = onBeforeRenders;
	this.onAfterRenders = onAfterRenders;

		/* this.beautyRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: RGBAFormat
		} ); */

		// normal render target with depth buffer

		this.normalRenderTarget = _makeNormalRenderTarget(this.width, this.height);
		this.normalRenderTarget.name = 'DepthPass.normal';

    this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

    // this.customScene = new Scene();
	// 	this.customScene.autoUpdate = false;
    // this._visibilityCache = new Map();
    // this.originalClearColor = new Color();
	}

	setSize(width, height) {
		this.width = width;
		this.height = height;

		this.normalRenderTarget.dispose();
		this.normalRenderTarget.depthTexture.dispose();

		this.normalRenderTarget.setSize(width, height);
		this.normalRenderTarget.depthTexture.image.width = width;
		this.normalRenderTarget.depthTexture.image.height = height;
	}

  renderOverride(renderer, overrideMaterial, renderTarget, clearColor, clearAlpha) {
	renderer.getClearColor(localColor);
    const originalClearAlpha = renderer.getClearAlpha();
    const originalAutoClear = renderer.autoClear;

	// console.log('set render target', this.renderToScreen ? null : renderTarget);
    renderer.setRenderTarget(this.renderToScreen ? null : renderTarget);
    renderer.autoClear = false;

    clearColor = overrideMaterial.clearColor || clearColor;
    clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

    if ((clearColor !== undefined) && (clearColor !== null)) {

      renderer.setClearColor(clearColor);
      renderer.setClearAlpha(clearAlpha);
      renderer.clear();

    }

	for (const onBeforeRender of this.onBeforeRenders) {
		onBeforeRender();
	}

		// for (const scene of this.scenes) {
			/* const cachedNodes = [];
			const _recurse = o => {
				if (o.isMesh && o.customPostMaterial) {
					cachedNodes.push(o);
				} else {
					for (const child of o.children) {
						_recurse(child);
					}
				}
			};
		
      _recurse(scene); */

			/* for (const o of cachedNodes) {
				oldParentCache.set(o, o.parent);
				oldMaterialCache.set(o, o.material);

				o.material = o.customPostMaterial;
				this.customScene.add(o);
			}
			{
				const pop = this.onBeforeRenderScene(scene);
			  
				renderer.render(this.customScene, this.camera);
				
				pop();
			} */

			{
				// const pop = this.onBeforeRenderScene(scene);
				
				this.scene.overrideMaterial = overrideMaterial;
				renderer.render(this.scene, this.camera);
				this.scene.overrideMaterial = null;
				
				// pop();
			}

			/* for (const child of cachedNodes) {
				oldParentCache.get(child).add(child);
				child.material = oldMaterialCache.get(child);

				oldParentCache.delete(child);
				oldMaterialCache.delete(child);
			} */
		// }

	for (const onAfterRender of this.onAfterRenders) {
		onAfterRender();
	}

    // restore original state

    renderer.autoClear = originalAutoClear;
    renderer.setClearColor(this.originalClearColor);
    renderer.setClearAlpha(originalClearAlpha);
  }

	render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
		// render beauty

		// renderer.setRenderTarget( this.normalRenderTarget );
		// renderer.clear();
		// renderer.render( this.scene, this.camera );

		// render normals and depth (honor only meshes, points and lines do not contribute to SSAO)

		// this.overrideVisibility();
		this.renderOverride(renderer, this.normalMaterial, this.normalRenderTarget, 0xffffff, 1.0);
		// this.renderOverride(renderer, this.normalMaterial, writeBuffer, 0xffffff, 1.0);
		// this.restoreVisibility();
  }

  /* overrideVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;
		const self = this;

		for (const scene of this.scenes) {
			scene.traverse( function ( object ) {

				cache.set( object, object.visible );

				if ( object.isPoints || object.isLine ) object.visible = false;

			} );
	  }

	}

	restoreVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;

		for (const scene of this.scenes) {
			scene.traverse( function ( object ) {

				const visible = cache.get( object );
				object.visible = visible;

			} );
		}

		cache.clear();

	} */

}

export {DepthPass};