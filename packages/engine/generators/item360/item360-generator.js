// import {
//   basename,
// } from '../../util.js';
import {
  removeBackground,
} from '../../clients/background-removal-client.js';
import * as vqa from '../../vqa.js';
import {
  generate360Views,
  drawSlices,
} from '../../clients/zero123-client.js';
import {
  SupabaseFsWorker,
} from '../../supabase-fs-worker.js';
import {
  // generateImage,
  img2img,
  // interrogateDeepBooru,
  setSdModel,
  generateImageHd,
} from '../../generate-image.js';
// import {
//   squareize,
//   makeMaskCanvas,
// } from '../../generators/character/character-generator.js';
import {
  getScreenshotBlob,
  // heroImageNpcRenderers,
} from '../../preview-screenshot.js';
import {
  squareize,
  makeMaskCanvas,
  makeGradientCanvas,
  opacify,
} from '../../utils/canvas-utils.js';
import {
  itemModel,
  itemLora,

  itemPrompt,
  itemNegativePrompt,
} from '../../constants/model-constants.js';
import {
  makeId,
  blob2img,
  blob2DataUrl,
  downloadFile,
} from '../../util.js';
// import {
//   zbencode,
//   zbdecode,
// } from '../../../zjs/encoding.mjs';

//

// const itemMagicBytes = 'ITEM';

//

const preprocessItemImageFile = async blob => {
  let containBlob = await removeBackground(blob);
  containBlob = await squareize(containBlob, 512, 0.1);
  return containBlob;
};
const generateItemFromFile = async (itemImageBlob, prompt, setGenerationStatus, debug) => {
  setGenerationStatus && setGenerationStatus('Generating description...');
  const description = prompt || await vqa.imageCaptioning(itemImageBlob);
  console.log('got description', {
    description,
  });
  setGenerationStatus && setGenerationStatus('Estimating height...');
  const height = await vqa.llava(itemImageBlob, 'How tall is this in meters?');
  console.log('got height', {
    height,
  });
  setGenerationStatus && setGenerationStatus('Converting blob to image...');
  const itemImage = await blob2img(itemImageBlob);
  if(debug) {
    itemImage.style.cssText = `\
      position: absolute;
      top: 0;
      left: 0;
      width: 512px;
      height: 512px;
      z-index: 1;
    `;
    document.body.appendChild(itemImage);
  }

  console.log('remove background')
  setGenerationStatus && setGenerationStatus('Removing background...');
  const foregroundItemImageBlob = await removeBackground(itemImageBlob);
  setGenerationStatus && setGenerationStatus('Generating opaque image...');
  console.log('got foreground item image blob', foregroundItemImageBlob);
  const foregroundItemOpaqueImageBlob = await opacify(foregroundItemImageBlob);
  setGenerationStatus && setGenerationStatus('Converting opaque blob to image...');
  console.log('got foreground item opaque image blob', foregroundItemOpaqueImageBlob);
  const foregroundItemOpaqueImage = await blob2img(foregroundItemOpaqueImageBlob);
  setGenerationStatus && setGenerationStatus('Generating 360 views...');
  console.log('got foreground item opaque image', foregroundItemOpaqueImage);
  
  if(debug) {
    foregroundItemOpaqueImage.classList.add('foreground');
    foregroundItemOpaqueImage.style.cssText = `\
      position: absolute;
      top: 0;
      left: 512px;
      width: 512px;
      height: 512px;
      z-index: 1;
    `;
    document.body.appendChild(foregroundItemOpaqueImage);
  }

  const slices = await generate360Views(foregroundItemOpaqueImageBlob, {
    debug,
  });
  console.log('got slices', slices);
  const canvas = drawSlices(slices);
  setGenerationStatus && setGenerationStatus('Converting 360 views to image...');
  const item360ImageBlob = await new Promise((accept, reject) => {
    canvas.toBlob(accept, 'image/png');
  });
  // destroy canvas
  canvas.remove();
  console.log('got item 360 image blob', item360ImageBlob);
  setGenerationStatus && setGenerationStatus('Removing background from 360 views...');
  const item360ImageForegroundBlob = await removeBackground(item360ImageBlob);
  console.log('got item 360 image foreground blob', item360ImageForegroundBlob);
  setGenerationStatus && setGenerationStatus('Generating 360 image URL...');
  const item360ImageUrl = await blob2DataUrl(item360ImageForegroundBlob);
  // console.log('got item 360 image url', item360ImageUrl);
  setGenerationStatus && setGenerationStatus('Generating item image URL...');
  const itemImageUrl = await blob2DataUrl(foregroundItemImageBlob);
  // console.log('got item image url', itemImageUrl);

  // return the result
  const o = {
    description,
    height,
    itemImageUrl,
    item360ImageUrl,
  };
  console.log('got o', o);
  setGenerationStatus && setGenerationStatus('Generated item file...');
  return o;

  // const uint8Array = zbencode(o);
  // console.log('got zbencode result', {
  //   uint8Array,
  // });

  // const blob = new Blob([
  //   itemMagicBytes,
  //   uint8Array,
  // ], {
  //   type: 'application/octet-stream',
  // });
  // // downloadFile(blob, 'item.itemb');
  // return blob;
};
export const generateItem = async ({
  file,
  prompt,
  setGenerationStatus,
  debug,
}) => {
  if (file) {
    console.log('generate item from file', file);

    const blob = file;
    const containBlob = preprocessItemImageFile(blob);
    const o = await generateItemFromFile(containBlob, prompt, setGenerationStatus, debug);
    return o;

    // const [
    //   itemImageUrl,
    //   item360ImageUrl,
    // ] = await Promise.all([
    //   blob2DataUrl(containBlob),
    //   (async () => {
    //     const slices = await generate360Views(containBlob, {
    //       debug: true,
    //     });
    //     const canvas = drawSlices(slices);

    //     // export frame canvas
    //     const blob3 = await new Promise((accept, reject) => {
    //       canvas.toBlob(accept, 'image/png');
    //     });
    //     const item360ImageUrl = await blob2DataUrl(blob3);
    //     return item360ImageUrl;
    //   })(),
    // ]);

    // await itemsClient.waitForLoad();

    // const id = crypto.randomUUID();
    // const itemItem = {
    //   id,
    //   name,
    //   description: prompt,
    //   itemImageUrl,
    //   item360ImageUrl,
    // };
    // await itemsClient.addItem(itemItem);
  } else {
    const fullPrompt = (itemLora ? (itemLora + ' ') : '') + `${prompt ? `${prompt}, ` : ''}${itemPrompt}`;
    const negativePrompt = itemNegativePrompt;

    const size = 1024;

    // console.log('generate item from prompt', {
    //   prompt,
    //   fullPrompt,
    //   negativePrompt,
    // });

    const gradientCanvas = makeGradientCanvas(size, size);
    const image = gradientCanvas.toDataURL('image/png');
    if(debug) {
      gradientCanvas.style.cssText = `\
        position: absolute;
        top: 0;
        left: 0;
        width: 512px;
        height: 512px;
        z-index: 1;
      `;
      document.body.appendChild(gradientCanvas);
    }
    // debugger;

    const maskCanvas = makeMaskCanvas(size, size, 0, 0, size, size, false);
    const mask = maskCanvas.toDataURL('image/png');
    setGenerationStatus && setGenerationStatus('Loading model...')
    // await setSdModel(objectModel);
    await setSdModel(itemModel);
    setGenerationStatus && setGenerationStatus('Generating image...');
    const itemImageBlob = await generateImageHd({
      prompt: fullPrompt + ": inventory item, product shot, product preview, front-view on white background -- no shadow, shadow removed, backlit",
      negativePrompt,

      width: size,
      height: size,

      image,
      mask,

      // steps: 100,

      denoising_strength: 0.9,
    });

    const o = await generateItemFromFile(itemImageBlob, prompt, setGenerationStatus, debug);
    return o;
  }
};
export const batchGenerateItems = async (files, setGenerationStatus, debug) => {
  // console.log('batch generate items', {files});

  for (const file of files) {
    const containBlob = await preprocessItemImageFile(file);
    await generateItemFromFile(containBlob);
  }
};

