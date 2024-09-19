import child_process from 'child_process';
import util from 'util';

const execFile = util.promisify(child_process.execFile);

export const npmInstall = async (dstDir) => {
  execFile('npm', ['install'], {
    cwd: dstDir,
    stdio: 'inherit',
  });  
};