import path from 'path';

export const getCurrentDirname = (importMeta) => {
  if (importMeta.dirname) {
    return importMeta.dirname;
  } else if (importMeta.url) {
    return path.dirname(new URL(importMeta.url).pathname);
  }
  else {
    console.log("importMeta", importMeta); 
    console.log("__dirname", __dirname);
    console.log("__filename", __filename)
    console.log("process.cwd()", process.cwd());
    const absolutePath = path.resolve(__filename);
    const dirname = path.dirname(absolutePath);
    console.log("dirname", dirname);
    const mainModule = require.main;
    console.log("require.main", require.main);
    if (mainModule) {
      const mainFilename = mainModule.filename;
      const currentDirname = path.dirname(mainFilename);
      console.log("currentDirname", currentDirname);
      return currentDirname
    }
    return dirname;
  }
};