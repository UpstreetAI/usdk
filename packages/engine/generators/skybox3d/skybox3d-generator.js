// import {
//   // img2img,
//   generateImage,
//   setSdModel,
// } from '../../generate-image.js';
import {
  SupabaseFsWorker,
} from '../../supabase-fs-worker.js';
import {
  generateSkyboxFull,
  // skyboxStyleNames,
  // defaultSkyboxStyleName,
} from '../../clients/blockade-labs-client.js';
import {
  getScreenshotBlob,
  // heroImageNpcRenderers,
} from '../../preview-screenshot.js';
import {
  getDepthField,
} from '../../clients/depth-client.js';
import {
  backgroundModel,
  backgroundLora,

  backgroundPrompt,
  backgroundNegativePrompt,
} from '../../constants/model-constants.js';

import {
  makePromise,
  blob2img,
  downloadFile,
} from '../../util.js';

//


const getFileName = u => u.match(/[^\/]+$/)[0];
const copyBlockadeLabsFileToLocal = async (file_url, suffix = '') => {
  file_url = new URL(file_url);
  file_url.protocol = 'https:';
  file_url.host = aiProxyHost;
  file_url.pathname = '/api/ai/blockadelabs' + file_url.pathname;
  file_url = file_url.href;

  const res = await fetch(file_url);
  const blob = await res.blob();

  file_url = new URL(file_url);
  file_url.pathname += suffix;
  file_url = file_url.href;
  const fileName = getFileName(file_url);

  return await writeMirrorFile(fileName, blob);
};

export const generateSkybox3D = async ({
  prompt,
  styleName,
  enhance,
  imageUrl,
  depthMapFile,
}) => {
  const generateSkyboxFromFiles = async ({
    imageFile,
    depthMapFile,
  }) => {
    const panel = storyboard.addPanelFromFile(file);
    // wait for file add
    {
      const p = makePromise();
      const onbusyupdate = e => {
        if (!panel.isBusy()) {
          cleanup();
          // setBusy(panel.isBusy());
          // setBusyMessage(panel.getBusyMessage());
          p.resolve();
        }
      };
      panel.addEventListener('busyupdate', onbusyupdate);
      const cleanup = () => {
        panel.removeEventListener('busyupdate', onbusyupdate);
      };
      await p;
    }
    // compile
    console.log('compile 1', {
      panel,
      storyboard,
    });
    await panel.compile();
    console.log('compile 2', {
      panel,
      storyboard,
    });

    const imageArrayBuffer = panel.getLayer(0).getData('image');
    const imageBlob = new Blob([imageArrayBuffer], {
      type: 'image/png',
    });

    const uint8Array = await storyboard.exportAsync();
    console.log('compile 3', {
      panel,
      storyboard,
      uint8Array,
    });
    const zineBlob = new Blob([
      zineMagicBytes,
      uint8Array,
    ], {
      type: 'application/octet-stream',
    });
    // downloadFile(resultBlob, 'storyboard.zine');

    return {
      imageBlob,
      zineBlob,
    };
  };
  const generateSkyboxFromPrompt = async ({
    prompt,
  }) => {
    const skyboxResult = await generateSkyboxFull(imagePrompt);
    // console.log('got skybox result', skyboxResult);
    const {
      file_url,
      depth_map_url,
    } = skyboxResult;

    const [
      fileUrl,
      depthMapUrl,
    ] = await Promise.all([
      copyBlockadeLabsFileToLocal(file_url, '_diffuse'),
      copyBlockadeLabsFileToLocal(depth_map_url, '_depth'),
    ]);

    const skybox3dItem = {
      description: prompt,
      fileUrl,
      depthMapUrl,
    };
    return skybox3dItem;
  };

  if (imageUrl && depthMapUrl) {
    const result = await generateSkyboxFromFiles({
      fileUrl,
      depthMapUrl,
    });
    return result;
  } else {
    const negativePrompt = '';
    const skyboxResult = await generateSkyboxFull(prompt, negativePrompt, {
      styleName,
      enhance,
    });
    const {
      file_url,
      depth_map_url,
    } = skyboxResult;

    return {
      description: prompt,
      fileUrl: file_url,
      depthMapUrl: depth_map_url,
    };
  }
};
export const batchGenerateSkybox3Ds = async (files) => {
  // XXX
};

export const generateSkybox3DAsset = async ({
  prompt,
  styleName,
  enhance,

  file,

  name,
  description = prompt,
  supabaseClient,
  sessionUserId,

  debug,
  setGenerationStatus,
}) => {
  const skybox3DResult = await generateSkybox3D({
    prompt,

    styleName,
    enhance,

    file,
  });
  const {
    depthMapUrl,
    fileUrl,
  } = skybox3DResult;

  // create a blob of the file at fileUrl
  const res = await fetch(fileUrl);
  const imageBlob = await res.blob();

  const depthMapRes = await fetch(depthMapUrl);
  const depthMapBlob = await depthMapRes.blob();

  //

  console.log('generate panel 3d 3', {
    imageBlob,
  });

  const supabaseFsWorker = new SupabaseFsWorker({
    supabase: supabaseClient.supabase,
    bucketName: 'public',
  });

  const id = crypto.randomUUID();
  const keyPath = ['skybox3D', id].concat('image.png');
  const keyPathDepthMap = ['skybox3D', id].concat('depthMap.png');
  const [
    fileUrlUploaded,
    depthMapUrlUploaded,
  ] = await Promise.all([
    supabaseFsWorker.writeFile(keyPath, imageBlob),
    supabaseFsWorker.writeFile(keyPathDepthMap, depthMapBlob),
  ]);

  const json = {
    name,
    description,
    fileUrl: fileUrlUploaded,
    depthMapUrl: depthMapUrlUploaded,
  }
  const jsonBlob = new Blob([
    JSON.stringify(json),
  ], {
    type: 'application/json',
  });

  const previewImageBlob = await getScreenshotBlob(jsonBlob, 'skybox3d');
  // const previewImageBlob = await resizeImage(imageBlob, previewSize, previewSize);

  const previewKeyPath = ['skybox3D', id].concat('preview.png');
  const preview_url = await supabaseFsWorker.writeFile(previewKeyPath, previewImageBlob);
  const json2 = {
    ...json,
    preview_url,
  };
  const jsonBlob2 = new Blob([
    JSON.stringify(json2),
  ], {
    type: 'application/json',
  });

  const skyboxFileName = 'skybox.skybox3d';
  const skyboxKeyPath = ['skybox3D', id].concat(skyboxFileName);
  const skybox3dUrl = await supabaseFsWorker.writeFile(skyboxKeyPath, jsonBlob2);

  //

  const skybox3DAsset = {
    id,
    name,
    description,
    preview_url,
    type: 'skybox3d',
    start_url: skybox3dUrl,
    user_id: sessionUserId,
  };

  console.log('skybox3DAsset', skybox3DAsset)

  const result = await supabaseClient.supabase
    .from('assets')
    .upsert(skybox3DAsset);

  console.log('result', result)

  return skybox3DAsset;
};
