import spawn from 'cross-spawn';

export const gitInit = async (dstDir) => {
  await new Promise((resolve, reject) => {
    const child = spawn('git', ['init'], {
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