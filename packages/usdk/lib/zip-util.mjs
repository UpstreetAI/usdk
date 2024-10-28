import path from 'path';
import fs from 'fs';
import recursiveReaddir from 'recursive-readdir';
import { mkdirp } from 'mkdirp';
import { rimraf } from 'rimraf';
import JSZip from 'jszip';
import { QueueManager } from 'queue-manager';
import { promisify } from 'util';
import os from 'os';

const readFile = promisify(fs.readFile);

export const packZip = async (dirPath, { exclude = [] } = {}) => {
  const platform = os.platform();

  if (platform === 'win32') {
    return packZipForWindows(dirPath, { exclude });
  } else {
    return packZipForUnix(dirPath, { exclude });
  }
};

const normalizeLineEndings = (content) => {
  if (typeof content === 'string') {
    return content.replace(/\r\n/g, '\n'); // Normalize to Unix line endings
  }
  return content;
};

const packZipForWindows = async (dirPath, { exclude }) => {
  try {
    let files = await recursiveReaddir(dirPath);
    files = files.filter((p) => !exclude.some((re) => re.test(p)));

    const zip = new JSZip();
    for (const filePath of files) {
      const basePath = path.relative(dirPath, filePath);
      let fileContent = await readFile(filePath, 'binary'); // Ensure binary mode
      fileContent = normalizeLineEndings(fileContent); // Normalize line endings
      zip.file(basePath, fileContent);
    }

    const arrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });

    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error during Windows zipping with normalization:', error);
  }
};

// Unix-based zipping strategy (using streams)
const packZipForUnix = async (dirPath, { exclude }) => {
  try {
    let files = await recursiveReaddir(dirPath);
    files = files.filter((p) => !exclude.some((re) => re.test(p)));

    const zip = new JSZip();
    for (const filePath of files) {
      const basePath = path.relative(dirPath, filePath);
      const stream = fs.createReadStream(filePath); // Use stream on Unix-based systems
      zip.file(basePath, stream);
    }

    const arrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9,
      },
    });

    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error during Unix zipping:', error);
  }
};

export const extractZip = async (zipBuffer, tempPath) => {
  const cleanup = async () => {
    await rimraf(tempPath);
  };

  // read the zip file using jszip
  const zip = new JSZip();
  await zip.loadAsync(zipBuffer);
  const ps = [];
  const queueManager = new QueueManager({
    parallelism: 10,
  });
  zip.forEach((relativePath, zipEntry) => {
    const fullPathName = [tempPath, relativePath].join('/');

    if (!zipEntry.dir) {
      const p = (async () => {
        return await queueManager.waitForTurn(async () => {
          // check if the file exists
          let stats = null;
          try {
            stats = await fs.promises.lstat(fullPathName);
          } catch (err) {
            if (err.code === 'ENOENT') {
              // nothing
            } else {
              // console.warn(err.stack);
              throw err;
            }
          }
          if (stats === null) {
            // console.log('write file 1', fullPathName);
            const arrayBuffer = await zipEntry.async('arraybuffer');
            // console.log('write file 2', fullPathName);
            await mkdirp(path.dirname(fullPathName));
            // console.log('write file 3', fullPathName);
            await fs.promises.writeFile(fullPathName, Buffer.from(arrayBuffer));
            // console.log('write file 4', fullPathName);
            return relativePath;
          } else {
            throw new Error('conflict: ' + fullPathName);
          }
        });
      })();
      ps.push(p);
    }
  });
  const files = await Promise.all(ps);
  return {
    files,
    cleanup,
  };
};