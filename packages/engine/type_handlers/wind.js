export default srcUrl => ctx => {
  const {useApp, useCleanup, useEnvironmentManager} = ctx;

  const app = useApp();
  app.name = 'wind';
  app.description = '';

  const environmentManager = useEnvironmentManager();
  
  let j;
  let live = true;
  (async () => {
    const res = await fetch(srcUrl);
    if (!live) return;

    j = await res.json();
    if (!live) return;

    if (j) {
      environmentManager.addWind(j);
    }
  })();
  
  useCleanup(() => {
    live = false;
    if (j) {
      environmentManager.removeWind(j);
    }
  });

  return app;
};