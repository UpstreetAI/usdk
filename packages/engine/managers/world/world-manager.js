import * as THREE from 'three';
import {
  SupabaseFsWorker,
} from '../../supabase-fs-worker.js';
import {
  makeId,
} from '../../util.js';

export class WorldManager extends EventTarget {
  constructor({
    worldClient,
    appManagerContext,
    supabaseClient,
    playersManager,
    autoCameraManager,
    engineRenderer,
  }) {
    super();

    if (!worldClient || !appManagerContext || !supabaseClient || !playersManager || !autoCameraManager || !engineRenderer) {
      console.warn('missing required arguments', {
        worldClient,
        appManagerContext,
        supabaseClient,
        playersManager,
        autoCameraManager,
        engineRenderer,
      });
      throw new Error('missing required arguments');
    }

    this.worldClient = worldClient;
    this.appManagerContext = appManagerContext;
    this.supabaseClient = supabaseClient;
    this.playersManager = playersManager;
    this.autoCameraManager = autoCameraManager;
    this.engineRenderer = engineRenderer;

    // this.worldId = '';
    // this.worldData = null;
  }

  // getId() {
  //   return ['world', this.world].join(':');
  // }

  // get the current cached value, compatible with saving
  getApps() {
    const worldId = this.worldClient.getWorldId();
    const appManagerName = 'world:' + worldId;
    const appManager = this.appManagerContext.getAppManager(appManagerName);
    const apps = appManager.getApps();
    return apps;
  }
  async getSceneJson() {
    const apps = this.getApps();
    let objects = apps.map(app => app.toJson());
    const land = {
      id: this.worldClient.getId(),
      user_id: this.worldClient.getUserId(),
      name: this.worldClient.getName(),
      description: this.worldClient.getDescription(),
      public: this.worldClient.getPublic(),
      preview_url: this.worldClient.getPreviewImg(),
      banner_url: this.worldClient.getBannerImg(),
      hero_urls: this.worldClient.getHeroImgs(),
      objects,
      settings: this.worldClient.getSettings(),
    };
    return land;
  }
  async setSceneJson(json) {
    json.id != null && this.worldClient.setWorldId(json.id);
    json.user_id != null && this.worldClient.setUserId(json.user_id);
    json.name != null && this.worldClient.setName(json.name);
    json.description != null && this.worldClient.setDescription(json.description);
    json.public != null && this.worldClient.setPublic(json.public);
    json.preview_url != null && this.worldClient.setPreviewImg(json.preview_url);
    json.banner_url != null && this.worldClient.setBannerImg(json.banner_url);
    json.hero_urls != null && this.worldClient.setHeroImgs(json.hero_urls);
    json.objects != null && this.worldClient.setObjects(json.objects);
    json.settings != null && this.worldClient.setSettings(json.settings);
    await this.appManager.loadJson(json);
  }
  async save(o) {
    let json = await this.getSceneJson();
    json = {
      ...json,
      ...o,
    };

    // auto screenshot
    const autoImg = json.settings?.autoImg;
    if (autoImg && !json.preview_url) {
      const screenshotBlob = await this.autoCameraManager.takeAutoScreenshot();

      const supabaseFsWorker = new SupabaseFsWorker({
        supabase: this.supabaseClient.supabase,
        bucketName: 'public',
      });

      const name = this.worldClient.getName();
      const fileName = `preview-${makeId(8)}.png`;
      const keyPath = ['autoScreenshots', name].concat(fileName);
      const imageUrl = await supabaseFsWorker.writeFile(keyPath, screenshotBlob);
      json.preview_url = imageUrl;
    }

    const result = await this.supabaseClient.supabase
      .from('worlds')
      .upsert(json);

    this.worldClient.setId(json.id);
    this.worldClient.setUserId(json.user_id);
    this.worldClient.setName(json.name);
    this.worldClient.setDescription(json.description);
    this.worldClient.setPublic(json.public);
    this.worldClient.setPreviewImg(json.preview_url);
    this.worldClient.setBannerImg(json.banner_url);
    this.worldClient.setHeroImgs(json.hero_urls);
    this.worldClient.setObjects(json.objects);
    this.worldClient.setSettings(json.settings);
  }
}
