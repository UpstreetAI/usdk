import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);

export const getStaticAsset = async (
  request,
  env,
  { waitUntil = async () => {} } = {},
) => {
  // console.log('get static asset', request.url, request);
  console.log('got manifest', Object.keys(env.__STATIC_CONTENT), assetManifest);

  try {
    // Add logic to decide whether to serve an asset or run your original Worker code
    return await getAssetFromKV(
      {
        request,
        waitUntil,
      },
      {
        ASSET_NAMESPACE: env.__STATIC_CONTENT,
        ASSET_MANIFEST: assetManifest,
      },
    );
  } catch (e) {
    return null;
  }
};
