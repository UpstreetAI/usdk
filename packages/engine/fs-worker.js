// fs-worker.js

self.onmessage = async ({
  data,
}) => {
  const {
    id,
    method,
    args,
  } = data;

  const rootDirectory = await getRootDirectory();

  switch (method) {
    case 'readFile': {
      const {
        keyPath,
      } = args;
      const arrayBuffer = await readFile(rootDirectory, keyPath);

      // post response message to the parent thread
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: arrayBuffer,
      });
      break;
    }
    case 'writeFile': {
      const {
        // directoryName,
        // fileName,
        keyPath,
        value,
      } = args;
      await writeFile(rootDirectory, keyPath, value);

      // post response message to the parent thread
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: null,
      });
      break;
    }
    case 'readDirectory': {
      const {
        // directoryName,
        keyPath,
      } = args;
      const fileNames = await readDirectory(rootDirectory, keyPath);

      // post response message to the parent thread
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: fileNames,
      });
      break;
    }
    case 'readAllFiles': {
      const {
        // directoryName,
        keyPath,
      } = args;
      const files = await readAllFiles(rootDirectory, keyPath);

      // post response message to the parent thread
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: files,
      });
      break;
    }
    case 'getFileSize': {
      const {
        // directoryName,
        keyPath,
      } = args;
      const size = await getFileSize(rootDirectory, keyPath);

      // post response message to the parent thread
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: size,
      });
      break;
    }
    case 'getDirectorySize': {
      const {
        // directoryName,
        keyPath,
      } = args;
      const size = await getDirectorySize(rootDirectory, keyPath);

      // post response message to the parent thread
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: size,
      });
      break;
    }
    case 'deleteFile': {
      const {
        // fileName,
        keyPath,
      } = args;
      // const p = makePromise();
      // cbs.set(id, p);
      await deleteFile(rootDirectory, keyPath);
      // p.resolve();
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: null,
      });
      break;
    }
    case 'clearDirectory': {
      const {
        // directoryName,
        keyPath,
      } = args;
      // const p = makePromise();
      // cbs.set(id, p);
      await clearDirectory(rootDirectory, keyPath);
      // p.resolve();
      self.postMessage({
        method: 'response',
        id,
        err: null,
        result: null,
      });
      break;
    }
    default: {
      console.error('Unsupported operation:', method);
      break;
    }
  }
};

async function getRootDirectory() {
  return await navigator.storage.getDirectory();
}
async function getDirectoryHandle(rootDirectory, keyPath) {
  let directoryHandle = rootDirectory;
  for (const key of keyPath) {
    const keyString = key + '';
    directoryHandle = await directoryHandle.getDirectoryHandle(keyString, { create: true });
  }
  return directoryHandle;
}
async function getFileHandle(rootDirectory, keyPath) {
  const directoryHandle = await getDirectoryHandle(rootDirectory, keyPath.slice(0, -1));
  const fileName = keyPath[keyPath.length - 1] + '';
  const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
  return fileHandle;
}

async function writeFile(rootDirectory, keyPath, value) {
  const fileHandle = await getFileHandle(rootDirectory, keyPath);

  // console.log('worker writeFile', {
  //   rootDirectory,
  //   keyPath,
  //   value,
  // }, new Error().stack);

  // Create a FileSystemSyncAccessHandle
  const syncAccessHandle = await fileHandle.createSyncAccessHandle();

  // Write to the file
  syncAccessHandle.write(value);

  // Close the handle
  await syncAccessHandle.close();
}

async function readFile(rootDirectory, keyPath) {
  // Create a new file
  const fileHandle = await getFileHandle(rootDirectory, keyPath);

  // read the normal way, without locking
  const file = await fileHandle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  return arrayBuffer;
}

async function readDirectory(rootDirectory, keyPath) {
  const baseDirectoryHandle = await getDirectoryHandle(rootDirectory, keyPath);

  const fileNames = [];
  for await (const entry of baseDirectoryHandle.values()) {
    // if (entry.kind === 'file') {
      fileNames.push(entry.name);
    // }
  }
  return fileNames;
}
async function readAllFiles(rootDirectory, keyPath) {
  const fileNames = await readDirectory(rootDirectory, keyPath);
  const filePromises = fileNames.map(async fileName => {
    return await readFile(rootDirectory, keyPath.concat(fileName));
  });
  return await Promise.all(filePromises);
}
async function getFileSize(rootDirectory, keyPath) {
  const fileHandle = await getFileHandle(rootDirectory, keyPath);

  // read the normal way, without locking
  const file = await fileHandle.getFile();
  const size = await file.size;
  return size;
}
async function getDirectorySize(rootDirectory, keyPath) {
  const baseDirectoryHandle = await getDirectoryHandle(rootDirectory, keyPath);

  let size = 0;
  for await (const entry of baseDirectoryHandle.values()) {
    if (entry.kind === 'file') {
      const fileName = entry.name;
      const fileSize = await getFileSize(rootDirectory, keyPath.concat(fileName));
      size++;
    }
  }
  return size;
}

async function deleteFile(rootDirectory, keyPath) {
  const baseDirectoryHandle = await getDirectoryHandle(rootDirectory, keyPath.slice(0, -1));
  await baseDirectoryHandle.removeEntry(keyPath[keyPath.length - 1], {
    recursive: true,
  });
}

async function clearDirectory(rootDirectory, keyPath) {
  const directoryHandle = await getDirectoryHandle(rootDirectory, keyPath);
  for await (const entry of directoryHandle.values()) {
    await directoryHandle.removeEntry(entry.name, {
      recursive: true,
    });
  }
}