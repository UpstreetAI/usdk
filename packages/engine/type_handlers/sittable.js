import * as THREE from 'three';

import {
  getObjectUrl,
} from '../../app-runtime/import-manager.js';

//

// const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');
// const localVector = new THREE.Vector3();

//

const components = [
  {
    "key": "aim",
    "value": {
      "appAnimation": "Sword_Activate",
      "characterAnimation": "swordSideIdle",
      "boneAttachment": "leftHand",
      "position": [-0.055, -0.01, -0.18],
      "quaternion": [0.7071067811865475, 0, 0, 0.7071067811865476],
      "scale": [1, 1, 1]
    }
  },
  {
    "key": "wear",
    "value": {
      "boneAttachment": "spine",
      "position": [-0.3, 0.7, -0.15],
      "quaternion": [0, 0, 0.9510565162951536, -0.30901699437494734]
    }
  },
  {
    "key": "use",
    "value": {
      "animationCombo": [
        "swordSideSlash",
        "swordSideSlashStep",
        "swordTopDownSlash",
        "swordTopDownSlashStep"
      ],
      "behavior": "sword",
      "boneAttachment": "leftHand",
      "trail": [
        [0, 0.2, 0],
        [0, 1.4, 0]
      ],
      "position": [-0.055, -0.01, -0.18],
      "quaternion": [0.7071067811865475, 0, 0, 0.7071067811865476],
      "scale": [1, 1, 1]
    },
  },
];

//

export default src => ctx => {
  const {
    useApp,
    useFrame,
    useScene,
    // usePhysics,
    useEngine,
    useCleanup,
    useImportManager,
  } = ctx;
  const app = useApp();
  const scene = useScene();
  // const physics = usePhysics();
  const engine = useEngine();

  const importManager = useImportManager();

  app.appType = 'sittable';
  app.name = 'Sittable';
  app.description = 'A sittable object.';

  app.setComponents(components);

  let subApp = null;
  ctx.waitUntil((async () => {
    const res = await fetch(src);
    const j = await res.json();

    const _loadSrc = async glbUrl => {
      if (subApp) {
        subApp.parent.remove(subApp);
        subApp.destroy();
        subApp = null;
      }

      //

      subApp = importManager.createApp();
      subApp.name = app.name;
      subApp.description = app.description;
      app.add(subApp);
      subApp.updateMatrixWorld();

      const appContext = engine.engineAppContextFactory.makeAppContext({
        app: subApp,
      });

      await importManager.createAppAsync({
        app: subApp,
        appContext,
        start_url: glbUrl,
      });
    };
    const _loadModel = async () => {
      const {
        glbUrl,
        sittable,
      } = j;

      const components = {
        sit: sittable,
      };
      app.setComponents(components);

      await _loadSrc(glbUrl);

      app.addEventListener('contentupdate', async e => {
        const newSrcUrl = getObjectUrl(app.spec);
        await _loadSrc(newSrcUrl);
      });
    };
    // const _loadDecal = async () => {
    //   const src = baseUrl + 'chevron2.png';
    //   const res = await fetch(src);
    //   const blob = await res.blob();
    //   const imageBitmap = await createImageBitmap(blob);
    //   decalTexture.image = imageBitmap;
    //   decalTexture.needsUpdate = true;
    // };

    await Promise.all([
      _loadModel(),
      // _loadDecal(),
    ]);
  })());

  // let wearing = false;
  // app.addEventListener('wearupdate', e => {
  //   const {wear} = e;
  //   wearing = !!wear;
  // });

  // let using = false;
  // app.addEventListener('use', e => {
  //   using = e.use;
  // });

  // useFrame(() => {
  //   if (trailMesh && subApp) {
  //     trailMesh.update(using, subApp.matrixWorld);
  //   }
  // });

  useCleanup(() => {
    // trailMesh && trailMesh.parent.remove(trailMesh);
    subApp && subApp.destroy();
  });

  return app;
};
