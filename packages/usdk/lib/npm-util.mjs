import child_process from 'child_process';
import util from 'util';
import { platform } from 'os';

const execFile = util.promisify(child_process.execFile);

export const npmInstall = async (dstDir) => {
  const npmCommand = platform() === 'win32' ? 'npm.cmd' : 'npm';
  await execFile(npmCommand, ['install'], {
    cwd: dstDir,
    stdio: 'inherit',
    shell: platform() === 'win32',
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