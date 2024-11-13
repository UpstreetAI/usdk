import Simplex from '../../simplex-noise.js';
import {
  blob2img,
} from '../../../gen/src/utils/convert-utils.js';
import {
  // imageSegmentationMulti,
  imageSelection,
  imageFind,
} from '../../vqa.js';
import {
  img2img,
  interrogateDeepBooru,
  setSdModel,
} from '../../generate-image.js';
import {
  numFrames,
  numAngles,
  getFrameOffsetCoords,
  getFrameSize,
  renderSpriteImages,
} from '../../avatars/renderers/avatar-spriter.js';
import {
  // generateView,
  generate360Views,
  drawSlices,

  // angleTickRadians,
  numSlicesPerRow,
  numSlicesPerCol,
} from '../../clients/zero123-client.js';
import {
  // removeBackground,
  removeBackgroundAnime,
  // removeBackgroundAll,
} from '../../clients/background-removal-client.js';
import {
  characterModel,
  characterPrompt,
  characterNegativePrompt,
  characterDenoisingStrength,
} from '../../constants/model-constants.js';
import {
  squareize,
  makeGradientCanvas,
  opacify,
  makeNoiseBaseCanvas,
  makeMaskCanvas,
} from '../../utils/canvas-utils.js';
import { downloadFile } from '../../util.js';

//

const r = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER / 2);
const _previewBlob = async (blob, i) => {
  const image = await blob2img(blob);
  image.style.cssText = `\
    position: fixed;
    top: 62px;
    left: ${displaySize * i}px;
    width: ${displaySize}px;
    z-index: 1;
  `;
  document.body.appendChild(image);
  return image;
};
const displaySize = 256;

//

/* import {Live2DCubismFramework as live2dcubismframework} from '../../../CubismWebFramework/CubismSdkForWeb-4-r.7/Framework/src/live2dcubismframework.ts';
const CubismFramework = live2dcubismframework.CubismFramework;
import {CubismMoc} from '../../../CubismWebFramework/CubismSdkForWeb-4-r.7/Framework/src/model/cubismmoc.ts';
import {CubismModel} from '../../../CubismWebFramework/CubismSdkForWeb-4-r.7/Framework/src/model/cubismmodel.ts';
import {CubismRenderer_WebGL} from '../../../CubismWebFramework/CubismSdkForWeb-4-r.7/Framework/src/rendering/cubismrenderer_webgl.ts';
import {Live2DCubismCore} from '../../../CubismWebFramework/CubismSdkForWeb-4-r.7/Core/live2dcubismcore.js';
const loadLive2D = async () => {
  // init

  CubismFramework.startUp({
    logFunction: console.log,
    loggingLevel: 0,
  });
  CubismFramework.initialize();

  // model

  const basePath = `/avatarslive2d/mao_pro_en/runtime`;
  const u = `${basePath}/mao_pro_t03.moc3`;
  const res = await fetch(u);
  const buffer = await res.arrayBuffer();

  console.log('done 1', buffer);

  const moc = CubismMoc.create(buffer);
  const model = moc.createModel();

  console.log('done 2', model);

  let renderer = new CubismRenderer_WebGL();
  renderer.initialize(model);
  globalThis.renderer = renderer;

  console.log('done 3', renderer);

  return renderer;

  // textures

  const res2 = await fetch(`${basePath}/mao_pro_t03.model3.json`);
  const j = await res2.json();
  const {
    FileReferences: {
      Textures,
    },
  } = j;

  const img = [];

  // TypeScript
  for (let modelTextureNumber = 0; modelTextureNumber < Textures.length; modelTextureNumber++) {
    // Load texture into WebGL texture unit
    // let texturePath = this._modelSetting.getTextureFileName(modelTextureNumber);
    // texturePath = this._modelHomeDir + texturePath;
    img[modelTextureNumber] = new Image();
    img[modelTextureNumber].onload = () =>
    {
        // Create texture objects.
        let tex = gl.createTexture();
        // Select texture.
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        // Let Premult process
        if(usePremultiply)
        {
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        }
        // Write pixels to texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                      gl.UNSIGNED_BYTE, img[modelTextureNumber]);
        // Generate mipmap.
        gl.generateMipmap(gl.TEXTURE_2D);
        this.getRenderer().bindTexture(modelTextureNumber, tex);
    }
    img[modelTextureNumber].src = texturePath;
  }

  renderer.setIsPremultipliedAlpha(usePremultiply);

  return renderer;
};
globalThis.loadLive2D = loadLive2D; */

//

// export const characterModel = 'flat2dAnimergeV3F16.vzgC.safetensors';
// export const characterModel = 'mistoonAnime_v20.safetensors';

