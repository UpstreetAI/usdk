// import metaversefile from 'metaversefile';

export default srcUrl => ctx => {
  const {
    useApp,
    useFrame,
    useDomRenderer,
    useEngineRenderer,
    // useInternals,
    // useWear,
    useCleanup,
  } = ctx;

  const app = useApp();
  const {scene} = useEngineRenderer();
  // const {sceneLowerPriority} = useInternals();
  const domRenderEngine = useDomRenderer();

  // let srcUrl = ${this.srcUrl};
  
  let dom = null;
  // const transformMatrix = new THREE.Matrix4();
  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    const json = await res.json();
    let {jsxUrl} = json;

    if (/^.\//.test(jsxUrl)) {
      // console.log('got relative jsx url', jsxUrl);
      jsxUrl = new URL(jsxUrl, srcUrl).href;
    }

    const m = await import(/* @vite-ignore */ jsxUrl);

  
    dom = domRenderEngine.addDom({
      render: () => m.default(),
    });

    // sceneLowerPriority.add(dom);
    scene.add(dom);
    dom.updateMatrixWorld();
  })());

  useFrame(() => {
    if (dom) {
      if (!wearing) {
        app.matrixWorld.decompose(dom.position, dom.quaternion, dom.scale);
        dom.updateMatrixWorld();
      } else {
        dom.position.copy(app.position);
        dom.quaternion.copy(app.quaternion);
        dom.scale.copy(app.scale);
        dom.updateMatrixWorld();
      }
    }
  });

  let wearing = false;
  app.addEventListener('wear', e => {
    const {
      wear,
    } = e.data;
    // wearing = e.wear;
    wearing = wear;
  });

  useCleanup(() => {
    if (dom) {
      // sceneLowerPriority.remove(dom);
      scene.remove(dom);
      dom.destroy();
    }
  });

  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'react';
// export const components = ${this.components};