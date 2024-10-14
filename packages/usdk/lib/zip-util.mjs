import path from 'path';
import fs from 'fs';
import recursiveReaddir from 'recursive-readdir';
import { mkdirp } from 'mkdirp';
import { rimraf } from 'rimraf';
import JSZip from 'jszip';
import { QueueManager } from './queue-manager.mjs';

export const packZip = async (dirPath, { exclude = [] } = {}) => {
  let files = await recursiveReaddir(dirPath);

  // Custom filter function
  const filterFile = (filePath) => {
    const relativePath = path.relative(dirPath, filePath);
    const parts = relativePath.split(path.sep);
    
    // Check if the file is in a public directory
    const isInPublic = parts.includes('public');
    
    // If it's in a public directory, include it
    if (isInPublic) {
      return true;
    }
    
    // Otherwise, apply the exclude filters
    return !exclude.some((re) => re.test(filePath));
  };

  // Apply the custom filter
  files = files.filter(filterFile);

  const zip = new JSZip();
  for (const p of files) {
    const relativePath = path.relative(dirPath, p);
    const fileContent = await fs.promises.readFile(p);
    zip.file(relativePath, fileContent);
  }

  const arrayBuffer = await zip.generateAsync({
    type: 'arraybuffer',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });
  const uint8Array = new Uint8Array(arrayBuffer);
  return uint8Array;
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