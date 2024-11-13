// import * as THREE from 'three';

//

// const localVector = new THREE.Vector3();
// const localVector2D = new THREE.Vector2();

//

export default srcUrl => ctx => {
  const {
    useApp,
    useRealmManager,
    useAudioManager,
    useLoaders,
    useCleanup,
    useAvatar,
    useDanceManager,
  } = ctx;

  const app = useApp();
  const realmManager = useRealmManager();
  const audioManager = useAudioManager();
  const loaders = useLoaders();
  const {
    gltfLoader,
    fbxLoader,
  } = loaders;
  const Avatar = useAvatar();
  const danceManager = useDanceManager();

  app.appType = 'dance';

  ctx.waitUntil((async () => {
    // load target vrm
    const rootScene = realmManager.getRootRealm();

    const res = await fetch(srcUrl);
    const json = await res.json();

    const {
      avatarUrl,
      audioUrl,
      animationUrl,
    } = json;

    const vrmObject = await new Promise((accept, reject) => {
      gltfLoader.load(avatarUrl, o => {
        accept(o);
      }, function onprogress() {}, reject);
    });
    const {
      skeleton,
      modelBones,
    } = Avatar.bindAvatar(vrmObject);

    const vrmApp = vrmObject.scene;
    vrmApp.traverse(o => {
      if (o.isMesh) {
        o.frustumCulled = false;
      }
    });
    rootScene.add(vrmApp);

    // load animation fbx
    const fbxSrc = await new Promise((accept, reject) => {
      fbxLoader.load(animationUrl, accept, function onprogress() {}, reject);
    });

    const {audioContext} = audioManager;

    const audioRes = await fetch(audioUrl);
    const arrayBuffer = await audioRes.arrayBuffer();
    const audioBuffer = await new Promise((accept, reject) => {
      audioContext.decodeAudioData(arrayBuffer, accept, reject);
    });
    const audioBufferSourceNode = audioContext.createBufferSource();
    audioBufferSourceNode.buffer = audioBuffer;

    // load the animation
    const animateVrmFbx = danceManager.makeFbxAnimator({
      fbxSrc,
      skeleton,
      modelBones,
    });

    (async () => {
      // if the audio context is suspended wait for audio context to start
      if (audioContext.state !== 'running') {
        const click = () => {
          audioContext.resume();
          console.log('resumed audio context');

          cleanup();
        };
        window.addEventListener('click', click);

        const cleanup = () => {
          window.removeEventListener('click', click);
        };
        useCleanup(cleanup);

        await new Promise((accept, reject) => {
          const statechange = () => {
            audioContext.removeEventListener('statechange', statechange);
            accept();

            cleanup();
          };
          audioContext.addEventListener('statechange', statechange);

          const cleanup = () => {
            audioContext.removeEventListener('statechange', statechange);
          };
        });

        cleanup();
      }

      audioBufferSourceNode.connect(audioContext.destination);
      audioBufferSourceNode.start();

      const recurse = () => {
        frame = requestAnimationFrame(recurse);

        const t = audioContext.currentTime;
        animateVrmFbx(t);

        modelBones.Root.updateMatrixWorld();
      };
      let frame = requestAnimationFrame(recurse);
    })();
  })());

  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'dance';
// export const components = ${this.components};