// import * as THREE from 'three';
// import metaversefile from 'metaversefile';
// const {useApp, useLoreAIScene, useCleanup} = metaversefile;

export default srcUrl => ctx => {
  const {
    useApp,
    // useLoreAIScene,
    useLoreManager,
    useCleanup,
  } = ctx;
  const app = useApp();
  // const loreAIScene = useLoreAIScene();
  const loreManager = useLoreManager();

  //

  // const srcUrl = ${this.srcUrl};

  //

  (async () => {
    const res = await fetch(srcUrl);
    // if (!live) return;
    let j = await res.json();

    const {
      name,
      description,
    } = j;

    const loreItem = loreManager.addLoreItem({
      name,
      description,
    });

    useCleanup(() => {
      loreManager.removeLoreItem(loreItem);
    });

    /* if (!live) return;
    if (Array.isArray(j)) {
      j = j.join('\\n');
    }
    if (typeof j === 'string') {
      setting = loreAIScene.addSetting(j);
    } */
  })();

  /* let live = true;
  let setting = null;
  (async () => {
    const res = await fetch(srcUrl);
    if (!live) return;
    let j = await res.json();
    if (!live) return;
    if (Array.isArray(j)) {
      j = j.join('\\n');
    }
    if (typeof j === 'string') {
      setting = loreAIScene.addSetting(j);
    }
  })();
  
  useCleanup(() => {
    live = false;

    if (setting !== null) {
      loreAIScene.removeSetting(setting);
      setting = null;
    }
  }); */

  return app;
};
// export const contentId = ${this.contentId};
// export const name = ${this.name};
// export const description = ${this.description};
// export const type = 'lore';
// export const components = ${this.components};