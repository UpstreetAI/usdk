import { versionManager } from "../classes/version-manager.mjs";

// get the current version
export const version = () => versionManager.getCurrentVersion();
// get the latest version
export function getLatestVersion() {
  try {
    return versionManager.getLatestVersion();
  } catch (error) {
    console.log(pc.red('Error checking latest usdk version on the registry.'));
  }
}