import * as THREE from 'three';

//

const localVector = new THREE.Vector3();
const localEuler = new THREE.Euler();

//

export default srcUrl => ctx => {
  const {
    useApp,
    useFrame,
    useCleanup,
    useImportManager,
    useLoreManager,
    useEngine,
  } = ctx;
  const app = useApp();
  const importManager = useImportManager();
  const loreManager = useLoreManager();
  const engine = useEngine();

  app.appType = 'prop';

  let live = true;
  const cleanupFns = [];
  // app.prop = null;
  let subApp;

  ctx.waitUntil((async () => {
    if (!live) return;

    // fetch srcUrl and get json
    const res = await fetch(srcUrl);
    const json = await res.json();
    app.spec = {start_url: srcUrl, ...json}

    // app.name = srcUrl.match(/([^\/]*)$/)[1];
    // app.description = '';
    app.name = json.name;
    app.description = json.description;

    const _loadModel = async () => {
      let u2 = json.assetUrl;

      subApp = importManager.createApp();
      subApp.name = app.name;
      subApp.description = app.description;
      app.add(subApp);
      subApp.updateMatrixWorld();

      const appContext = engine.engineAppContextFactory.makeAppContext({
        app: subApp,
      });

      await importManager.createAppAsync({
        start_url: u2,
        app: subApp,
        appContext,
      });

      if (subApp.center) {
        app.center = subApp.center;
      }

      // wait for visibility change
      app.addEventListener('componentsupdate', e => {
        const {
          keys,
        } = e;
        if (keys.includes('visible')) {
          const visible = app.getComponent('visible');
          subApp.setComponent('visible', visible);
        }
      });

      // lore
      const actor = loreManager.createActor({
        id: app.instanceId,
        type: 'object',
        spec: {
          name: app.name,
          description: app.description,
          previewUrl: json.previewUrl,
        },
        object: app,
      });
      loreManager.addActor(actor);

      useCleanup(() => {
        loreManager.removeActor(actor);
      });
    };

    _loadModel();
  })());

  // // update transforms
  // const lastMatrixWorld = app.matrixWorld.clone();
  // useFrame(() => {
  //   if (!app.matrixWorld.equals(lastMatrixWorld)) {
  //     lastMatrixWorld.copy(app.matrixWorld);

  //     if (app.prop) {
  //       localVector.copy(app.position);
  //       localVector.y += app.prop.avatar.height;
  //       app.prop.characterPhysics.setPosition(localVector);

  //       localEuler.setFromQuaternion(app.quaternion, 'YXZ');
  //       localEuler.x = 0;
  //       localEuler.z = 0;
  //       app.prop.quaternion.setFromEuler(localEuler);
  //     }
  //   }
  // });

  // cleanup
  useCleanup(() => {
    live = false;

    subApp?.destroy();

    for (const cleanupFn of cleanupFns) {
      cleanupFn();
    }
  });

  return app;
};
