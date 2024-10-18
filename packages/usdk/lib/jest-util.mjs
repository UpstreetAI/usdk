import child_process from 'child_process';
import { ensureNpmRoot } from './npm-util.mjs';
import {
  jestBin,
} from './locations.mjs';

export const runJest = async (directory) => {
  const npmRoot = await ensureNpmRoot();

  const child = child_process.spawn(process.argv[0], [jestBin], {
    stdio: 'pipe',
    cwd: directory,
    env: {
      NODE_PATH: npmRoot, // needed to import modules
    },
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  await new Promise((resolve, reject) => {
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        resolve();
      }
    });
    child.on('error', (err) => {
      reject(err);
    });
  });
};