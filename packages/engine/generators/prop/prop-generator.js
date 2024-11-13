import {
  SupabaseFsWorker,
} from '../../supabase-fs-worker.js';

export const createPropAsset = async ({
  id = crypto.randomUUID(), // for editing an existing prop

  name,
  description,
  asset,

  supabaseClient,
  sessionUserId,
}) => {
  const assetUrl = asset.start_url;
  const prop = {
    name,
    description,
    assetUrl,
    previewUrl: asset.preview_url,
  };

  //

  const supabaseFsWorker = new SupabaseFsWorker({
    supabase: supabaseClient.supabase,
    bucketName: 'public',
  });

  //

  const keyPath = ['assets', `${id}.prop`];
  const s = JSON.stringify(prop, null, 2);
  const start_url = await supabaseFsWorker.writeFile(keyPath, s);

  //

  const propAsset = {
    id,
    type: 'prop',
    name,
    description,
    start_url,
    preview_url: asset.preview_url,
    user_id: sessionUserId,
  };
  const result = await supabaseClient.supabase
    .from('assets')
    .upsert(propAsset);

  return propAsset;
};