// import * as THREE from 'three';

export default srcUrl => ctx => {
  const {
    useApp,
    useEnvironmentManager,
    useCleanup,
  } = ctx;

  const app = useApp();
  const environmentManager = useEnvironmentManager();

  //

  app.name = 'Background';
  app.description = 'A scene background';

  //

  ctx.waitUntil((async () => {
    const res = await fetch(srcUrl);
    const j = await res.json();
    environmentManager.addBackground(j);

    useCleanup(() => {
      environmentManager.removeBackground(j);
    });
  })());

  return app;
};