export const generateCharacterBaseFromPrompt = async ({
  prompt,
  negativePrompt,
  gender,
  seed,
  subseed,
  debug = false
}) => {
  // const negativePrompt = void 0;
  // const negativePrompt = `particles`;
  // const negativePrompt = '';
  // const negativePrompt = void 0;

  const characterBaseImage = await new Promise((accept, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    const src = `/images/character-base-${gender}.png`;
    img.src = src;
    img.onload = () => {
      accept(img);
    };
    img.onerror = reject;
  });
  const characterBaseCanvas = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = characterBaseImage.width;
    canvas.height = characterBaseImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(characterBaseImage, 0, 0);
    return canvas;
  })();
  // const characterBaseCtx = characterBaseCanvas.getContext('2d');

  const characterBlurImage = await new Promise((accept, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    const src = `/images/character-base-${gender}-blur.png`;
    img.src = src;
    img.onload = () => {
      accept(img);
    };
    img.onerror = reject;
  });

  // NOTE: the below will generate character-base-${gender}-blur.png
  // flood-fill within radius
  /* const imageData = characterBaseCtx.getImageData(0, 0, characterBaseCanvas.width, characterBaseCanvas.height);
  const srcUint8Array = Uint8Array.from(imageData.data);
  const radius = 10; // padding
  const radius2 = 32; // blur
  const baseAlpha = 1;
  const whitify = (dstUint8Array, alpha) => {
    for (let i = 0; i < srcUint8Array.length / 4; i++) {
      dstUint8Array[i * 4 + 0] = 128;
      dstUint8Array[i * 4 + 1] = 128;
      dstUint8Array[i * 4 + 2] = 128;
      dstUint8Array[i * 4 + 3] = Math.max(dstUint8Array[i * 4 + 3], alpha);
    }
  };
  const expandByRadius = (srcUint8Array, dstUint8Array, radius, blur) => {
    for (let i = 0; i < srcUint8Array.length / 4; i++) {
      const x = (i % characterBaseCanvas.width);
      const y = Math.floor(i / characterBaseCanvas.width);

      const v = srcUint8Array[i * 4 + 3];
      if (v > 128) {
        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            const r = Math.sqrt(dx * dx + dy * dy);
            if (r <= radius) {
              const xi = x + dx;
              const yi = y + dy;
              if (xi >= 0 && xi < characterBaseCanvas.width && yi >= 0 && yi < characterBaseCanvas.height) {
                const j = yi * characterBaseCanvas.width + xi;

                let v2;
                if (blur) {
                  v2 = 1 - (r / radius);
                } else {
                  v2 = 1;
                }
                v2 *= 255;
                v2 = Math.max(dstUint8Array[j * 4 + 3], v2);
                dstUint8Array[j * 4 + 0] = 255;
                dstUint8Array[j * 4 + 1] = 255;
                dstUint8Array[j * 4 + 2] = 255;
                dstUint8Array[j * 4 + 3] = v2;
              }
            }
          }
        }
      }
    }
  };
  whitify(imageData.data, baseAlpha);
  expandByRadius(srcUint8Array, imageData.data, radius2, true); */

  //

  const characterNoiseCanvas = makeNoiseBaseCanvas(characterBaseCanvas);
  if(debug){
    characterNoiseCanvas.classList.add('characterNoiseCanvas');
    characterNoiseCanvas.style.cssText = `\
    position: fixed;
    top: 62px;
    left: 0;
    width: ${displaySize}px;
    z-index: 1;
    `;
    document.body.appendChild(characterNoiseCanvas);
  }
  const image = characterNoiseCanvas.toDataURL('image/png');

  // (async () => {
  //   const imageReq = await fetch(image);
  //   const imageBlob = await imageReq.blob();
  //   downloadFile(imageBlob, 'test.png');
  // })();

  // const img = new Image();
  // img.crossOrigin = 'Anonymous';
  // img.src = image;
  // img.style.cssText = `\
  //   position: fixed;
  //   top: 62px;
  //   left: 1024px;
  //   width: ${displaySize}px;
  //   z-index: 1;
  // `;
  // document.body.appendChild(img);

  //

  const maskCanvas = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = characterBaseCanvas.width;
    canvas.height = characterBaseCanvas.height;
    const ctx = canvas.getContext('2d');
    // ctx.putImageData(imageData, 0, 0);
    ctx.drawImage(characterBlurImage, 0, 0);
    return canvas;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // change all pixels with nonzero alpha to a random pixel color
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    return canvas;
  })();
  if(debug){
    maskCanvas.classList.add('maskCanvas');
    maskCanvas.style.cssText = `\
    position: fixed;
    top: 62px;
    left: ${displaySize}px;
    width: ${displaySize}px;
    z-index: 1;
    `;
    document.body.appendChild(maskCanvas);
  }
  const mask = maskCanvas.toDataURL('image/png');

  // console.log('got params', {
  //   width: characterBaseImage.width,
  //   height: characterBaseImage.height,

  //   characterNoiseCanvas,
  //   maskCanvas,
  // });
  // debugger;

  //

  console.log('set sd model 1', characterModel);
  await setSdModel(characterModel);
  console.log('set sd model 2', characterModel);
  const generatedImageBlob = await img2img({
    prompt,
    negativePrompt,

    width: characterBaseImage.width,
    height: characterBaseImage.height,

    image,
    mask,

    seed,
    subseed,

    denoising_strength: characterDenoisingStrength,
  });
  const generatedImage = await blob2img(generatedImageBlob);
  if(debug){
    generatedImage.style.cssText = `\
    position: fixed;
    top: 62px;
    left: ${displaySize * 2}px;
    width: ${displaySize}px;
    z-index: 1;
    `;
    document.body.appendChild(generatedImage);
  }
  return generatedImageBlob;
};
const generateCharacter360FromBase = async ({
  generatedImageBlob,
  setGenerationStatus,
  debug,
}) => {
  const size = 512;
  const paddingFactor = 0.1;
  setGenerationStatus && setGenerationStatus('Squaring image...');
  const squaredBlob = await squareize(generatedImageBlob, size, paddingFactor);
  setGenerationStatus && setGenerationStatus('Removing background...');
  const foregroundBlob = await removeBackgroundAnime(squaredBlob);
  setGenerationStatus && setGenerationStatus('Converting to image...');
  const foregroundImage = await blob2img(foregroundBlob);
  if(debug){
    foregroundImage.classList.add('front-image');
    foregroundImage.style.cssText = `\
      position: fixed;
      top: 62px;
      left: ${displaySize * 2}px;
      width: ${size}px;
      height: ${size}px;
      z-index: 1;
    `;
    document.body.appendChild(foregroundImage);
  }
  setGenerationStatus && setGenerationStatus('Generating 360 views...');
  // generate 360 views
  const slices = await generate360Views(squaredBlob, {
    debug,
  });
  const canvas = drawSlices(slices);
  const character360ImageBlob = await new Promise((accept, reject) => {
    canvas.toBlob(accept, 'image/png');
  });
  // const character360ImageForegroundBlob = await removeBackgroundAnime(character360ImageBlob);

  const character360ImageBitmap = await createImageBitmap(character360ImageBlob);
  const character360Canvas = (() => {
    const character360Canvas = document.createElement('canvas');
    character360Canvas.width = character360ImageBitmap.width;
    character360Canvas.height = character360ImageBitmap.height;
    const character360Ctx = character360Canvas.getContext('2d');
    character360Ctx.drawImage(character360ImageBitmap, 0, 0);
    return character360Canvas;
  })();
  if(debug){
    character360Canvas.classList.add('character360Canvas');
    character360Canvas.style.cssText = `\
      position: fixed;
      top: 62px;
      left: 0px;
      width: ${size}px;
      background-color: #FF000080;
      z-index: 1;
    `;
    document.body.appendChild(character360Canvas);
  }

  return {
    characterImageBlob: foregroundBlob,
    character360ImageBlob,
  };
};
export const generateCharacterFromPrompt = async ({
  prompt,
  gender,
  setGenerationStatus,
  debug,
}) => {
  const generatedImageBlob = await generateCharacterBaseFromPrompt({
    prompt,
    gender,
    debug
  });
  return await generateCharacterAuxFromFile(generatedImageBlob, setGenerationStatus, debug);
};
export const generateCharacterAuxFromFile = async (generatedImageBlob, prompt, setGenerationStatus, debug) => {
  setGenerationStatus && setGenerationStatus('Generating character emotions...');
  const characterEmotionBlob = await generateCharacterEmotions({
    blob: generatedImageBlob,
    prompt,
    debug,
  });
  // const imageUrl = URL.createObjectURL(characterEmotionBlob);
  setGenerationStatus && setGenerationStatus('Generating 360 views...');
  const {
    characterImageBlob,
    character360ImageBlob,
  } = await generateCharacter360FromBase({
    generatedImageBlob,
    setGenerationStatus,
    debug,
  });
  console.log('generated all 360 views');

  return {
    characterImageBlob,
    characterEmotionBlob,
    character360ImageBlob,
  };
};
/* const getCharacterPrompt = ({
  gender,
}) => {
  const prompt = gender === 'male' ?
    `boy, white background`
  :
    `girl, white background`;
  return prompt;
} */
/* globalThis.testCharacterBaseGeneration = async ({
  gender = 'male',
} = {}) => {
  const prompt = getCharacterPrompt({
    gender,
  });

  const generatedImageBlob = await generateCharacterBaseFromPrompt({
    prompt,
    gender,
  });

  const size = 1024;
  // const paddingFactor = 0.1;
  const paddingFactor = 0;
  const squaredBlob = await squareize(generatedImageBlob, size, paddingFactor);
  const squaredImage = await blob2img(squaredBlob);
  squaredImage.style.cssText = `\
    position: fixed;
    top: 62px;
    left: ${512 * 2}px;
    width: 512px;
    height: 512px;
    z-index: 1;
  `;

  return squaredBlob;
}; */
/* globalThis.testCharacterGeneration = async ({
  gender = 'female',
} = {}) => {
  const prompt = getCharacterPrompt({
    gender,
  });

  const {
    characterImageBlob,
    characterEmotionBlob,
    character360ImageBlob,
  } = await generateCharacterFromPrompt({
    prompt,
    gender,
  });
}; */

