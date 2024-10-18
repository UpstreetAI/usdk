import path from 'path';
import os from 'os';
import { createRequire } from 'module';

//

const require = createRequire(import.meta.url);
function walkUpToNodeModules(modulePath) {
  let nodeModulesPath = modulePath;
  while (path.basename(nodeModulesPath) !== 'node_modules') {
    nodeModulesPath = path.dirname(nodeModulesPath);
  }
  return nodeModulesPath;
}

//

const wranglerModulePath = require.resolve('wrangler');
const wranglerNodeModulesPath = walkUpToNodeModules(wranglerModulePath);
export const wranglerBinPath = path.join(wranglerNodeModulesPath, '.bin', 'wrangler');