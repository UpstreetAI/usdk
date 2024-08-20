import { fileURLToPath } from 'url';
async function requireResolve(specifier) {
  const resolved = await import.meta.resolve(specifier);
  return fileURLToPath(resolved);
}

const nativeNodeModulesPlugin = () => ({
  name: 'native-node-modules',
  setup(build) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve 
    // it to an absolute path and put it into the "node-file" virtual namespace.
    build.onResolve({ filter: /\.node$/, namespace: 'file' }, async args => {
      const path = await requireResolve(args.path, { paths: [args.resolveDir] });
      // console.log('resolve path 1', {
      //   path,
      //   args,
      // });
      return {
        path,
        namespace: 'node-file',
      };
    });

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    build.onLoad({ filter: /.*/, namespace: 'node-file' }, async args => {
      // console.log('resolve path 2', {
      //   args,
      // });
      return {
        contents: `
          import path from ${JSON.stringify(args.path)}
          try { module.exports = require(path) }
          catch {}nativeNodeModulesPlugin
        `,
      };
    });

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    build.onResolve(
      { filter: /\.node$/, namespace: 'node-file' },
      async (args) => {
        // console.log('resolve path 3', {
        //   args,
        // });
        return {
          path: args.path,
          namespace: 'file',
        };
      },
    );

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    let opts = build.initialOptions
    opts.loader = opts.loader || {}
    opts.loader['.node'] = 'file'
  },
});
export default nativeNodeModulesPlugin;
