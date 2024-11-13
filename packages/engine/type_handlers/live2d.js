import * as THREE from 'three';
import {Application, Ticker} from 'pixi.js';
import {Live2DModel} from '../../pixi-live2d-display/src/Live2DModel.ts';

let registeredTicker = false;
export default srcUrl => ctx => {
  if (!registeredTicker) {
    Live2DModel.registerTicker(Ticker);
    registeredTicker = true;
  }

  //

  const {
    useApp,
    // useFrame,
    // useActivate,
    // useCleanup,
    // useCamera,
    // usePhysics,
    // useExport,
    // useLoaders,
    // useAvatarManager,
    // useTempManager,
    // useEngine,
  } = ctx;
  const app = useApp();

  app.appType = 'live2d';

  app.setVolume = (v) => {
    // console.log('set live2d volume', v);
  };
  app.setEmotion = (v) => {
    // console.log('set live2d emotion', v);
  };

  //

  let snapped = false;
  ctx.waitUntil((async () => {
    const u = srcUrl;
    const res2 = await fetch(u);
    const cubism4Model = await res2.json();
    cubism4Model.url = u;
  
    //
  
    let canvasWidth = 600;
    let canvasHeight = 600;
  
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `\
      position: fixed;
      bottom: 0;
      left: 512px;
      width: 512px;
      height: 512px;
      z-index: 1;
    `;
    // document.body.appendChild(canvas);
  
    const pixiApp = new Application({
      view: canvas,
    });
    pixiApp.renderer.view.width = canvasWidth;
    pixiApp.renderer.view.height = canvasHeight;
    pixiApp.renderer.backgroundAlpha = 0;
  
    const model4 = await Live2DModel.from(cubism4Model);
  
    // app.stage.addChild(model2);
    pixiApp.stage.addChild(model4);

    const internalModel = model4.internalModel;
    const bounds = model4.getBounds();
    const {
      width,
      height,
    } = bounds;
    /* console.log('got model', {
      model: model4,
      bounds,
      // viewport,
      internalModel,
      // width,
      // height,
    }); */
  
    const s = Math.min(canvasWidth / width, canvasHeight / height);
    model4.scale.set(s);
    // model4.scale.set(scaleFactor);
  
    // offset to fit:
    model4.x = canvasWidth / 2 - width * s / 2;

    //

    canvasHeight = canvasWidth * bounds.height / bounds.width;
    
    pixiApp.renderer.view.width = canvasWidth;
    pixiApp.renderer.view.height = canvasHeight;

    //

    const planeMesh = (() => {
      const h = 1;
      const w = h * bounds.width / bounds.height;

      const geometry = new THREE.PlaneBufferGeometry(w, h);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          map: {
            value: new THREE.Texture(canvas),
            needsUpdate: true,
          },
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
            gl_FragColor = texture2D(map, vUv);

            // if backface, make it black
            if (gl_FrontFacing == false) {
              gl_FragColor.rgb = vec3(0.0);
            }

            // if alpha is 0, discard
            if (gl_FragColor.a < 0.5) {
              discard;
            }
          }
        `,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(0, h / 2, 0);
      mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);

      // recurse frame updates
      let frame;
      const _recurse = () => {
        frame = requestAnimationFrame(_recurse);

        if (!snapped) {
          snapped = true;

          const checkSnap = () => {
            const canvas2 = document.createElement('canvas');
            canvas2.width = canvas.width;
            canvas2.height = canvas.height;
            const ctx2 = canvas2.getContext('2d');
            ctx2.drawImage(canvas, 0, 0);
            const imageData = ctx2.getImageData(0, 0, canvas.width, canvas.height);
            // console.log('got', imageData);

            // compute the bounding box
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            for (let y = 0; y < imageData.height; y++) {
              for (let x = 0; x < imageData.width; x++) {
                const i = (y * imageData.width + x) * 4;
                const r = imageData.data[i + 0];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                const a = imageData.data[i + 3];

                if (a > 0.9) {
                  minX = Math.min(minX, x);
                  minY = Math.min(minY, y);
                  maxX = Math.max(maxX, x);
                  maxY = Math.max(maxY, y);
                }
              }
            }
            // console.log('got bounding box', [
            //   minX, minY,
            //   maxX, maxY,
            // ], {
            //   canvasWidth,
            //   canvasHeight,
            // });

            const boundwidth = maxX - minX;
            const boundheight = maxY - minY;

            if (boundwidth > 0 && boundheight > 0) {
              const avatarHeight = 1.8;
              const scale = avatarHeight / (boundheight / canvasHeight);
              console.log('got scale', scale);
              mesh.position.y -= ((canvasHeight - maxY) / canvasHeight) * h;
              mesh.scale.setScalar(scale);
              mesh.updateMatrixWorld();
            } else {
              requestAnimationFrame(checkSnap);
            }
          };
          // globalThis.checkSnap = checkSnap;
          checkSnap();
        }

        material.uniforms.map.value.needsUpdate = true;
      };
      frame = requestAnimationFrame(_recurse);

      return mesh;
    })();
    app.add(planeMesh);
    planeMesh.updateMatrixWorld();
  })());

  //

  return app;
};