import * as THREE from 'three';
import {
  useState,
  useEffect,
} from 'react';

import {
  getObjectUrl,
} from '../../app-runtime/import-manager.js';

import reactHelpers from '../react-helpers.js';

const {
  div,
  span,
  label,
  input,
  button,
} = reactHelpers;

//

const planeWidth = 3;
const planeHeight = planeWidth;
const heightOffset = planeHeight / 2;
const defaultDepth = 1;

const fakeMaterial = new THREE.MeshBasicMaterial({
  color: 0xFF0000,
});

//

const loadImage = async ({
  imageUrl,
  gifLoader,

  signal,
}) => {
  if (/\.gif$/.test(imageUrl)) {
    const gifId = await gifLoader.createGif(imageUrl);
    const gifLoaderCleanup = () => {
      gifLoader.destroyGif(gifId);
    };
    if (signal.aborted) {
      gifLoaderCleanup();
      return;
    }
    const frames = await gifLoader.renderFrames(gifId);
    gifLoaderCleanup();
    if (signal.aborted) return;

    signal.addEventListener('abort', () => {
      for (const frame of frames) {
        frame.close();
      }
    });

    //

    const firstImageBitmap = frames[0];
    // setScale(firstImageBitmap);

    const textures = frames.map(frame => {
      const t = new THREE.Texture(frame);
      t.anisotropy = 16;
      // t.encoding = THREE.sRGBEncoding;
      t.needsUpdate = true;
      return t;
    });

    return {
      imageBitmap: firstImageBitmap,
      update: (mesh) => {
        const now = performance.now();
        const f = (now % 2000) / 2000;
        const frameIndex = Math.floor(f * textures.length);
        mesh.material.uniforms.map.value = textures[frameIndex];
        mesh.material.uniforms.map.value.needsUpdate = true;
      },
    };
  } else {
    const res = await fetch(imageUrl, {
      signal,
    });
    const blob = await res.blob();
    if (signal.aborted) return;

    const imageBitmap = await createImageBitmap(blob, {
      imageOrientation: 'flipY',
    });
    
    signal.addEventListener('abort', () => {
      imageBitmap.close();
    });

    // this.material.uniforms.map.value.image = imageBitmap;
    // this.material.uniforms.map.value.needsUpdate = true;

    // setScale(imageBitmap);

    return {
      imageBitmap,
      update() {
        // nothing
      },
    };
  }
};

//

