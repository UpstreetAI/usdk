import {
  blob2img,
} from '../util.js';
import Simplex from '../simplex-noise.js';

//

export const squareize = async (blob, size, paddingFactor, background = true) => {
  const img = await blob2img(blob);

  if (img.width === size && img.height === size) {
    return blob;
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (background) {
      // draw the white background
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // draw the image in the center of the new canvas, keeping the aspect ratio
    // pad by paddingFactor on all sides
    // the image needs to be scaled to fit in the center of the canvas
    ctx.globalCompositeOperation = 'multiply';
    const paddingPx = size * paddingFactor;
    const targetWidth = size - (paddingPx * 2);
    const targetHeight = size - (paddingPx * 2);
    const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const x = (size - scaledWidth) / 2;
    const y = (size - scaledHeight) / 2;
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

    const squaredBlob = await new Promise((accept, reject) => {
      canvas.toBlob(accept, 'image/png');
    });
    return squaredBlob;
  }
};
// resize the image to the given dimension limits, but keep the aspect ratio
// add black bars at the top+bottom or left+right if necessary
export const resizeImage = async (blob, width, height = width, fillStyle = '#000', type = blob.type, quality = undefined) => {
  const imageBitmap = await createImageBitmap(blob);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Determine the ratio of the image
  const ratio = Math.min(width / imageBitmap.width, height / imageBitmap.height);

  // Calculate new dimensions with the same aspect ratio
  const newWidth = imageBitmap.width * ratio;
  const newHeight = imageBitmap.height * ratio;

  // Calculate position to center the image on the canvas
  const xOffset = (width - newWidth) / 2;
  const yOffset = (height - newHeight) / 2;

  // Clear the canvas and fill with black
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, width, height);

  // Draw the image centered on the canvas
  ctx.drawImage(imageBitmap, xOffset, yOffset, newWidth, newHeight);

  // Convert the canvas back to a blob
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
};

export const makeGradientCanvas = (w, h) => {
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d');

  maskCtx.fillStyle = '#FFF';
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

  const simplexR = new Simplex(Math.random());
  const simplexG = new Simplex(Math.random());
  const simplexB = new Simplex(Math.random());
  const simplexRate = 0.05;
  // const centerPower = 0.5;
  const centerPower = 1;

  // radial gradient via image data
  const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const j = i / 4;
    const x = (j % maskCanvas.width);
    const y = Math.floor(j / maskCanvas.width);

    const distanceToCenter = Math.sqrt(
      Math.pow(x - maskCanvas.width / 2, 2) +
      Math.pow(y - maskCanvas.height / 2, 2)
    );
    let centerFactor = distanceToCenter / (maskCanvas.width / 2);
    centerFactor = centerFactor ** centerPower;
    const centerFactorInv = 1 - centerFactor;

    const x2 = x * simplexRate;
    const y2 = y * simplexRate;

    const r = simplexR.noise2D(x2, y2) * 255;
    const g = simplexG.noise2D(x2, y2) * 255;
    const b = simplexB.noise2D(x2, y2) * 255;
    const a = 255;

    imageData.data[i + 0] = imageData.data[i + 0] * centerFactor + r * centerFactorInv;
    imageData.data[i + 1] = imageData.data[i + 1] * centerFactor + g * centerFactorInv;
    imageData.data[i + 2] = imageData.data[i + 2] * centerFactor + b * centerFactorInv;
    imageData.data[i + 3] = a;
  }
  maskCtx.putImageData(imageData, 0, 0);

  return maskCanvas;
};
export const opacify = async blob => {
  const img = await blob2img(blob);

  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');

  // blend image with alpha on top of white background
  // draw the white background
  ctx.fillStyle = '#FFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // blend image on top
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(img, 0, 0);

  const opacifiedBlob = await new Promise((accept, reject) => {
    canvas.toBlob(accept, 'image/png');
  });
  return opacifiedBlob;
};
/* export const whitify = (dstUint8Array) => {
  for (let i = 0; i < dstUint8Array.length / 4; i++) {
    if (dstUint8Array[i * 4 + 3] === 0) {
      dstUint8Array[i * 4 + 0] = 255;
      dstUint8Array[i * 4 + 1] = 255;
      dstUint8Array[i * 4 + 2] = 255;
      dstUint8Array[i * 4 + 3] = 255;
    }
  }
}; */
export const makeNoiseBaseCanvas = (baseImage) => {
  const canvas = document.createElement('canvas');
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  const simplexR = new Simplex(Math.random());
  const simplexG = new Simplex(Math.random());
  const simplexB = new Simplex(Math.random());
  // const simplexA = new Simplex(Math.random());
  const simplexRate = 0.1;
  // const simplexAlphaRate = 0.01;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // change all pixels with nonzero alpha to a random pixel color
  for (let i = 0; i < imageData.data.length; i += 4) {
    const alpha = imageData.data[i + 3];
    if (alpha > 0) {
      const j = i / 4;
      const x = (j % canvas.width) * simplexRate;
      const y = Math.floor(j / canvas.width) * simplexRate;
      // const r = Math.floor(Math.random() * 255);
      // const g = Math.floor(Math.random() * 255);
      // const b = Math.floor(Math.random() * 255);
      const r = simplexR.noise2D(x, y) * 255;
      const g = simplexG.noise2D(x, y) * 255;
      const b = simplexB.noise2D(x, y) * 255;
      const a = 255;

      imageData.data[i + 0] = r;
      imageData.data[i + 1] = g;
      imageData.data[i + 2] = b;
      imageData.data[i + 3] = a;
    } else {
      imageData.data[i + 0] = 255;
      imageData.data[i + 1] = 255;
      imageData.data[i + 2] = 255;
      imageData.data[i + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas;
};
export const makeMaskCanvas = (w, h, x1, y1, x2, y2, invert) => {
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const maskCtx = maskCanvas.getContext('2d');

  const colors = !invert ? [
    '#000',
    '#FFF',
  ] : [
    '#FFF',
    '#000',
  ];

  // mask background
  maskCtx.fillStyle = colors[0];
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

  // mask foreground
  maskCtx.fillStyle = colors[1];
  
  // maskCtx.fillRect(
  //   canvas.width * factor2,
  //   canvas.height * factor,
  //   canvas.width * (1 - factor2 * 2),
  //   canvas.height * (1 - factor * 2),
  // );
  
  // maskCtx.fillRect(
  //   canvas.width * factor2,
  //   0,
  //   canvas.width * (1 - factor2 * 2),
  //   canvas.height,
  // );

  maskCtx.fillRect(x1, y1, x2 - x1, y2 - y1);

  return maskCanvas;
};