// import * as THREE from 'three';

//

// "subtype": "saddle",
// "sitBone": "Spine",
// "walkAnimation": "Armature|Armature|Hopping|Armature|Hopping",
// "walkAnimationHoldTime": 1,
// "walkAnimationSpeedFactor": 0.1,
// "speed": 0.02,
// "damping": 0.99

//

export default src => ctx => {
  const {
    useApp,
    useEngine,
    useCleanup,
    useImportManager,
    useLocalPlayer,
  } = ctx;
  const app = useApp();
  const engine = useEngine();

  const importManager = useImportManager();

  app.appType = 'mount';
  app.name = 'Mount';
  app.description = 'A mountable creature.';

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
        mount,
      } = j;
      // console.log('got mount', j);
      // debugger;

      const components = {
        sit: mount,
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

  const localPlayer = useLocalPlayer();
  // globalThis.localPlayer = localPlayer;
  // globalThis.app = app;
  let sitSpec = null;
  const _unwear = () => {
    if (sitSpec) {
      const sitAction = localPlayer.getAction('sit');
      if (sitAction) {
        localPlayer.removeAction('sit');
      }
    }
  };
  app.addEventListener('wearupdate', e => {
    // console.log('wear update 0', e);
    // debugger;

    if (e.wear) {
      // console.log('wear update 1', e);
      if (subApp?.glb) {
        sitSpec = app.getComponent('sit');

        // console.log('wear update 2', sitSpec);
        if (sitSpec) {
          let rideMesh = null;
          subApp.glb.scene.traverse(o => {
            if (rideMesh === null && o.isSkinnedMesh) {
              rideMesh = o;
            }
          });

          const {instanceId} = app;
          const localPlayer = useLocalPlayer();

          const rideBone = sitSpec.sitBone ? rideMesh.skeleton.bones.find(bone => bone.name === sitSpec.sitBone) : null;
          const sitAction = {
            type: 'sit',
            time: 0,
            animation: sitSpec.subtype,
            controllingId: instanceId,
            controllingBone: rideBone,
          };
          // localPlayer.setControlAction(sitAction);
          localPlayer.actionManager.addAction(sitAction);
          // console.log('add sit action', sitAction);
        }
      }
    } else {
      _unwear();
    }
  });
  useCleanup(() => {
    _unwear();
  });

  useCleanup(() => {
    subApp && subApp.destroy();
  });

  return app;
};
