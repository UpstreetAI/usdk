export default ctx => {
  const {
    useApp,
    // useLocalPlayer,
    // useCamera,
    // usePhysics,
    // useSpawnManager,
    // useWorldZine,
    useStoryModeManager,
    useCleanup,
  } = ctx;

  const app = useApp();
  const storyModeManager = useStoryModeManager();

  // const srcUrl = ${this.srcUrl};
  
  let live = true;
  useCleanup(() => {
    live = false;
  });

  ctx.waitUntil((async () => {
    await storyModeManager.startStoryMode();
    if (!live) {
      console.log('story mode bail!');
      debugger;
    }

    useCleanup(() => {
      storyModeManager.stopStoryMode();
    });
  })());

  return app;
};
export const contentId = ${this.contentId};
export const name = ${this.name};
export const description = ${this.description};
export const type = 'storymode';
export const components = ${this.components};