export const generateItemAsset = async ({
  prompt,

  file,

  name,
  description = prompt,
  supabaseClient,
  sessionUserId,
  
  setGenerationStatus,
  debug,
}) => {
  const item360Result = await generateItem({
    prompt,
    file,
    setGenerationStatus
  });
  const {
    height,
    itemImageUrl: imageUrl2,
    item360ImageUrl: image360Url2,
  } = item360Result;

  // initialize the supabase fs worker
  const supabaseFsWorker = new SupabaseFsWorker({
    supabase: supabaseClient.supabase,
    bucketName: 'public',
  });

  const id = crypto.randomUUID();
  const imageUrl3 = await (async () => {
    const res = await fetch(imageUrl2);
    const blob = await res.blob();

    const fileName = 'image.png';
    const keyPath = ['item360', id].concat(fileName);
    const start_url = await supabaseFsWorker.writeFile(keyPath, blob);
    return start_url;
  })();
  const item360ImageUrl = await (async () => {
    const res = await fetch(image360Url2);
    const blob = await res.blob();

    const fileName = 'image360.png';
    const keyPath = ['item360', id].concat(fileName);
    const start_url = await supabaseFsWorker.writeFile(keyPath, blob);
    return start_url;
  })();
  const item360Json = {
    imageUrl: imageUrl3,
    item360ImageUrl,
    name: name,
    description,
    height,
  };
  console.log('save json 1', item360Json);
  const item360JsonString = JSON.stringify(item360Json);
  const item360JsonBlob = new Blob([
    item360JsonString,
  ], {
    type: 'application/json',
  });

  const previewBlob = await getScreenshotBlob(item360JsonBlob, 'item360');
  const previewFileName = `preview-${makeId(8)}.png`;
  const previewKeyPath = ['item360', id].concat(previewFileName);
  const preview_url = await supabaseFsWorker.writeFile(previewKeyPath, previewBlob);

  const item360Json2 = {
    ...item360Json,
    preview_url,
  };
  console.log('save json 2', item360Json2);
  const item360JsonString2 = JSON.stringify(item360Json2);
  const item360JsonBlob2 = new Blob([
    item360JsonString2,
  ], {
    type: 'application/json',
  });

  const fileName = 'item360.item360';
  const keyPath = ['item360', id].concat(fileName);
  const image360JsonUrl = await supabaseFsWorker.writeFile(keyPath, item360JsonBlob2);

  const item360Asset = {
    id,
    name,
    description,
    type: 'item360',
    preview_url,
    start_url: image360JsonUrl,
    user_id: sessionUserId,
  };
  const result = await supabaseClient.supabase
    .from('assets')
    .upsert(item360Asset);

  return item360Asset;
};