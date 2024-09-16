import path from 'path';
import fs from 'fs';
import os from 'os';

import { mkdirp } from 'mkdirp';
import { makeId } from '../packages/upstreet-agent/packages/react-agents/util/util.mjs';

export async function tryReadFileAsync(filePath, encoding) {
  try {
    return await fs.promises.readFile(filePath, encoding);
  } catch (err) {
    return null;
  }
}
export function tryReadFile(filePath, encoding) {
  try {
    return fs.readFileSync(filePath, encoding);
  } catch (err) {
    return null;
  }
}

export const makeTempDir = async () => {
  let tempDir = os.tmpdir();
  const dirname = makeId(8);
  tempDir = path.join(tempDir, dirname);
  await mkdirp(tempDir);
  return tempDir;
};