import path from 'path';

export const getCurrentDirname = (importMeta) => {
    if (!importMeta.dirname) return path.dirname(new URL(importMeta.url).pathname);
    return importMeta.dirname;
}