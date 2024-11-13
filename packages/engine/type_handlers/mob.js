// import * as THREE from 'three';
// import metaversefile from 'metaversefile';
// const {useApp, useMobManager, useCleanup} = metaversefile;

export default srcUrl => ctx => {
  const {
    useApp,
    useMobManager,
    useCleanup,
  } = ctx;
  const app = useApp();
  const mobManager = useMobManager();

  app.appType = 'mob';
  app.name = 'mob';
  app.description = 'A mobile enemy unit.';

  mobManager.addMobApp(app, srcUrl);

  useCleanup(() => {
    mobManager.removeMobApp(app);
  });

  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'mob';
// export const components = ${this.components};
// export const srcUrl = ${this.srcUrl};