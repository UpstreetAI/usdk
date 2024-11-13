import {getFormData} from '../utils/http-utils.js';
import {blob2img} from '../utils/convert-utils.js';

//

const makeEditImgFormData = (blob, maskBlob, prompt) => {
  const fd = getFormData({
    image: blob,
    mask: maskBlob,
    prompt,
    n: 1,
    size: '1024x1024',
  });
  return fd;
};

export class ImageAiClient {
  constructor() {
    // nothing
  }
  async createImage(prompt, opts) {
    const resultBlob = await this.createImageBlob(prompt, opts);
    const img = await blob2img(resultBlob);
    return img;
  }
  async createImageBlob(prompt, {
    n = 1,
    size = '1024x1024',
  } = {}) {
    const u = new URL('/api/image-ai/createImageBlob', location.href);
    u.searchParams.set('prompt', prompt);
    if (n !== undefined) {
      u.searchParams.set('n', n);
    }
    if (size !== undefined) {
      u.searchParams.set('size', size);
    }
    const res = await fetch(u);
    const resultBlob = await res.blob();
    return resultBlob;
  }
  async editImgBlob(blob, maskBlob, prompt, {
    n = 1,
  } = {}) {
    const fd = makeEditImgFormData(blob, maskBlob, prompt);
    const u = new URL('/api/image-ai/editImgBlob', location.href);
    u.searchParams.set('prompt', prompt);
    if (n !== undefined) {
      u.searchParams.set('n', n);
    }
    const res = await fetch(u, {
      method: 'POST',
      body: fd,
    });
    const resultBlob = await res.blob();
    return resultBlob;
  }
  async editImg(blob, maskBlob, prompt, opts) {
    const resultBlob = await this.editImgBlob(blob, maskBlob, prompt, opts);
    const img = await blob2img(resultBlob);
    return img;
  }
}

/* export const img2imgBlob = async ({
  prompt = 'test',
  // negativePrompt = '',
  // width = 512,
  // height = 512,
  blob,
  maskBlob,
  // maskBlur = 4, // default 4
  // maskTransparency = 0,
  // falloffExponent = 1, // default 1
  // randomness = 0, // default 0
} = {}) => {
  const n = 1;

  const fd = makeEditImgFormData(blob, maskBlob, prompt);
  const u = new URL('/api/image-ai/editImgBlob', location.href);
  u.searchParams.set('prompt', prompt);
  if (n !== undefined) {
    u.searchParams.set('n', n);
  }
  const res = await fetch(u, {
    method: 'POST',
    body: fd,
  });
  const resultBlob = await res.blob();
  return resultBlob;
};
export const img2img = async ({
  prompt = 'test',
  // negativePrompt = '',
  // width = 512,
  // height = 512,
  blob,
  maskBlob,
  // maskBlur = 4, // default 4
  // maskTransparency = 0,
  // falloffExponent = 1, // default 1
  // randomness = 0, // default 0
} = {}) => {
  const resultBlob = await img2imgBlob({
    prompt,
    blob,
    maskBlob,
  });
  const img = await blob2img(resultBlob);
  return img;
}; */