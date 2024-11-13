export class AssetCache {
  constructor() {
    this.cache = new Map();
  }
  getAsset(key) {
    return this.cache.get(key);
  }
  addAsset(key, asset) {
    this.cache.set(key, asset);
  }
  removeAsset(key) {
    this.cache.delete(key);
  }
}