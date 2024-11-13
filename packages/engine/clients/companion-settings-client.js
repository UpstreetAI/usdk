const prefixKey = 'COMPANION_SETTINGS:';

export class CompanionSettingsClient extends EventTarget {
  constructor() {
    super();
  }

  // use local storage for now
  getSetting(key) {
    const v = localStorage.getItem(prefixKey + key);
    if (v) {
      try {
        return JSON.parse(v);
      } catch(err) {
        console.warn('error parsing setting', key, v);
        return void 0;
      }
    } else {

      return void 0;
    }
  }
  removeSetting(key) {
    localStorage.removeItem(prefixKey + key);
  }
  setSetting(key, value) {
    localStorage.setItem(prefixKey + key, JSON.stringify(value));

    this.dispatchEvent(new MessageEvent('settingsupdate', {
      data: {
        key,
        value,
      },
    }));
  }
}