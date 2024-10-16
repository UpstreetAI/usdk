import child_process from 'child_process';
import util from 'util';
import { ensureNpmRoot } from './npm-util.mjs';
import {
  jestBin,
} from './locations.mjs';

const execFile = util.promisify(child_process.execFile);

export const runJest = async (directory) => {
  const npmRoot = await ensureNpmRoot();
  await execFile(process.argv[0], ['--experimental-vm-modules', jestBin], {
    stdio: 'inherit',
    cwd: directory,
    env: {
      NODE_PATH: npmRoot, // needed to import modules
    },
  });
};