import * as THREE from 'three';

export default srcUrl => ctx => {
  const {
    useApp,
    usePhysics,
    usePhysicsTracker,
    useLoreManager,
    // useFrame,
    useLoaders,
    useCleanup,
  } = ctx;
  const app = useApp();
  const physics = usePhysics();
  const physicsTracker = usePhysicsTracker();
  const loreManager = useLoreManager();

  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    if (res.ok) {
      const itemJson = await res.json();
      let {
        name,
        modelUrl,
        components = [],
      } = itemJson;

      let baseUrl = srcUrl;
      if (/^\//.test(baseUrl)) {
        baseUrl = new URL(baseUrl, location.href).href;
      }

      modelUrl = new URL(modelUrl, baseUrl).href;

      // console.log('got item json', itemJson);
      const gltf = await new Promise((accept, reject) => {
        const {gltfLoader} = useLoaders();
        gltfLoader.load(modelUrl, accept, function onprogress() {}, reject);
      });
      // console.log('item model load', {modelUrl, name, gltf});
      const model = gltf.scene;
      model.name = name;
      app.add(model);
      app.updateMatrixWorld();

      const _setComponents = () => {
        app.setComponents(components);
      };
      _setComponents();

      const _addPhysics = async () => {
        const physicsObject = physics.addGeometry(model);
        // console.log('set app name', physicsObject);
        physicsObject.name = app.name;
        physicsObject.description = app.description;
        // physicsObjects.push(physicsObject);
        
        //

        physicsTracker.addAppPhysicsObject(app, physicsObject);
        
        //

        const k = app.instanceId + ':' + (physicsObject.physicsId + '').padStart(5, '0');
        const actor = loreManager.createActor({
          id: app.instanceId,
          type: 'object',
          spec: {
            name: physicsObject.name,
            description: physicsObject.description,
          },
          object: physicsObject,
        });
        loreManager.addActor(actor);
        useCleanup(() => {
          loreManager.removeActor(actor);
        });

        //
        
        // engineRenderer.scene.add(physicsObject);
        // physicsObject.updateMatrixWorld();
      };
      _addPhysics();
    } else {
      console.warn('error loading item', res.status, res.statusText);
    }
  })());

  return app;
};