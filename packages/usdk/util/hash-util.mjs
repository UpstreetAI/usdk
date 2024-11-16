import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const getDirectoryHash = async (dir, {
  hashFn = 'sha256',
} = {}) => {
  const hash = crypto.createHash(hashFn);

  // Helper function to traverse directory
  async function traverse(currentPath) {
    const stats = await fs.promises.lstat(currentPath);
    const relativePath = path.relative(dir, currentPath);

    if (stats.isDirectory()) {
      const entries = await fs.promises.readdir(currentPath);

      // Sort entries to ensure consistent ordering
      entries.sort();

      for (const entry of entries) {
        await traverse(path.join(currentPath, entry));
      }
    } else if (stats.isFile()) {
      // Hash file content
      const fileContent = await fs.promises.readFile(currentPath);
      hash.update(fileContent);
    } else if (stats.isSymbolicLink()) {
      // Hash symlink target
      const linkTarget = await fs.promises.readlink(currentPath);
      hash.update(linkTarget);
    }

    // Hash metadata
    hash.update(JSON.stringify({
      path: relativePath,
      mode: stats.mode,
      size: stats.size,
      // mtime: stats.mtimeMs,
      // atime: stats.atimeMs,
    }));
  }

  await traverse(dir);
  return hash.digest('hex');
};