/* globalThis.testFullCharacterGeneration = async () => { // XXX deprecated
  const prompt = `1girl wearing a summer dress`;
  const gender = 'female';

  const seed = r();
  const subseed = r();

  const generatedImageBlob = await generateCharacterBaseFromPrompt({
    prompt,
    gender,
    seed,
    subseed,
  });

  const size = 1024;
  // const paddingFactor = 0.1;
  const paddingFactor = 0;
  const squaredBlob = await squareize(generatedImageBlob, size, paddingFactor);
  const squaredImage = await blob2img(squaredBlob);
  squaredImage.style.cssText = `\
    position: fixed;
    top: 62px;
    left: ${512 * 2}px;
    width: 512px;
    height: 512px;
    z-index: 1;
  `;
  document.body.appendChild(squaredImage);

  //

  const vrmBlob = squaredBlob;

  const simplexR = new Simplex(seed + 1);
  const simplexG = new Simplex(seed + 2);
  const simplexB = new Simplex(seed + 3);
  const simplexRate = 0.1;

  let cleanup = null;

  const vrmImageBitmap = await createImageBitmap(vrmBlob);
  const vrmFullCanvas = document.createElement('canvas');
  vrmFullCanvas.width = vrmImageBitmap.width;
  vrmFullCanvas.height = vrmImageBitmap.height;
  const vrmFullCtx = vrmFullCanvas.getContext('2d');
  vrmFullCtx.drawImage(vrmImageBitmap, 0, 0);

  const openposeImageBitmap = await createImageBitmap(openposeBlob);
  const openposeFullCanvas = document.createElement('canvas');
  openposeFullCanvas.width = openposeImageBitmap.width;
  openposeFullCanvas.height = openposeImageBitmap.height;
  const openposeFullCtx = openposeFullCanvas.getContext('2d');
  openposeFullCtx.drawImage(openposeImageBitmap, 0, 0);

  const fullCanvas = document.createElement('canvas');
  fullCanvas.width = vrmImageBitmap.width;
  fullCanvas.height = vrmImageBitmap.height;
  fullCanvas.style.cssText = `\
    position: fixed;
    top: 62px;
    left: ${(2 + i) * displaySize}px;
    width: ${displaySize}px;
  `;
  document.body.appendChild(fullCanvas);
  const fullCtx = fullCanvas.getContext('2d');

  // now perform the real capture
  let angleIndex = 0;
  for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / numAngles) {
    for (let k = 0; k < numFrames; k++, angleIndex++) {
      if (angleIndex > 8) {
        break;
      }

      //

      cleanup && cleanup();

      //

      const [x, y] = getFrameOffsetCoords(angleIndex);
      const [w, h] = getFrameSize();

      //

      const vrmSliceCanvas = (() => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(vrmFullCanvas, x, y, w, h, 0, 0, w, h);
        return canvas;
      })();
      const vrmSliceCtx = vrmSliceCanvas.getContext('2d');
      // const vrmDataUrl = vrmSliceCanvas.toDataURL();
      vrmSliceCanvas.style.cssText = `\
        position: fixed;
        top: 62px;
        left: 0;
        width: ${displaySize}px;
      `;
      document.body.appendChild(vrmSliceCanvas);

      const openposeSliceCanvas = (() => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        ctx.drawImage(openposeFullCanvas, x, y, w, h, 0, 0, w, h);
        return canvas;
      })();
      // const openposeSliceCtx = openposeSliceCanvas.getContext('2d');
      openposeSliceCanvas.style.cssText = `\
        position: fixed;
        top: 62px;
        left: ${displaySize}px;
        width: ${displaySize}px;
      `;
      document.body.appendChild(openposeSliceCanvas);

      cleanup = () => {
        document.body.removeChild(vrmSliceCanvas);
        document.body.removeChild(openposeSliceCanvas);
      };

      //

      const imageData = vrmSliceCtx.getImageData(0, 0, vrmSliceCanvas.width, vrmSliceCanvas.height);

      // flood-fill within radius
      const srcUint8Array = Uint8Array.from(imageData.data);
      const radius = 10; // padding
      const radius2 = 16; // blur
      const expandByRadius = (srcUint8Array, dstUint8Array, radius, blur) => {
        for (let i = 0; i < srcUint8Array.length / 4; i++) {
          const x = (i % vrmSliceCanvas.width);
          const y = Math.floor(i / vrmSliceCanvas.width);

          const v = srcUint8Array[i * 4 + 3];
          if (v) {
            for (let dx = -radius; dx <= radius; dx++) {
              for (let dy = -radius; dy <= radius; dy++) {
                const r = Math.sqrt(dx * dx + dy * dy);
                if (r <= radius) {
                  const xi = x + dx;
                  const yi = y + dy;
                  if (xi >= 0 && xi < vrmSliceCanvas.width && yi >= 0 && yi < vrmSliceCanvas.height) {
                    const j = yi * vrmSliceCanvas.width + xi;

                    let v2;
                    if (blur) {
                      v2 = 1 - (r / radius);
                    } else {
                      v2 = 1;
                    }
                    v2 *= 255;
                    dstUint8Array[j * 4 + 3] = Math.max(dstUint8Array[j * 4 + 3], v2);
                  }
                }
              }
            }
          }
        }
      };
      expandByRadius(srcUint8Array, imageData.data, radius, false);
      const vrmSliceUint8ArrayRadius = Uint8Array.from(imageData.data);
      expandByRadius(srcUint8Array, imageData.data, radius2, true);

      // change all pixels with alpha to a random pixel color
      for (let i = 0; i < imageData.data.length; i += 4) {
        const alpha = imageData.data[i + 3];
        if (alpha > 0) {
          const j = i / 4;
          const x = (j % vrmSliceCanvas.width) * simplexRate;
          const y = Math.floor(j / vrmSliceCanvas.width) * simplexRate;
          const r = simplexR.noise2D(x, y) * 255;
          const g = simplexG.noise2D(x, y) * 255;
          const b = simplexB.noise2D(x, y) * 255;
          const a = alpha;

          imageData.data[i + 0] = r;
          imageData.data[i + 1] = g;
          imageData.data[i + 2] = b;
          imageData.data[i + 3] = a;
        } else {
          imageData.data[i + 0] = 255;
          imageData.data[i + 1] = 255;
          imageData.data[i + 2] = 255;
          imageData.data[i + 3] = 0;
        }
      }
      vrmSliceCtx.putImageData(imageData, 0, 0);

      const drawMaskCanvas = () => {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // create the mask
        const maskImageData = vrmSliceCtx.createImageData(vrmSliceCanvas.width, vrmSliceCanvas.height);
        const uint8Array = maskImageData.data;
        for (let i = 0; i < vrmSliceUint8ArrayRadius.length / 4; i++) {
          const x = (i % vrmSliceCanvas.width);
          const y = Math.floor(i / vrmSliceCanvas.width);

          const v = vrmSliceUint8ArrayRadius[i * 4 + 3];
          if (v) {
            for (let dx = -radius2; dx <= radius2; dx++) {
              for (let dy = -radius2; dy <= radius2; dy++) {
                const r = Math.sqrt(dx * dx + dy * dy);
                if (r <= radius2) {
                  const xi = x + dx;
                  const yi = y + dy;
                  if (xi >= 0 && xi < vrmSliceCanvas.width && yi >= 0 && yi < vrmSliceCanvas.height) {
                    const j = yi * vrmSliceCanvas.width + xi;

                    let v2 = 1 - (r / radius2);
                    v2 *= 255;
                    uint8Array[j * 4 + 0] = 255;
                    uint8Array[j * 4 + 1] = 255;
                    uint8Array[j * 4 + 2] = 255;
                    uint8Array[j * 4 + 3] = Math.max(uint8Array[j * 4 + 3], v2);
                  }
                }
              }
            }
          }
        }
        ctx.putImageData(maskImageData, 0, 0);
        return canvas;
      };
      const maskCanvas = drawMaskCanvas();
      maskCanvas.style.cssText = `\
        position: fixed;
        top: 62px;
        left: ${displaySize * 2}px;
        width: ${displaySize}px;
      `;
      document.body.appendChild(maskCanvas);

      //

      // const vrmSliceBlob = await new Promise((accept, reject) => {
      //   vrmSliceCanvas.toBlob(accept, 'image/png');
      // });
      // let prompt = await interrogateDeepBooru(vrmSliceBlob);
      // console.log('prompt 1', prompt);
      // prompt = `1girl, running`;
      // console.log('prompt 2', prompt);
      const image = vrmSliceCanvas.toDataURL();
      const mask = maskCanvas.toDataURL();
      const controlnetImage = vrmSliceCanvas.toDataURL();
      const opts = {
        prompt,
        // negativePrompt,

        width: w,
        height: h,

        image,
        mask,
        controlnetImage,

        seed,
        subseed,

        cfg_scale: 7,

        // mask_blur_x: 4,
        // mask_blur_y: 4,
      };
      console.log('got opts', opts);
      // return;

      const generatedImageBlob = await img2img(opts);
      // globalThis.generatedImageBlob = generatedImageBlob;
      const generatedImage = await blob2img(generatedImageBlob);
      generatedImage.style.cssText = `\
        position: fixed;
        top: 62px;
        left: ${displaySize * (3 + i)}px;
        width: ${displaySize}px;
      `;
      document.body.appendChild(generatedImage);
    }
  }
}; */

