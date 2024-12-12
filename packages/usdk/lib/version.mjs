// import { versionManager } from "../classes/version-manager.mjs";
import packageJson from '../package.json' with { type: 'json' };

/**
 * Get the current version
 */
// export const version = () => versionManager.getCurrentVersion();
export const version = () => packageJson.version;

/**
 * Check for the latest version
 * @returns {Promise<string|null>} Latest version or null if check fails
 */
// export async function getLatestVersion() {
//   try {
//     const update = await versionManager.checkNow();
//     return update?.latest || null;
//   } catch (error) {
//     if (process.env.DEBUG) {
//       console.error('Version check error:', error);
//     }
//     return null;
//   }
// }