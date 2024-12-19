import path from 'path';
import fs from 'fs';
import { mkdirp } from 'mkdirp';
import { rimraf } from 'rimraf';
import toml from '@iarna/toml';
import { getCurrentDirname } from '../react-agents/util/path-util.mjs';
import { makeId } from 'react-agents/util/util.mjs';

const dirname = getCurrentDirname(import.meta, process);
const copyWithStringTransform = async (src, dst, transformFn = (s) => s) => {
  let s = await fs.promises.readFile(src, 'utf8');
  s = transformFn(s);
  await mkdirp(path.dirname(dst));
  await fs.promises.writeFile(dst, s);
};
const buildWranglerToml = (
  t,
  opts = {},
) => {
  for (const k in opts) {
    t[k] = opts[k];
  }
  return t;
};

const upstreetAgentDir = path.join(dirname, '..', '..');

export const installAgent = async (directory) => {
  // create temp runtime directory
  // const dotRuntime = path.join(directory, '.runtime');
  // const name = makeId(8);
  // const dstDir = path.join(dotRuntime, name);
  // await mkdirp(dstDir);

  const packageJson = JSON.parse(await fs.promises.readFile(path.join(upstreetAgentDir, 'package.json'), 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies);

  const srcNodeModules = path.join(upstreetAgentDir, 'node_modules');
  const dstNodeModules = path.join(directory, 'node_modules');
  await mkdirp(dstNodeModules);

  // remove old dependencies in node_modules
  await Promise.all(dependencies.map(async (name) => {
    const d = path.dirname(name);
    if (d !== '.') {
      // remove the directory
      await rimraf(path.join(dstNodeModules, d));
    }
    const dst = path.join(dstNodeModules, name);
    await rimraf(dst);
  }));

  // symlink node_modules deps
  await Promise.all(dependencies.map(async (name) => {
    const d = path.dirname(name);
    if (d !== '.') {
      // precreate the directory
      await mkdirp(path.join(dstNodeModules, d));
    }
    const src = path.join(srcNodeModules, name);
    const dst = path.join(dstNodeModules, name);
    await fs.promises.symlink(src, dst);
  }));

  const name = makeId(8);

  const srcEntryJs = path.join(upstreetAgentDir, 'packages', 'react-agents-node', 'entry.mjs');
  const dstEntryJs = path.join(directory, 'entry.mjs');

  const srcMainJsx = path.join(upstreetAgentDir, 'main.jsx');
  const dstMainJsx = path.join(directory, 'main.jsx');

  const srcDurableObjectTsx = path.join(upstreetAgentDir, 'durable-object.tsx');
  const dstDurableObjectTsx = path.join(directory, 'durable-object.tsx');

  const srcWranglerToml = path.join(upstreetAgentDir, 'wrangler.toml');
  const dstWranglerToml = path.join(directory, `.wrangler-${name}.toml`);

  const agentPath = directory;

  // set up the wrangler environment
  await Promise.all([
    // wrangler.toml
    copyWithStringTransform(srcWranglerToml, dstWranglerToml, (s) => {
      let t = toml.parse(s);
      t = buildWranglerToml(t, {
        name: name.toLowerCase(),
        // main: `.agents/${name}/main.jsx`,
        // main: `main.jsx`,
      });
      return toml.stringify(t);
    }),
    // main.jsx
    copyWithStringTransform(srcMainJsx, dstMainJsx),
    // durable-object.tsx
    copyWithStringTransform(srcDurableObjectTsx, dstDurableObjectTsx),
    // entry.mjs
    copyWithStringTransform(srcEntryJs, dstEntryJs),
    // link src directory
    // fs.promises.symlink(directory, path.join(agentPath, 'src')),
  ]);
  // console.log(dstDir); */

  const cleanup = async () => {
    await Promise.all([
      rimraf(dstWranglerToml),
      rimraf(dstEntryJs),
      rimraf(dstMainJsx),
    ]);
  };

  return {
    agentPath,
    entryJsPath: dstEntryJs,
    wranglerTomlPath: dstWranglerToml,
    cleanup,
  };
};