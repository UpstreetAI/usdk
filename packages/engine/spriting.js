import {createObjectSpriteSheet} from './object-spriter.js';
// import metaversefile from './metaversefile-api.js';

export class SpriteLoader {
  constructor({
    engineRenderer,
    importManager,
    physicsTracker,
  }) {
    if (!engineRenderer || !importManager || !physicsTracker) {
      console.warn('SpriteLoader missing args', {
        engineRenderer,
        importManager,
        physicsTracker,
      });
      debugger;
      throw new Error('SpriteLoader missing args');
    }

    this.engineRenderer = engineRenderer;
    this.importManager = importManager;
    this.physicsTracker = physicsTracker;
  }
  async createAppUrlSpriteSheet(appUrl, opts) {
    const app = await this.importManager.createAppAsync({
      start_url: appUrl,
      // components: [
      //   {
      //     key: 'physics',
      //     value: true,
      //   },
      // ],
    });
    const {renderer} = this.engineRenderer;
    const spritesheet = await createObjectSpriteSheet(app, renderer, this.physicsTracker, opts);
    app.destroy();
    return spritesheet;
  }
}