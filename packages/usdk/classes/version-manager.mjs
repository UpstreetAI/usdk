import { exec } from 'child_process';
import { promisify } from 'util';
import pc from 'picocolors';
import packageJson from '../package.json' with { type: 'json' };

// cache configuration
const VERSION_CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

const execAsync = promisify(exec);

class VersionManager {
  constructor() {
    this.cachedVersion = null;
    this.lastChecked = null;
    this.checkPromise = null;
  }

  // get the current package version
  getCurrentVersion() {
    return packageJson.version;
  }

  // check if cache is still valid
  isCacheValid() {
    return (
      this.cachedVersion && 
      this.lastChecked && 
      (Date.now() - this.lastChecked) < VERSION_CACHE_DURATION
    );
  }

  // get latest version with caching
  async getLatestVersion() {
    // return cached version if valid
    if (this.isCacheValid()) {
      return this.cachedVersion;
    }

    // return existing promise if check is in progress
    if (this.checkPromise) {
      return this.checkPromise;
    }

    // start new version check
    this.checkPromise = this._fetchLatestVersion()
      .finally(() => {
        this.checkPromise = null;
      });

    return this.checkPromise;
  }

  // internal method to fetch latest version
  async _fetchLatestVersion() {
    try {
      const { stdout } = await execAsync(`npm show ${packageJson.name} version`);
      const version = stdout.trim();

      // update cache
      this.cachedVersion = version;
      this.lastChecked = Date.now();
      
      return version;
    } catch (error) {
      console.log(pc.yellow('Unable to check for updates.'));
      // return current version as fallback
      return this.getCurrentVersion();
    }
  }
}

// export singleton instance
export const versionManager = new VersionManager();

// maintain existing API
export const version = () => versionManager.getCurrentVersion();
export const getLatestVersion = () => versionManager.getLatestVersion();