globalThis.testControlNetCharacterGeneration = async () => { // XXX deprecated
  const blobs = await Promise.all([
    // Promise.all([
    //   (async () => {
    //     // const res = await fetch('/images/poses/sd-controlnet/male-stand.png');
    //     // const res = await fetch('/images/poses/sd-controlnet/male-walk.png');
    //     const res = await fetch('/images/poses/sd-controlnet/male-run.png');
    //     const blob = await res.blob();
    //     return blob;
    //   })(),
    //   (async () => {
    //     // const res = await fetch('/images/poses/sd-controlnet/male-stand-openpose.png');
    //     // const res = await fetch('/images/poses/sd-controlnet/male-walk-openpose.png');
    //     const res = await fetch('/images/poses/sd-controlnet/male-run-openpose.png');
    //     const blob = await res.blob();
    //     return blob;
    //   })(),
    // ]),
    Promise.all([
      (async () => {
        // const res = await fetch('/images/poses/sd-controlnet/female-stand.png');
        // const res = await fetch('/images/poses/sd-controlnet/female-walk.png');
        const res = await fetch('/images/poses/sd-controlnet/female-run.png');
        const blob = await res.blob();
        return blob;
      })(),
      (async () => {
        // const res = await fetch('/images/poses/sd-controlnet/female-stand-openpose.png');
        // const res = await fetch('/images/poses/sd-controlnet/female-walk-openpose.png');
        const res = await fetch('/images/poses/sd-controlnet/female-run-openpose.png');
        const blob = await res.blob();
        return blob;
      })(),
    ]),
  ]);

  const seed = r();
  const subseed = r();

  const simplexR = new Simplex(seed + 1);
  const simplexG = new Simplex(seed + 2);
  const simplexB = new Simplex(seed + 3);
  const simplexRate = 0.1;

  const size = 256;

  let cleanup = null;
  for (let i = 0; i < blobs.length; i++) {
    const [
      vrmBlob,
      openposeBlob,
    ] = blobs[i];

    const vrmImageBitmap = await createImageBitmap(vrmBlob);
    const vrmFullCanvas = document.createElement('canvas');
    vrmFullCanvas.width = vrmImageBitmap.width;
    vrmFullCanvas.height = vrmImageBitmap.height;
    const vrmFullCtx = vrmFullCanvas.getContext('2d');
    vrmFullCtx.drawImage(vrmImageBitmap, 0, 0);

    const openposeImageBitmap = await createImageBitmap(openposeBlob);
    const openposeFullCanvas = document.createElement('canvas');
    openposeFullCanvas.width = openposeImageBitmap.width;
    openposeFullCanvas.height = openposeImageBitmap.height;
    const openposeFullCtx = openposeFullCanvas.getContext('2d');
    openposeFullCtx.drawImage(openposeImageBitmap, 0, 0);

    // const fullCanvas = document.createElement('canvas');
    // fullCanvas.width = vrmImageBitmap.width;
    // fullCanvas.height = vrmImageBitmap.height;
    // fullCanvas.style.cssText = `\
    // position: fixed;
    // top: 62px;
    // left: ${(2 + i) * size}px;
    // width: ${size}px;
    // `;
    // document.body.appendChild(fullCanvas);
    // const fullCtx = fullCanvas.getContext('2d');

    // now perform the real capture
    let angleIndex = 0;
    for (let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / numAngles) {
      for (let k = 0; k < numFrames; k++, angleIndex++) {
        if (angleIndex > 8) {
          break;
        }

        //

        cleanup && cleanup();

        //

        const [x, y] = getFrameOffsetCoords(angleIndex);
        const [w, h] = getFrameSize();

        //

        const vrmSliceCanvas = (() => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
          ctx.drawImage(vrmFullCanvas, x, y, w, h, 0, 0, w, h);
          return canvas;
        })();
        const vrmSliceCtx = vrmSliceCanvas.getContext('2d');
        // const vrmDataUrl = vrmSliceCanvas.toDataURL();
        vrmSliceCanvas.style.cssText = `\
          position: fixed;
          top: 62px;
          left: 0;
          width: ${size}px;
        `;
        document.body.appendChild(vrmSliceCanvas);

        const openposeSliceCanvas = (() => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
          ctx.drawImage(openposeFullCanvas, x, y, w, h, 0, 0, w, h);
          return canvas;
        })();
        // const openposeSliceCtx = openposeSliceCanvas.getContext('2d');
        openposeSliceCanvas.style.cssText = `\
          position: fixed;
          top: 62px;
          left: ${size}px;
          width: ${size}px;
        `;
        document.body.appendChild(openposeSliceCanvas);

        cleanup = () => {
          document.body.removeChild(vrmSliceCanvas);
          document.body.removeChild(openposeSliceCanvas);
        };

        //

        const imageData = vrmSliceCtx.getImageData(0, 0, vrmSliceCanvas.width, vrmSliceCanvas.height);

        // flood-fill within radius
        const srcUint8Array = Uint8Array.from(imageData.data);
        const radius = 10; // padding
        const radius2 = 16; // blur
        const expandByRadius = (srcUint8Array, dstUint8Array, radius, blur) => {
          for (let i = 0; i < srcUint8Array.length / 4; i++) {
            const x = (i % vrmSliceCanvas.width);
            const y = Math.floor(i / vrmSliceCanvas.width);

            const v = srcUint8Array[i * 4 + 3];
            if (v) {
              for (let dx = -radius; dx <= radius; dx++) {
                for (let dy = -radius; dy <= radius; dy++) {
                  const r = Math.sqrt(dx * dx + dy * dy);
                  if (r <= radius) {
                    const xi = x + dx;
                    const yi = y + dy;
                    if (xi >= 0 && xi < vrmSliceCanvas.width && yi >= 0 && yi < vrmSliceCanvas.height) {
                      const j = yi * vrmSliceCanvas.width + xi;

                      let v2;
                      if (blur) {
                        v2 = 1 - (r / radius);
                      } else {
                        v2 = 1;
                      }
                      v2 *= 255;
                      dstUint8Array[j * 4 + 3] = Math.max(dstUint8Array[j * 4 + 3], v2);
                    }
                  }
                }
              }
            }
          }
        };
        expandByRadius(srcUint8Array, imageData.data, radius, false);
        const vrmSliceUint8ArrayRadius = Uint8Array.from(imageData.data);
        expandByRadius(srcUint8Array, imageData.data, radius2, true);

        // change all pixels with alpha to a random pixel color
        for (let i = 0; i < imageData.data.length; i += 4) {
          const alpha = imageData.data[i + 3];
          if (alpha > 0) {
            const j = i / 4;
            const x = (j % vrmSliceCanvas.width) * simplexRate;
            const y = Math.floor(j / vrmSliceCanvas.width) * simplexRate;
            const r = simplexR.noise2D(x, y) * 255;
            const g = simplexG.noise2D(x, y) * 255;
            const b = simplexB.noise2D(x, y) * 255;
            const a = alpha;

            imageData.data[i + 0] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = a;
          } else {
            imageData.data[i + 0] = 255;
            imageData.data[i + 1] = 255;
            imageData.data[i + 2] = 255;
            imageData.data[i + 3] = 0;
          }
        }
        vrmSliceCtx.putImageData(imageData, 0, 0);

        const drawMaskCanvas = () => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');

          // create the mask
          const maskImageData = vrmSliceCtx.createImageData(vrmSliceCanvas.width, vrmSliceCanvas.height);
          const uint8Array = maskImageData.data;
          for (let i = 0; i < vrmSliceUint8ArrayRadius.length / 4; i++) {
            const x = (i % vrmSliceCanvas.width);
            const y = Math.floor(i / vrmSliceCanvas.width);

            const v = vrmSliceUint8ArrayRadius[i * 4 + 3];
            if (v) {
              for (let dx = -radius2; dx <= radius2; dx++) {
                for (let dy = -radius2; dy <= radius2; dy++) {
                  const r = Math.sqrt(dx * dx + dy * dy);
                  if (r <= radius2) {
                    const xi = x + dx;
                    const yi = y + dy;
                    if (xi >= 0 && xi < vrmSliceCanvas.width && yi >= 0 && yi < vrmSliceCanvas.height) {
                      const j = yi * vrmSliceCanvas.width + xi;

                      let v2 = 1 - (r / radius2);
                      v2 *= 255;
                      uint8Array[j * 4 + 0] = 255;
                      uint8Array[j * 4 + 1] = 255;
                      uint8Array[j * 4 + 2] = 255;
                      uint8Array[j * 4 + 3] = Math.max(uint8Array[j * 4 + 3], v2);
                    }
                  }
                }
              }
            }
          }
          ctx.putImageData(maskImageData, 0, 0);
          return canvas;
        };
        const maskCanvas = drawMaskCanvas();
        maskCanvas.style.cssText = `\
          position: fixed;
          top: 62px;
          left: ${size * 2}px;
          width: ${size}px;
        `;
        document.body.appendChild(maskCanvas);

        //

        // const vrmSliceBlob = await new Promise((accept, reject) => {
        //   vrmSliceCanvas.toBlob(accept, 'image/png');
        // });
        // let prompt = await interrogateDeepBooru(vrmSliceBlob);
        // console.log('prompt 1', prompt);
        prompt = `1girl, running`;
        // console.log('prompt 2', prompt);
        const image = vrmSliceCanvas.toDataURL();
        const mask = maskCanvas.toDataURL();
        const controlnetImage = vrmSliceCanvas.toDataURL();
        const opts = {
          prompt,
          // negativePrompt,

          width: w,
          height: h,

          image,
          mask,
          controlnetImage,

          seed,
          subseed,

          cfg_scale: 7,

          // mask_blur_x: 4,
          // mask_blur_y: 4,
        };
        console.log('got opts', opts);
        // return;

        const generatedImageBlob = await img2img(opts);
        // globalThis.generatedImageBlob = generatedImageBlob;
        const generatedImage = await blob2img(generatedImageBlob);
        generatedImage.style.cssText = `\
          position: fixed;
          top: 62px;
          left: ${size * (3 + i)}px;
          width: ${size}px;
        `;
        document.body.appendChild(generatedImage);
      }
    }
  }
};

