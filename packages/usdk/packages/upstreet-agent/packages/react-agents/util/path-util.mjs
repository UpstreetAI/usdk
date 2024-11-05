import path from 'path';

export const getCurrentDirname = (importMeta) => {
  if (importMeta.dirname) {
    return importMeta.dirname;
  } else {
    return path.dirname(new URL(importMeta.url).pathname);
  }
};