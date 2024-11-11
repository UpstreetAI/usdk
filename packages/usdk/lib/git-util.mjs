import spawn from 'cross-spawn';

export const hasGit = async () => {
  // check if the git command exists
  return await new Promise((resolve) => {
    const child = spawn('npm', ['--version'], {
      stdio: 'ignore',
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    child.on('error', (err) => {
      resolve(false);
    });
  });
};

export const gitInit = async (dstDir) => {
  await new Promise((resolve, reject) => {
    const child = spawn('git', [
      'init',
      '--initial-branch=main',
    ], {
      cwd: dstDir,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`git init failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
};