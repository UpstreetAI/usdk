import * as THREE from 'three';
import {useState, useEffect} from 'react';
import reactHelpers from '../react-helpers.js';

//

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localMatrix = new THREE.Matrix4();
const localMatrix2 = new THREE.Matrix4();

//

const {
  div,
  span,
  label,
  input,
  button,
} = reactHelpers;

//

const defaultResolution = [1024, 768];
const fakeMaterial = new THREE.MeshBasicMaterial({
  color: 0xFF0000,
});

//

const isValidUrl = u => {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
};

//

class IFrameMesh extends THREE.Mesh {
  constructor({
    // iframe,
    width,
    height,
  }) {
    const geometry = new THREE.PlaneBufferGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
      // colorWrite: false,
      // depthWrite: true,
      opacity: 0,
      transparent: true,
      blending: THREE.MultiplyBlending,
      alphaToCoverage: false,
    });
    super(geometry, material);

    // this.iframe = iframe;
  }
  
  /* onBeforeRender(renderer, scene, camera, geometry, material, group) {
    super.onBeforeRender && super.onBeforeRender.apply(this, arguments);
    
    console.log('before render', this.iframe);
  } */
}

//

export default srcUrl => ctx => {
  const {
    useApp,
    useEngineRenderer,
    usePhysicsTracker,
    useDomRenderer,
    usePhysics,
    useFrame,
    useClick,
    useResize,
    useComponentUi,
    useRaycaster,
    usePointerLockManager,
    useTransformControlsManager,
    useCleanup,
  } = ctx;

  const app = useApp();
  const physics = usePhysics();

  //

  app.name = 'html';
  app.description = 'An HTML page';
  app.isHtmlApp = true;

  //

  const {
    camera,
  } = useEngineRenderer();
  const physicsTracker = usePhysicsTracker();
  const domRenderer = useDomRenderer();
  const raycaster = useRaycaster();
  const pointerLockManager = usePointerLockManager();
  const transformControlsManager = useTransformControlsManager();

  const iframeContainer = domRenderer.getIframeContainer();

  const res = app.getComponent('resolution') ?? defaultResolution;
  const width = res[0];
  const height = res[1];
  const scale = Math.min(1/width, 1/height);

  const _makeIframe = () => {
    const iframe = document.createElement('iframe');
    iframe.classList.add('iframe');
    iframe.setAttribute('width', width); 
    iframe.setAttribute('height', height); 
    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
    // iframe.style.opacity = 0.75;
    iframe.style.background = 'white';
    iframe.style.border = '0';
    // iframe.src = srcUrl;
    // window.iframe = iframe;
    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
    iframe.style.visibility = 'hidden';
    return iframe;
  };
  let iframe = _makeIframe();

  const updateIframeSrc = () => {
    const src = app.getComponent('src');
    iframe.src = isValidUrl(src) ? src : '';
  };
  updateIframeSrc();
  
  const iframeWrap = document.createElement('div');
  iframeWrap.classList.add('iframe-wrap');
  iframeWrap.style.cssText = 'position: absolute; left: 0; top: 0; bottom: 0; right: 0;';
  iframeContainer.appendChild(iframeWrap);
  iframeWrap.appendChild(iframe);

  //
  
  let fov = 0;
  const _updateSize = () => {
    fov = iframeContainer.getFov();
    
    iframe.style.transform = 'translate(' + (globalThis.innerWidth/2 - width/2) + 'px,' + (globalThis.innerHeight/2 - height/2) + 'px) ' + getObjectCSSMatrix(
      localMatrix.compose(
        localVector.set(0, 0, 0),
        localQuaternion.set(0, 0, 0, 1),
        localVector2.setScalar(scale)
      )
    );
  };
  _updateSize();

  const object2 = new IFrameMesh({
    // iframe,
    width: width * scale,
    height: height * scale,
  });
  object2.frustumCulled = false;

  function epsilon(value) {
    return value;
  }
  function getCameraCSSMatrix( matrix ) {
    const {elements} = matrix;
    return 'matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( - elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( elements[ 4 ] ) + ',' +
      epsilon( - elements[ 5 ] ) + ',' +
      epsilon( elements[ 6 ] ) + ',' +
      epsilon( elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( - elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( - elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ')';
  }
  function getObjectCSSMatrix( matrix, cameraCSSMatrix ) {
    var elements = matrix.elements;
    var matrix3d = 'matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( - elements[ 4 ] ) + ',' +
      epsilon( - elements[ 5 ] ) + ',' +
      epsilon( - elements[ 6 ] ) + ',' +
      epsilon( - elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ')';

    /* if ( isIE ) {

      return 'translate(-50%,-50%)' +
        'translate(' + _widthHalf + 'px,' + _heightHalf + 'px)' +
        cameraCSSMatrix +
        matrix3d;

    } */

    return matrix3d;
  }
  function getCameraCSSMatrix( matrix ) {
    const {elements} = matrix;
    return 'matrix3d(' +
      epsilon( elements[ 0 ] ) + ',' +
      epsilon( - elements[ 1 ] ) + ',' +
      epsilon( elements[ 2 ] ) + ',' +
      epsilon( elements[ 3 ] ) + ',' +
      epsilon( elements[ 4 ] ) + ',' +
      epsilon( - elements[ 5 ] ) + ',' +
      epsilon( elements[ 6 ] ) + ',' +
      epsilon( elements[ 7 ] ) + ',' +
      epsilon( elements[ 8 ] ) + ',' +
      epsilon( - elements[ 9 ] ) + ',' +
      epsilon( elements[ 10 ] ) + ',' +
      epsilon( elements[ 11 ] ) + ',' +
      epsilon( elements[ 12 ] ) + ',' +
      epsilon( - elements[ 13 ] ) + ',' +
      epsilon( elements[ 14 ] ) + ',' +
      epsilon( elements[ 15 ] ) +
    ')';
  }
  // object2.onBeforeRender = (renderer) => {
  //   const context = renderer.getContext();
  //   context.disable(context.SAMPLE_ALPHA_TO_COVERAGE);
  // };
  // object2.onAfterRender = (renderer) => {
  //   const context = renderer.getContext();
  //   context.enable(context.SAMPLE_ALPHA_TO_COVERAGE);
  // };
  let physicsIds = [];
  // let staticPhysicsIds = [];
  {
    app.matrixWorld.decompose(localVector, localQuaternion, localVector2);
    localVector2.multiply(
      localVector3.set(
        width * scale,
        height * scale,
        0.001
      )
    );
    const boxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(localVector2.x, localVector2.y, localVector2.z),
      fakeMaterial
    );
    boxMesh.position.copy(localVector);
    boxMesh.quaternion.copy(localQuaternion);
    boxMesh.updateMatrixWorld();
    const physicsObject = physics.addGeometry(boxMesh);
    physicsIds.push(physicsObject);
    // staticPhysicsIds.push(physicsId);

    {
      physicsObject.name = app.name;
      physicsObject.description = app.description;
    }

    physicsTracker.addAppPhysicsObject(app, physicsObject);
    
    iframe.addEventListener('load', e => {
      iframe.style.visibility = null;
    }, {once: true});
    app.add( object2 );
  }
  useCleanup(() => {
    for (const physicsObject of physicsIds) {
      physics.removeGeometry(physicsObject);
      physicsTracker.removeAppPhysicsObject(app, physicsObject);
    }
    physicsIds.length = 0;
    // staticPhysicsIds.length = 0;
    
    iframeWrap.removeChild(iframe);
    iframeWrap.parentElement.removeChild(iframeWrap);
  });

  useClick(e => {
    // console.log('check click', transformControlsManager.isEnabled(), transformControlsManager.getControlsEnabled());
    if (!transformControlsManager.isEnabled()) {
      const hoveredPhysicsObject = raycaster.getHoveredPhysicsObject();
      if (physicsIds.includes(hoveredPhysicsObject)) {
        pointerLockManager.exitPointerLock();
      }
    }
  });

  useResize(_updateSize);

  useFrame(() => {
    iframeWrap.style.transform = getCameraCSSMatrix(
      localMatrix.copy(camera.matrixWorldInverse)
        .premultiply(
          localMatrix2.makeTranslation(0, 0, fov)
        )
        .multiply(
          app.matrixWorld
        )
    );
  });
  // domRenderer.registerAppIframe(app, iframeWrap);

  // register components ui

  app.addEventListener('componentsupdate', e => {
    const {keys} = e;
    if (keys.includes('src')) {
      updateIframeSrc();
    }
  });

  useComponentUi(({
    // contentPath,
    // setContentPath,
  }) => {
    const [src, setSrc] = useState(app.getComponent('src') ?? '');
    const [srcFocused, setSrcFocused] = useState(false);
    
    //

    useEffect(() => {
      if (!srcFocused) {
        const oldSrc = app.getComponent('src');
        if (src !== oldSrc) {
          app.setComponent('src', src);
        }
      }
    }, [
      src,
      srcFocused,
    ]);

    //

    return div([
      div([
        label([
          span('Src'),
          input({
            type: 'text',
            onChange: e => {
              setSrc(e.target.value);
            },
            value: src,
            placeholder: 'https://',

            onFocus: () => {
              setSrcFocused(true);
            },
            onBlur: () => {
              setSrcFocused(false);
            },
          }),
        ]),
      ]),
    ]);
  });
  
  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'html';
// export const components = ${this.components};