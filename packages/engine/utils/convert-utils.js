export async function blob2img(blob, opts) {
  const imageBitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (opts?.width !== undefined && opts?.height !== undefined) {
    canvas.width = opts.width;
    canvas.height = opts.height;
    // draw the image in the center in contain mode, maintaining aspect ratio with blank space around
    const scale = Math.min(opts.width / imageBitmap.width, opts.height / imageBitmap.height);
    const x = (opts.width - imageBitmap.width * scale) / 2;
    const y = (opts.height - imageBitmap.height * scale) / 2;
    ctx.drawImage(imageBitmap, x, y, imageBitmap.width * scale, imageBitmap.height * scale);
  } else {
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    ctx.drawImage(imageBitmap, 0, 0);
  }
  return canvas;
}

export function img2canvas(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvas;
}

export function canvas2blob(canvas) {
  return new Promise((accept, reject) => {
    canvas.toBlob(accept, 'image/png');
  });
}

export async function image2DataUrl(img, className = '') {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.classList.add(className);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  // debugging
  canvas.style.cssText = `\
    background: red;
  `;
  document.body.appendChild(canvas);

  // get the blob
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  // get the blob url
  // read the data url from the blob
  const dataUrl = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(blob);
  });
  return dataUrl;
}

export function img2ImageData(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return imageData;
}

export const resizeImage = (image, width, height, {
  mode = 'cover',
} = {}) => {
  // if necessary, resize the image via contain mode
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (image.width !== width || image.height !== height) {
    if (mode === 'cover') {
      const sx = Math.max(0, (image.width - image.height) / 2);
      const sy = Math.max(0, (image.height - image.width) / 2);
      const sw = Math.min(image.width, image.height);
      const sh = Math.min(image.width, image.height);
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
    } else if (mode === 'contain') {
      // fill black background
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      // draw image
      const scale = Math.min(width / image.width, height / image.height);
      const x = (width - image.width * scale) / 2;
      const y = (height - image.height * scale) / 2;
      ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
    } else {
      throw new Error('invalid mode');
    }
  } else {
    ctx.drawImage(image, 0, 0, width, height);
  }
  return canvas;
};