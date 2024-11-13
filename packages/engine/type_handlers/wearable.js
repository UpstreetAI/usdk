// import * as THREE from 'three';

import {
  getObjectUrl,
} from '../../app-runtime/import-manager.js';

//

export default src => ctx => {
  const {
    useApp,
    // useFrame,
    // useScene,
    useEngine,
    useCleanup,
    useImportManager,
  } = ctx;
  const app = useApp();
  // const scene = useScene();
  const engine = useEngine();

  const importManager = useImportManager();

  app.appType = 'wearable';
  app.name = 'Wearable';
  app.description = 'A wearable object.';

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
        wearable,
      } = j;

      const components = {
        wear: wearable,
      };
      app.setComponents(components);

      await _loadSrc(glbUrl);

      app.addEventListener('contentupdate', async e => {
        const newSrcUrl = getObjectUrl(app.spec);
        await _loadSrc(newSrcUrl);
      });
    };
    await _loadModel();
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
