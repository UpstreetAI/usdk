import {
  removeBackground,
} from '../../clients/background-removal-client.js';
import * as vqa from '../../vqa.js';
import {
  generate360Views,
  drawSlices,
} from '../../clients/zero123-client.js';
import {
  makeGradientCanvas,
  opacify,
} from '../../utils/canvas-utils.js';
import {
  downloadFile,
} from '../../util.js';

//

const itemMagicBytes = 'MOBB';

throw new Error('not implemented');

//

const preprocessItemImageFile = async blob => {
  let containBlob = await removeBackground(blob);
  containBlob = await squareize(containBlob, 512, 0.1);
  return containBlob;
};
const generateItemFromFile = async itemImageBlob => {
  const description = await vqa.imageCaptioning(itemImageBlob);
  console.log('got description', {
    description,
  });

  const itemImage = await blob2img(itemImageBlob);
  itemImage.style.cssText = `\
    position: absolute;
    top: 0;
    left: 0;
    width: 512px;
    height: 512px;
    z-index: 1;
  `;
  document.body.appendChild(itemImage);

  const foregroundItemImageBlob = await removeBackground(itemImageBlob);
  const foregroundItemOpaqueImageBlob = await opacify(foregroundItemImageBlob);
  const foregroundItemOpaqueImage = await blob2img(foregroundItemOpaqueImageBlob);
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

  const slices = await generate360Views(foregroundItemOpaqueImageBlob, {
    debug: true,
  });
  const canvas = drawSlices(slices);
  const item360ImageBlob = await new Promise((accept, reject) => {
    canvas.toBlob(accept, 'image/png');
  });

  const item360ImageUrl = await blob2DataUrl(item360ImageBlob);
  const itemImageUrl = await blob2DataUrl(foregroundItemImageBlob);

  // zbencode the result
  const o = {
    description,
    itemImageUrl,
    item360ImageUrl,
  };
  console.log('got o', o);
  const uint8Array = zbencode(o);
  console.log('got zbencode result', {
    uint8Array,
  });

  const blob = new Blob([
    itemMagicBytes,
    uint8Array,
  ], {
    type: 'application/octet-stream',
  });
  downloadFile(blob, 'item.itemb');

  // XXX add to database
  // const id = crypto.randomUUID();
  // const itemItem = {
  //   id,
  //   name,
  //   description: prompt,
  //   itemImageUrl,
  //   item360ImageUrl,
  // };
  // await itemsClient.addItem(itemItem);
};
export const generate = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  setGenerating(true);

  try {
    if (file) {
      console.log('generate item from file', file);

      const blob = file;

      const containBlob = preprocessItemImageFile(blob);
      await generateItemFromFile(containBlob);

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
      const fullPrompt = `${prompt}, anime style rpg item concept, asymmetric, white background`;
      const negativePrompt = `monochrome, symmetric`;

      const size = 512;

      console.log('generate item from prompt', name, fullPrompt);

      const gradientCanvas = makeGradientCanvas(size, size);
      const image = gradientCanvas.toDataURL('image/png');
      if(debug){
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

      await setSdModel(objectModel);
      const itemImageBlob = await img2img({
        prompt: fullPrompt,
        negativePrompt,

        width: size,
        height: size,

        image,
        mask,

        // steps: 100,
      });

      await generateItemFromFile(itemImageBlob);
    }
  } finally {
    setGenerating(false);
  }
};
export const batchGenerate = async (files) => {
  console.log('batch generate files', {files});

  for (const file of files) {
    const containBlob = await preprocessItemImageFile(file);
    await generateItemFromFile(containBlob);
  }
};
