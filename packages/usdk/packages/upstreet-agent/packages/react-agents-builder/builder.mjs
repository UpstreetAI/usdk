import path from 'path';
import * as esbuild from 'esbuild-wasm';
import { globalImports } from 'react-agents/util/worker-global-imports.mjs'

const ensureEsbuild = (() => {
  let esBuildPromise = null;
  return () => {
    if (!esBuildPromise) {
      esBuildPromise = (async () => {
        try {
          const u = new URL('esbuild-wasm/esbuild.wasm', import.meta.url);
          let opts = {};
          if (typeof window !== 'undefined') {
            opts = {
              ...opts,
              worker: true,
              wasmURL: u.href,
            };
          }
          await esbuild.initialize(opts);
        } catch (err) {
          console.warn('failed to initialize esbuild', err);
        }
      })();
    }
    return esBuildPromise;
  };
})();

/* const defaultFiles = [
  {
    path: '/example.ts',
    content: `\
      export const example = 'This is an example module';
    `,
  },
]; */

//

export const buildAgentSrc = async (sourceCode, {
  files = [],
} = {}) => {
  await ensureEsbuild();

  const fileMap = new Map(files.map(file => [file.path, file.content]));
  const filesNamespace = 'files';
  const globalImportMap = new Map(Array.from(Object.entries(globalImports)));
  const globalNamespace = 'globals';

  const result = await esbuild.build({
    stdin: {
      contents: sourceCode,
      resolveDir: '/', // Optional: helps with resolving imports
      sourcefile: 'app.tsx', // Optional: helps with error messages
      loader: 'tsx', // Set the appropriate loader based on the source type
    },
    bundle: true,
    write: false,
    // outdir: 'dist',
    format: 'esm',
    plugins: [
      {
        name: 'globals-plugin',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const p = args.path;
            const globalName = globalImportMap.get(p);
            // console.log('got resolve', {args, p, globalName});
            if (globalName) {
              return { path: p, namespace: globalNamespace };
            }
            return null; // Continue with the default resolution
          });
          build.onLoad({ filter: /.*/, namespace: globalNamespace }, (args) => {
            const p = args.path;
            const globalName = globalImportMap.get(p);
            // console.log('got load', {args, p, globalName});
            if (globalName) {
              return {
                // globalImports is initialized by the worker wrapper
                contents: `module.exports = globalImports[${JSON.stringify(globalName)}];`,
                loader: 'js',
              };
            }
            return null; // Continue with the default loading
          });
        },
      },
      {
        name: 'files-plugin',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const p = path.resolve(args.resolveDir, args.path);
            // console.log('got resolve', {args, p});
            if (fileMap.has(p)) {
              return { path: p, namespace: filesNamespace };
            }
            return null; // Continue with the default resolution
          });
          build.onLoad({ filter: /.*/, namespace: filesNamespace }, (args) => {
            // console.log('got load', args);
            const p = args.path;
            const contents = fileMap.get(p);
            if (contents) {
              return { contents, loader: 'tsx' };
            }
            return null; // Continue with the default loading
          });
        },
      },
    ],
  });
  const {
    errors = [],
    outputFiles = [],
  } = result;
  if (errors.length === 0) {
    if (outputFiles.length > 0) {
      const outputFile = outputFiles[0];
      // console.log('got output file', outputFile);
      const { contents } = outputFile;
      const textDecoder = new TextDecoder();
      const text = textDecoder.decode(contents);
      // console.log('got contents');
      // console.log(text);
      return text;
    } else {
      console.warn('no output files');
      throw new Error('Failed to build: no output files');
    }
  } else {
    console.warn('build errors: ', errors);
    throw new Error('Failed to build: ' + JSON.stringify(errors));
  }
};