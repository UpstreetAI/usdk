export class WorldClient extends EventTarget {
  constructor({
    supabaseClient,
  }) {
    super();

    this.supabaseClient = supabaseClient;

    this.worldId = '';
    this.worldLoaded = false;

    this.id = '';
    this.userId = '';
    this.name = '';
    this.description = '';
    this.previewImg = '';
    this.bannerImg = '';
    this.heroImgs = [];
    this.public = false;
    this.objects = [];
    this.settings = {};

    this.defaultObjects = [];
  }

  setDefaultObjects(defaultObjects) {
    this.defaultObjects = defaultObjects;
  }

  getWorldId() {
    return this.worldId;
  }
  isWorldLoaded() {
    return this.worldLoaded;
  }
  async setWorldId(worldId) {
    const result = await this.supabaseClient.supabase
      .from('worlds')
      .select('*')
      .eq('name', worldId)
      .maybeSingle();
    let {
      error,
      data: worldData,
    } = result;
    if (!error) {
      if (!worldData) {
        worldData = {};
      }
      // this.worldData = worldData;

      let {
        id = '',
        user_id: userId = '',
        name = '',
        description = '',
        preview_url: previewImg = '',
        banner_url: bannerImg = '',
        hero_urls: heroImgs = [],
        public: public_ = false,
        objects = [],
        settings = {},
      } = worldData;
      if (objects.length === 0) {
        objects = this.defaultObjects;
      }

      this.worldId = worldId;
      this.worldLoaded = true;

      this.setId(id);
      this.setUserId(userId);
      this.setName(name);
      this.setDescription(description);
      this.setPreviewImg(previewImg);
      this.setBannerImg(bannerImg);
      this.setHeroImgs(heroImgs);

      this.setPublic(public_);
      this.setObjects(objects);
      this.setSettings(settings);

      this.dispatchEvent(new MessageEvent('worldload', {
        data: {
          worldId,
        },
      }));
    } else {
      throw new Error('failed to load world: ' + error);
    }
  }

  getId() {
    return this.id;
  }
  setId(id) {
    const {
      id: oldId,
    } = this;
    this.id = id;

    this.dispatchEvent(new MessageEvent('idupdate', {
      data: {
        id,
        oldId,
      },
    }));
  }
  getUserId() {
    return this.userId;
  }
  setUserId(userId) {
    const {
      userId: oldUserId,
    } = this;
    this.userId = userId;

    this.dispatchEvent(new MessageEvent('useridupdate', {
      data: {
        userId,
        oldUserId,
      },
    }));
  }
  getName() {
    return this.name;
  }
  setName(name) {
    const {
      name: oldName,
    } = this;
    this.name = name;

    this.dispatchEvent(new MessageEvent('nameupdate', {
      data: {
        name,
        oldName,
      },
    }));
  }
  getDescription() {
    return this.description;
  }
  setDescription(description) {
    const {
      description: oldDescription,
    } = this;
    this.description = description;

    this.dispatchEvent(new MessageEvent('descriptionupdate', {
      data: {
        description,
        oldDescription,
      },
    }));
  }
  getPreviewImg() {
    return this.previewImg;
  }
  setPreviewImg(previewImg) {
    const {
      previewImg: oldPreviewImg,
    } = this;
    this.previewImg = previewImg;

    this.dispatchEvent(new MessageEvent('previewimgupdate', {
      data: {
        previewImg,
        oldPreviewImg,
      },
    }));
  }
  getBannerImg() {
    return this.bannerImg;
  }
  setBannerImg(bannerImg) {
    const {
      bannerImg: oldBannerImg,
    } = this;
    this.bannerImg = bannerImg;

    this.dispatchEvent(new MessageEvent('bannerimgupdate', {
      data: {
        bannerImg,
        oldBannerImg,
      },
    }));
  }
  getHeroImgs() {
    return this.heroImgs;
  }
  setHeroImgs(heroImgs) {
    const {
      heroImgs: oldHeroImgs,
    } = this;
    this.heroImgs = heroImgs;

    this.dispatchEvent(new MessageEvent('heroimgsupdate', {
      data: {
        heroImgs,
        oldHeroImgs,
      },
    }));
  }
  getPublic() {
    return this.public;
  }
  setPublic(public_) {
    const {
      public: oldPublic,
    } = this;
    this.public = public_;

    this.dispatchEvent(new MessageEvent('publicupdate', {
      data: {
        public: public_,
        oldPublic,
      },
    }));
  }
  getObjects() {
    return this.objects;
  }
  setObjects(objects) {
    const {
      objects: oldObjects,
    } = this;
    this.objects = objects;

    this.dispatchEvent(new MessageEvent('objectsupdate', {
      data: {
        objects,
        oldObjects,
      },
    }));
  }
  getSettings() {
    return this.settings;
  }
  setSettings(settings) {
    const {
      settings: oldSettings,
    } = this;
    this.settings = settings;

    this.dispatchEvent(new MessageEvent('settingsupdate', {
      data: {
        settings,
        oldSettings,
      },
    }));
  }
}
