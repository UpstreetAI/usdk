import path from 'path';
import recursiveCopy from 'recursive-copy';
import * as esbuild from 'esbuild';

(async () => {
  const result = await esbuild.build({
    entryPoints: ['cli.mjs'],
    bundle: true,
    inject: [
      './util/build/import-meta-url.js',
      // './util/build/import-meta-readFile.js',
      // './util/build/import-meta-resolve.js',
    ],
    define: {
      'import.meta.url': 'import_meta_url',
      // 'import.meta.readFile': 'import_meta_readFile',
      // 'import.meta.resolve': 'import_meta_resolve',
    },
    platform: 'node',
    // format: 'esm',
    format: 'cjs',
    outfile: 'dist/bundle.js',
    external: ['ncc-pure-js'],
  });
  // console.log('got result', result);

  await recursiveCopy(
    path.join('sdk', 'wrangler.toml'),
    path.join('dist', 'sdk', 'wrangler.toml'),
  );
})();