const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight)
class ImageMesh extends THREE.Mesh {
  constructor() {
    const geometry = planeGeometry;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: new THREE.Texture(),
          needsUpdate: true,
        },
        planeSize: { // plane width, height
          value: new THREE.Vector2(planeWidth, planeHeight),
          needsUpdate: true,
        },
      },
      vertexShader: `\
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `\
        uniform sampler2D map;
        uniform vec2 planeSize;
        
        varying vec2 vUv;

        void main() {
          const vec2 imageScale = vec2(1.);

          // use CSS-style 'contain' mode to bound the image to the plane's aspect ratio

          vec2 uv = vUv;

          vec2 planeAspect = planeSize.x > planeSize.y ? vec2(1., planeSize.y / planeSize.x) : vec2(planeSize.x / planeSize.y, 1.);
          vec2 imageAspect = imageScale.x > imageScale.y ? vec2(1., imageScale.y / imageScale.x) : vec2(imageScale.x / imageScale.y, 1.);
          vec2 aspect = planeAspect / imageAspect;

          vec2 offset = vec2(0.5) - vec2(0.5) * aspect;
          uv = uv * aspect + offset;

          // if in range
          if (uv.x >= 0. && uv.x <= 1. && uv.y >= 0. && uv.y <= 1.) {
            gl_FragColor = texture2D(map, uv);
          } else {
            gl_FragColor = vec4(0.);
          }

          // black out backface
          if (gl_FrontFacing == false) {
            gl_FragColor.rgb = vec3(0.);
          }

          // discard based on alpha
          if (gl_FragColor.a < 0.5) {
            discard;
          }
        }
      `,
      side: THREE.DoubleSide,
    });
    super(geometry, material);

    //

    this.updateFn = null;
  }
  update() {
    this.updateFn(this);
  }
  setPack({
    imageBitmap,
    update,
  }) {
    this.material.uniforms.map.value.image = imageBitmap;
    this.material.uniforms.map.value.needsUpdate = true;

    const setScale = imageBitmap => {
      // set the plane scale to make the max dimension 1m, without changing the aspect ratio
      const maxDimension = Math.max(imageBitmap.width, imageBitmap.height);
      this.scale.set(
        imageBitmap.width / maxDimension,
        imageBitmap.height / maxDimension,
        1,
      );
      this.updateMatrixWorld();
    };
    setScale(imageBitmap);

    this.updateFn = update;
  }
  destroy() {
    this.material.dispose();
  }
}
const fullscreenPlaneGeometry = new THREE.PlaneGeometry(2, 2);
class FullscreenImageMesh extends THREE.Mesh {
  constructor({
    canvas,
  }) {
    const geometry = fullscreenPlaneGeometry;
    const material = new THREE.ShaderMaterial({
      uniforms: {
        map: {
          value: new THREE.Texture(),
          needsUpdate: true,
        },
        planeSize: { // plane width, height
          value: new THREE.Vector2(planeWidth, planeHeight),
          needsUpdate: true,
        },
        uDepth: {
          value: defaultDepth,
          needsUpdate: true,
        },
      },
      vertexShader: `\
        uniform float uDepth;
        varying vec2 vUv;
        void main() {
          vUv = uv;

          vec4 depthPosition = projectionMatrix * vec4(0., 0., -uDepth, 1.);

          vec3 p = position;
          p.z = depthPosition.z / depthPosition.w;
          gl_Position = vec4(p, 1.);
        }
      `,
      fragmentShader: `\
        uniform sampler2D map;
        uniform vec2 planeSize;
        
        varying vec2 vUv;

        void main() {
          const vec2 imageScale = vec2(1.);

          // use CSS-style 'contain' mode to bound the image to the plane's aspect ratio

          vec2 uv = vUv;

          vec2 planeAspect = planeSize.x > planeSize.y ? vec2(1., planeSize.y / planeSize.x) : vec2(planeSize.x / planeSize.y, 1.);
          vec2 imageAspect = imageScale.x > imageScale.y ? vec2(1., imageScale.y / imageScale.x) : vec2(imageScale.x / imageScale.y, 1.);
          vec2 aspect = planeAspect / imageAspect;

          vec2 offset = vec2(0.5) - vec2(0.5) * aspect;
          uv = uv * aspect + offset;

          // if in range
          if (uv.x >= 0. && uv.x <= 1. && uv.y >= 0. && uv.y <= 1.) {
            gl_FragColor = texture2D(map, uv);
          } else {
            gl_FragColor = vec4(vec3(0.), 1.);
          }

          // black out backface
          if (gl_FrontFacing == false) {
            gl_FragColor.rgb = vec3(0.);
          }
        }
      `,
      side: THREE.DoubleSide,
    });
    super(geometry, material);

    this.canvas = canvas;
    this.updateFn = null;
  }
  update() {
    this.material.uniforms.planeSize.value.set(
      this.canvas.width,
      this.canvas.height
    );
    this.material.uniforms.planeSize.needsUpdate = true;

    this.updateFn(this);
  }
  setPack({
    imageBitmap,
    update,
  }) {
    this.material.uniforms.map.value.image = imageBitmap;
    this.material.uniforms.map.value.needsUpdate = true;

    const setScale = imageBitmap => {
      // set the plane scale to make the max dimension 1m, without changing the aspect ratio
      const maxDimension = Math.max(imageBitmap.width, imageBitmap.height);
      this.scale.set(
        imageBitmap.width / maxDimension,
        imageBitmap.height / maxDimension,
        1,
      );
      this.updateMatrixWorld();
    };
    setScale(imageBitmap);

    this.updateFn = update;
  }
  setDepth(depth) {
    this.material.uniforms.uDepth.value = depth;
    this.material.uniforms.uDepth.needsUpdate = true;
  }
  destroy() {
    this.material.dispose();
  }
}

//

export default srcUrl => ctx => {
  const {
    useApp,
    usePhysics,
    usePhysicsTracker,
    useEngineRenderer,
    useLoaders,
    useFrame,
    useComponentUi,
    useCleanup,
  } = ctx;

  const app = useApp();
  const physicsScene = usePhysics();
  const physicsTracker = usePhysicsTracker();
  const engineRenderer = useEngineRenderer();
  const canvas = engineRenderer.renderer.domElement;
  const {gifLoader} = useLoaders();

  app.appType = 'image';
  app.name = srcUrl.match(/([^\/]*)$/)[1];
  app.description = 'An image file';

  //

  app.img = null;
  app.headBone = null;

  //

  app.setVolume = v => {};
  app.setEmotion = e => {};

  //

  // const fullscreen = !!app.getComponent('fullscreen');

  const loadModel = async (srcUrl, {
    signal,
  }) => {
    const cleanups = [];

    const imageMesh = new ImageMesh();
    imageMesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    cleanups.push(() => {
      imageMesh.destroy();
    });
    // imageMesh.visible = !fullscreen;

    const fullscreenImageMesh = new FullscreenImageMesh({
      canvas,
    });
    cleanups.push(() => {
      fullscreenImageMesh.destroy();
    });
    // fullscreenImageMesh.visible = fullscreen;

    const imagePack = await loadImage({
      imageUrl: srcUrl,
      gifLoader,

      signal,
    });
    imageMesh.setPack(imagePack);
    fullscreenImageMesh.setPack(imagePack);

    return {
      imageMesh,
      fullscreenImageMesh,
      cleanups,
    };
  };
  const loadSrc = async (srcUrl, {
    signal,
  }) => {
    // clean up existing model
    for (const fn of modelCleanupFns) {
      fn();
    }
    modelCleanupFns = [];

    // load model
    const {
      imageMesh,
      fullscreenImageMesh,
      cleanups: _modelCleanupFns,
    } = await loadModel(srcUrl, {
      signal,
    });

    // add meshes
    {
      app.add(imageMesh);
      imageMesh.updateMatrixWorld();

      _modelCleanupFns.push(() => {
        imageMesh.parent.remove(imageMesh);
      });
    }
    {
      app.add(fullscreenImageMesh);
      fullscreenImageMesh.updateMatrixWorld();

      _modelCleanupFns.push(() => {
        fullscreenImageMesh.parent.remove(fullscreenImageMesh);
      });
    }

    // add physics
    if (app.getComponent('physics')) {
      const boxGeometry = new THREE.BoxBufferGeometry(
        planeWidth * imageMesh.scale.x,
        planeHeight * imageMesh.scale.y,
        0.01
      );
      const planeMesh = new THREE.Mesh(boxGeometry, fakeMaterial);
      planeMesh.visible = false;
      app.add(planeMesh);
      planeMesh.updateMatrixWorld();

      const physicsObject = physicsScene.addGeometry(planeMesh);

      physicsObject.name = app.name;
      physicsObject.description = app.description;

      physicsTracker.addAppPhysicsObject(app, physicsObject);

      _modelCleanupFns.push(() => {
        physicsScene.removeGeometry(physicsObject);
        physicsTracker.removeAppPhysicsObject(app, physicsObject);
      });
    }

    // latch
    app.imageMesh = imageMesh;
    app.fullscreenImageMesh = fullscreenImageMesh;

    const headBone = new THREE.Object3D();
    headBone.position.y = heightOffset;
    app.add(headBone);
    headBone.updateMatrixWorld();
    app.headBone = headBone;

    modelCleanupFns = _modelCleanupFns;
  };
  let modelCleanupFns = [];
  useCleanup(() => {
    for (const fn of modelCleanupFns) {
      fn();
    }
  });

  //

  const abortController = new AbortController();
  useCleanup(() => {
    abortController.abort();
  });


  ctx.waitUntil((async () => {
    const {signal} = abortController;
    await loadSrc(srcUrl, {
      signal,
    });

    app.addEventListener('contentupdate', async e => {
      const newSrcUrl = getObjectUrl(app.spec);
      await loadSrc(newSrcUrl, {
        signal,
      });
    });

    app.addEventListener('componentsupdate', async e => {
      if (e.keys.includes('depth')) {
        const depth = e.value ?? defaultDepth;
        app.fullscreenImageMesh.setDepth(depth);
      }
    });
  })());

  //

  useFrame(() => {
    if (app.imageMesh) {
      const fullscreen = !!app.getComponent('fullscreen');
      app.imageMesh.visible = !fullscreen;
      app.fullscreenImageMesh.visible = fullscreen;

      if (app.imageMesh.visible) {
        app.imageMesh.update();
      }
      if (app.fullscreenImageMesh.visible) {
        app.fullscreenImageMesh.update();
      }
    }
  });

  //

  // register components ui
  useComponentUi(({
    contentPath,
    setContentPath,
    debug,
  }) => {
    const [fullscreen, setFullscreen] = useState(() => !!app.getComponent('fullscreen'));
    const [depth, setDepth] = useState(() => app.getComponent('depth') ?? defaultDepth);

    //

    useEffect(() => {
      const oldFullscreen = app.getComponent('fullscreen');
      if (fullscreen !== oldFullscreen) {
        app.setComponent('fullscreen', fullscreen);
      }
      const oldDepth = app.getComponent('depth');
      if (depth !== oldDepth) {
        app.setComponent('depth', depth);
      }
    }, [
      fullscreen,
      depth,
    ]);

    //

    return div([
      div([
        label([
          span('Fullscreen'),
          input({
            type: 'checkbox',
            onChange: e => {
              setFullscreen(e.target.checked);
            },
            checked: fullscreen,
          }),
        ]),
      ]),

      div([
        label([
          span('Depth'),
          input({
            type: 'number',
            value: depth,
            min: 0,
            max: 10,
            step: 0.1,
            onChange: e => {
              setDepth(e.target.checked);
            },
          }),
        ]),
      ]),
    ]);
  });

  //

  return app;
};