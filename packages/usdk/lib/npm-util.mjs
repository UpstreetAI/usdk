import child_process from 'child_process';
import util from 'util';
import { platform } from 'os';

const { spawn } = child_process;
const execFile = util.promisify(child_process.execFile);

const npmInstallWindows = async (dstDir) => {
  const npmCommand = 'npm.cmd';
  return new Promise((resolve, reject) => {
    const childProcess = spawn(npmCommand, ['install'], {
      cwd: dstDir,
      stdio: 'inherit',
      shell: true,  // Use shell on Windows
    });

    childProcess.on('error', (error) => {
      console.error('Failed to start npm install:', error);
      reject(error);
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        const error = new Error(`npm install exited with code ${code}`);
        console.error(error.message);
        reject(error);
      }
    });
  });
};

const npmInstallUnix = async (dstDir) => {
  await execFile('npm', ['install'], {
    cwd: dstDir,
    stdio: 'inherit',
  });
};

export const npmInstall = async (dstDir) => {
  if (platform() === 'win32') {
    await npmInstallWindows(dstDir);
  } else {
    await npmInstallUnix(dstDir);
  }
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