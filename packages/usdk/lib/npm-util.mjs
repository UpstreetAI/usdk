import child_process from 'child_process';
import util from 'util';

const execFile = util.promisify(child_process.execFile);

export const npmInstall = async (dstDir) => {
  await execFile('npm', ['install'], {
    cwd: dstDir,
    stdio: 'inherit',
  });  
};

const getNpmRoot = async () => {
  const { stdout } = await execFile('npm', ['root', '--quiet', '-g']);
  return stdout.trim();
};
export const ensureNpmRoot = (() => {
  let npmRootPromise = null;
  return () => {
    if (npmRootPromise === null) {
      npmRootPromise = getNpmRoot();
    }
    return npmRootPromise;
  };
})();