// import * as THREE from 'three';

import {
  ZineManager,
} from '../../../packages/zine-runtime/zine-manager.js';
import {
  ZineCameraManager,
} from '../../../packages/zine-runtime/zine-camera.js';

export default srcUrl => ctx => {
  const {
    useApp,
    useLocalPlayer,
    useCamera,
    usePhysics,
    useCameraManager,
    useEngineRenderer,
    useSpawnManager,
    // useFrame,
    usePointerLockManager,
    useCleanup,
  } = ctx;

  const app = useApp();
  const localPlayer = useLocalPlayer();
  const camera = useCamera();
  const physics = usePhysics();
  const zine = new ZineManager();
  const cameraManager = useCameraManager();
  const engineRenderer = useEngineRenderer();
  const {scene} = engineRenderer;
  const spawnManager = useSpawnManager();
  const pointerLockManager = usePointerLockManager();

  //

  app.name = 'Zine';
  app.description = 'A 2d panel scene';

  //ea

  ctx.waitUntil((async () => {
    // camera manager
    const zineCameraManager = new ZineCameraManager({
      camera,
      localPlayer,
      cameraZ: 1,
    }, {
      // normalizeView: false,
      followView: false,
    });
    // zineCameraManager.setLockCamera(camera);
    // zineCameraManager.toggleCameraLock();

    const zineInstance = await zine.createStoryboardInstanceAsync({
      start_url: srcUrl,
      zineCameraManager,
      physics,
      localPlayer,
      scene,
      spawnManager,
      ctx,
    });
    app.add(zineInstance);
    zineInstance.updateMatrixWorld();

    cameraManager.setControllerFn(() => {
      zineCameraManager.updatePost();
      // zineInstance.update();
    });

    zineInstance.start();
    zineInstance.setSpawnPoint();

    spawnManager.spawn();

    useCleanup(() => {
      zineInstance.destroy();
    });
    
    const mousemove = e => {
      if (pointerLockManager.pointerLockElement) {
        zineInstance.handleMouseMove(e);
      }
    };
    globalThis.addEventListener('mousemove', mousemove);
    useCleanup(() => {
      globalThis.removeEventListener('mousemove', mousemove);
    });

    const mousewheel = e => {
      if (pointerLockManager.pointerLockElement) {
        // const {deltaY} = e;
        // zineInstance.scroll(deltaY);
        zineInstance.handleMouseWheel(e);
      }
    };
    globalThis.addEventListener('mousewheel', mousewheel);
    useCleanup(() => {
      globalThis.removeEventListener('mousewheel', mousewheel);
    });

    // app.zineInstance = zineInstance;
    // app.physicsIds = zineInstance?.physicsIds ?? [];

    // console.log('zine load 4');
    // await zineInstance.spawn();
    // console.log('zine load 5');
  })());

  return app;
};