const generateCharacterEmotion = async ({
  blob,
  prompt,
  emotion,
  yFactor = 0,
  maskAlpha = 1,
  blurRadius = 4,
  alphaFactor = 1,
  debug
}) => {
  const imageBitmap = await createImageBitmap(blob);

  const findResult = await imageFind(
    blob,
    'face',
    // 'face, eyes, mouth, nose, ears, beard',
    {
      promptWeight: 0.8,
    },
  );
  const {
    boxes_filt,
  } = findResult;
  // console.log('got filt', boxes_filt);

  if (boxes_filt.length > 0) {
    const x = Math.floor((boxes_filt[0][0] + boxes_filt[0][2]) / 2);
    const y = Math.floor((boxes_filt[0][1] + boxes_filt[0][3]) / 2);

    const result2 = await imageSelection(
      // animated image
      blob,
      [
        [x, y],
      ],
      // labels (foreground vs background)
      [
        1,
      ],
      // bbox
      boxes_filt[0],
    );
    console.log('got result 2', result2);

    const {
      dims,
      bbox,
      uint8Array,
    } = result2;
    console.assert(dims[0] === imageBitmap.width);
    console.assert(dims[1] === imageBitmap.height);

    const drawTintedCanvas = () => {
      // draw the bitmask on the canvas
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageBitmap, 0, 0);
      const canvasImageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
      for (let i = 0; i < uint8Array.length; i++) {
        const v = uint8Array[i];
        if (v) {
          canvasImageData.data[i * 4 + 0] += 255;
          canvasImageData.data[i * 4 + 2] += 255;
        }
      }
      ctx.putImageData(canvasImageData, 0, 0);
      return canvas;
    };
    const fullCanvas = drawTintedCanvas();
    if(debug){
      fullCanvas.style.cssText = `\
        position: fixed;
        top: 62px;
        left: 512px;
        width: ${displaySize}px;
        z-index: 1;
      `;
      fullCanvas.classList.add(`full-${emotion.replace(/\s+/g, '-')}`);
      document.body.appendChild(fullCanvas);
    }

    // blob to data url
    const image = await new Promise((accept, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        accept(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const [
      x0, y0,
      x1, y1,
    ] = bbox;
    const w = x1 - x0;
    const h = y1 - y0;
    const mouthCutoffY = y0 + h * yFactor;

    const expandByRadius = (srcUint8Array, dstUint8Array, alpha, radius) => {
      for (let i = 0; i < srcUint8Array.length / 4; i++) {
        const x = (i % imageBitmap.width);
        const y = Math.floor(i / imageBitmap.width);

        const v = srcUint8Array[i * 4 + 3];
        if (v > 128) {
          for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
              const r = Math.sqrt(dx * dx + dy * dy);
              if (r <= radius) {
                const xi = x + dx;
                const yi = y + dy;
                if (xi >= 0 && xi < imageBitmap.width && yi >= 0 && yi < imageBitmap.height) {
                  const j = yi * imageBitmap.width + xi;

                  let v2;
                  // if (blur) {
                    v2 = 1 - (r / radius);
                  // } else {
                  //   v2 = 1;
                  // }
                  v2 *= 255;
                  v2 *= alpha;
                  v2 = Math.max(dstUint8Array[j * 4 + 3], v2);
                  dstUint8Array[j * 4 + 0] = 255;
                  dstUint8Array[j * 4 + 1] = 255;
                  dstUint8Array[j * 4 + 2] = 255;
                  dstUint8Array[j * 4 + 3] = v2;
                }
              }
            }
          }
        }
      }
    };

    const drawMaskCanvas = () => {
      // draw the bitmask on the canvas
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;
      const ctx = canvas.getContext('2d');
      const maskImageData = ctx.createImageData(imageBitmap.width, imageBitmap.height);
      for (let i = 0; i < uint8Array.length; i++) {
        const x = i % imageBitmap.width;
        const y = Math.floor(i / imageBitmap.width);

        const v = uint8Array[i];
        if (v && y > mouthCutoffY) {
          maskImageData.data[i * 4 + 0] = 255 * alphaFactor;
          maskImageData.data[i * 4 + 1] = 255 * alphaFactor;
          maskImageData.data[i * 4 + 2] = 255 * alphaFactor;
          maskImageData.data[i * 4 + 3] = 255;
        } else {
          maskImageData.data[i * 4 + 3] = 0;
        }
      }

      const srcUint8Array = Uint8Array.from(maskImageData.data);
      expandByRadius(srcUint8Array, maskImageData.data, 1, blurRadius);

      ctx.putImageData(maskImageData, 0, 0);
      return canvas;
    };
    const maskCanvas = drawMaskCanvas();
    if(debug){
      maskCanvas.style.cssText = `\
        position: fixed;
        top: 62px;
        left: ${displaySize * 2}px;
        width: ${displaySize}px;
        z-index: 1;
      `;
      maskCanvas.classList.add(`mask-${emotion.replace(/\s+/g, '-')}`);
      document.body.appendChild(maskCanvas);
    }
    const mask = maskCanvas.toDataURL('image/png');

    const fullPrompt = `${prompt}${emotion ? `, (${emotion}:2)` : ''}`;
    console.log('img2img', {
      prompt,
      emotion,
      fullPrompt,
    });
    // const negativePrompt = `face covered`;
    const generatedImageBlob = await img2img({
      prompt: fullPrompt,
      // negativePrompt,

      width: imageBitmap.width,
      height: imageBitmap.height,

      image,
      mask,

      mask_blur_x: 10,
      mask_blur_y: 10,

      denoising_strength: 1 - maskAlpha,
    });
    return generatedImageBlob;
  } else {
    console.warn('failed to get segmentation result');
    return blob;
  }
};
const generateCharacterEmotions = async ({
  blob,
  prompt,
  debug
}) => {
  const speechEmotion = `speaking saying something with mouth open`;
  const emotions = [
    null,
    [speechEmotion, 0.6, 0.3, 2],
    [speechEmotion, 0.6, 0.3, 2],
    ['joyful expression', void 0, 0.3, 10],
    ['sad expression', void 0, 0.3, 10],
    ['angry expression', void 0, 0.3, 10],
    ['fun expression', void 0, 0.3, 10],
    ['surprised expression', void 0, 0.3, 10],
  ];

  const renderWidth = 4096;
  const paddingFactor = 0.1;
  // const renderHeight = renderWidth / 2;
  const renderSliceWidth = renderWidth / numSlicesPerRow;

  const displaySize = 512;

  const characterEmotionImageBlobs = [];
  const characterEmotionImageBitmaps = [];
  for (let i = 0; i < emotions.length; i++) {
    const e = emotions[i];
    if (e) {
      const [emotion, yFactor, maskAlpha, blurRadius] = e;
      const emotionBlob = await generateCharacterEmotion({
        blob,
        prompt,
        emotion,
        yFactor,
        maskAlpha,
        blurRadius,
        debug
      });
      const emotionForegroundBlob = await removeBackgroundAnime(emotionBlob);
      if(debug){
        const image = await _previewBlob(emotionForegroundBlob, i);
        image.classList.add(`emotion-${emotion.replace(/\s+/g, '-')}`);
      }
      characterEmotionImageBlobs.push(emotionForegroundBlob);

      const imageBitmap = await createImageBitmap(emotionForegroundBlob);
      characterEmotionImageBitmaps.push(imageBitmap);
    } else {
      const emotion = '';
      const yFactor = 0.6;
      const emotionBlob = await generateCharacterEmotion({
        blob,
        prompt,
        emotion,
        yFactor,
        alphaFactor: 0.05,
        debug
      });
      const emotionForegroundBlob = await removeBackgroundAnime(emotionBlob);
      if(debug){
        await _previewBlob(emotionForegroundBlob, i);
      }
      characterEmotionImageBlobs.push(emotionForegroundBlob);

      const imageBitmap = await createImageBitmap(emotionForegroundBlob);
      characterEmotionImageBitmaps.push(imageBitmap);
    }
  }

  // XXX
  console.log('draw slices 0', {characterEmotionImageBitmaps});
  const squaredBlobs = [];
  const squaredImageBitmaps = [];
  for (let i = 0; i < characterEmotionImageBlobs.length; i++) {
    const characterEmotionImageBlob = characterEmotionImageBlobs[i];
    const squaredBlob = await squareize(characterEmotionImageBlob, renderWidth, paddingFactor, false);
    if(debug){
      await _previewBlob(squaredBlob, i);
    }
    squaredBlobs.push(squaredBlob);

    const squaredImageBitmap = await createImageBitmap(squaredBlob);
    squaredImageBitmaps.push(squaredImageBitmap);
  }

  console.log('draw slices 1', {squaredBlobs, squaredImageBitmaps, characterEmotionImageBitmaps, renderWidth, renderSliceWidth});
  const fullCanvas = drawSlices(squaredImageBitmaps, {
    renderWidth,
  });
  console.log('draw slices 2', {fullCanvas});
  if(debug){
    fullCanvas.style.cssText = `\
      position: fixed;
      top: 62px;
      left: 0;
      width: ${displaySize}px;
      z-index: 1;
    `;
    fullCanvas.classList.add('full');
    document.body.appendChild(fullCanvas);
  }

  const fullCanvasBlob = await new Promise((accept, reject) => {
    fullCanvas.toBlob(accept, 'image/png');
  });

  // const foregroundBlob = await removeBackgroundAnime(fullCanvasBlob);
  const foregroundImage = await blob2img(fullCanvasBlob);
  console.log('draw slices 3', {foregroundImage});
  if(debug){
    foregroundImage.style.cssText = `\
      position: fixed;
      top: 62px;
      width: ${displaySize}px;
      z-index: 1;
    `;
    foregroundImage.classList.add('foreground');
    document.body.appendChild(foregroundImage);
  }
  return fullCanvasBlob;
};

//

export class CharacterGenerator {
  constructor() {}
  generateFromPrompt(prompt) {
    // XXX
  }
  generateEmotions() {
    return generateCharacterEmotions.apply(this, arguments);
  }
  generateCharacter360FromBase() {
    return generateCharacter360FromBase.apply(this, arguments);
  }
}
