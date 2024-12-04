import spawn from 'cross-spawn';

const pnpmPath = 'pnpm'; // Directly reference the binary name

export const hasNpm = async () => {
  return new Promise((resolve) => {
    const child = spawn(pnpmPath, ['--version'], {
      stdio: 'ignore',
    });
    
    child.on('close', (code) => {
      resolve(code === 0);
    });
    child.on('error', () => {
      resolve(false);
    });
  });
};

export const npmInstall = async (dstDir) => {
  await new Promise((resolve, reject) => {
    const child = spawn(pnpmPath, ['install'], {
      cwd: dstDir,
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`pnpm install failed with code ${code}`));
      } else {
        resolve();
      }
    });
    child.on('error', reject);
  });
};
