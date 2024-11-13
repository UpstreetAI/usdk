import {
  getHeroImageBlob,
} from '../../preview-screenshot.js';
import {
  SupabaseFsWorker,
} from '../../supabase-fs-worker.js';
import {
  makeId,
} from '../../util.js';

export const createNpcAsset = async ({
  id = crypto.randomUUID(), // for editing an existing npc

  name,
  description,
  personality,
  scenario,
  firstMessage,
  messageExample,

  avatar,

  voiceEndpoint,
  voicePack,

  supabaseClient,
  sessionUserId,

  debug,
}) => {
  const avatarUrl = avatar.start_url;
  const npc = {
    name,
    description,
    personality,
    scenario,
    firstMessage,
    messageExample,
    previewUrl: avatar.preview_url,
    avatarUrl,
    voiceEndpoint,
    voicePack,
  };

  //

  const supabaseFsWorker = new SupabaseFsWorker({
    supabase: supabaseClient.supabase,
    bucketName: 'public',
  });

  //

  const blob = new Blob(
    [
      JSON.stringify(npc, null, 2),
    ],
    {
      type: 'application/npc',
    },
  );
  const [
    start_url,
    heroUrl,
  ] = await Promise.all([
    (async () => {
      const keyPath = ['assets', `${id}.npc`];
      return await supabaseFsWorker.writeFile(keyPath, blob);
    })(),
    (async () => {
      const heroImgBlob = await getHeroImageBlob(blob, 'npc', /* {
        type: 'image/jpeg',
      } */);
      const keyPath = ['heroImages', `${id}-${makeId(8)}.jpg`];
      return await supabaseFsWorker.writeFile(keyPath, heroImgBlob);
    })(),
  ]);

  const heroUrls = [];
  if (heroUrl) {
    heroUrls.push(heroUrl);

    if (debug) {
      const img = new Image();
      img.src = heroUrl;
      img.style.cssText = `\
        position: fixed;
        top: 0;
        left: 0;
        width: 512px;
        height: 512px;
        z-index: 1;
      `;
      document.body.appendChild(img);
    }
  }

  const npcAsset = {
    id,
    type: 'npc',
    name,
    description,
    start_url,
    preview_url: avatar.preview_url,
    hero_urls: heroUrls,
    user_id: sessionUserId,
  };
  const result = await supabaseClient.supabase
    .from('assets')
    .upsert(npcAsset);

  return npcAsset;
};