import * as THREE from 'three';
import {
  useState,
  useEffect,
} from 'react';
import {
  makePromise,
} from '../util.js';
import reactHelpers from '../react-helpers.js';

const {
  div,
  span,
  label,
  input,
  button,
} = reactHelpers;

//

const baseSize = 3;

//

export default srcUrl => ctx => {
  const {
    useApp,
    usePhysics,
    useComponentUi,
    useCleanup,
  } = ctx;

  const app = useApp();
  // const {gifLoader} = useLoaders();
  const physics = usePhysics();

  //

  app.name = 'Video';
  app.description = 'A video file.';

  //

  app.video = null;

  // const srcUrl = ${this.srcUrl};
  // console.log('got gif 1');

  const canPlayThroughPromise = makePromise();
  const waitForCanPlayThrough = () => canPlayThroughPromise;

  const physicsIds = [];
  // const staticPhysicsIds = [];
  ctx.waitUntil((async () => {
    const video = await (async() => {
      for (let i = 0; i < 10; i++) { // hack: give it a few tries, sometimes videos fail for some reason
        try {
          const video = await new Promise((accept, reject) => {
            const vid = document.createElement('video');
            vid.volume = app.getComponent('volume') ?? 1;
            vid.loop = app.getComponent('loop') ?? false;
            vid.oncanplaythrough = () => {
              accept(vid);
              // startMonetization(instanceId, monetizationPointer, ownerAddress);
              // _cleanup();
            };
            vid.onerror = err => {
              const err2 = new Error('failed to load video: ' + srcUrl + ': ' + err);
              reject(err2);
              // _cleanup();
            }
            /* const _cleanup = () => {
              gcFiles && URL.revokeObjectURL(u);
            }; */
            vid.crossOrigin = 'Anonymous';
            vid.referrPolicy = 'no-referrer-on-downgrade';
            vid.src = srcUrl;
            console.log('load src', srcUrl);
          });
          return video;
        } catch(err) {
          console.warn(err);
        }
      }
      throw new Error('failed to load video: ' + srcUrl);
    })();
    // console.log('load video', video);
    app.video = video;
    canPlayThroughPromise.resolve(video);

    app.addEventListener('componentsupdate', e => {
      const {keys} = e;
      if (keys.includes('volume')) {
        const volume = app.getComponent('volume');
        video.volume = volume;
      }
      if (keys.includes('loop')) {
        const loop = app.getComponent('loop');
        video.loop = loop;
      }
    });

    useCleanup(() => {
      video.pause();
    });

    //
    
    let {
      videoWidth: width,
      videoHeight: height,
    } = video;
    if (width >= height) {
      height /= width;
      width = 1;
    }
    if (height >= width) {
      width /= height;
      height = 1;
    }
    width *= baseSize;
    height *= baseSize;
    const geometry = new THREE.PlaneBufferGeometry(width, height);
    geometry.boundingBox = new THREE.Box3(
      new THREE.Vector3(-width/2, -height/2, -0.1),
      new THREE.Vector3(width/2, height/2, 0.1),
    );
    const colors = new Float32Array(geometry.attributes.position.array.length);
    colors.fill(1, 0, colors.length);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const texture = new THREE.VideoTexture(video);
    texture.anisotropy = 16;
    // texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      // color: 0x000000,
      
      // vertexColors: true,
      // transparent: true,
      // alphaTest: 0.5,
    });
    /* const material = meshComposer.material.clone();
    material.uniforms.map.value = texture;
    material.uniforms.map.needsUpdate = true; */

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    // mesh.contentId = contentId;
    app.add(mesh);
    mesh.updateMatrixWorld();

    // console.log('add mesh', {
    //   mesh,
    //   width,
    //   height,
    // });
    
    const physicsId = physics.addBoxGeometry(
      app.position,
      app.quaternion,
      new THREE.Vector3(width, height, 0.01),
      false
    );
    physicsIds.push(physicsId);
    // staticPhysicsIds.push(physicsId);

    useCleanup(() => {
      for (const physicsId of physicsIds) {
        physics.removeGeometry(physicsId);
      }
      physicsIds.length = 0;
      // staticPhysicsIds.length = 0;
    });
  })());

  //

  // register components ui
  useComponentUi(({
    contentPath,
    setContentPath,
  }) => {
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(() => app.getComponent('volume') ?? 1);
    const [loop, setLoop] = useState(() => !!app.getComponent('loop'));

    // listen for components
    useEffect(() => {
      const oldVolume = app.getComponent('volume');
      if (volume !== oldVolume) {
        app.setComponent('volume', volume);
      }
    }, [
      volume,
    ]);
    useEffect(() => {
      const oldLoop = app.getComponent('loop');
      if (loop !== oldLoop) {
        app.setComponent('loop', loop);
      }
    }, [
      loop,
    ]);

    // listen for video play state change
    useEffect(() => {
      (async () => {
        const video = await waitForCanPlayThrough();
        const _update = () => {
          setPlaying(!video.paused);
        };
        video.addEventListener('play', _update);
        video.addEventListener('pause', _update);
      })();
    }, []);

    return div([
      div([
        label([
          span('Play'),
          div([
            button({
              onClick: async () => {
                const video = await waitForCanPlayThrough();
                if (!playing) {
                  video.play();
                } else {
                  video.pause();
                }
              },
            }, [
              !playing ? 'Play' : 'Pause',
            ]),
          ]),
        ]),
      ]),

      div([
        label([
          span('Volume'),
          input({
            type: 'number',
            min: 0,
            max: 1,
            step: 0.01,
            value: volume,
            onChange: e => {
              setVolume(e.target.value);
            },
          }),
        ]),
      ]),

      div([
        label([
          span('Loop'),
          input({
            type: 'checkbox',
            onChange: e => {
              setLoop(e.target.checked);
            },
            checked: loop,
          }),
        ]),
      ]),
    ]);
  });

  return app;
};