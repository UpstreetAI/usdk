import {
  blob2img,
  canvas2blob,
  image2DataUrl,
  img2canvas,
} from '../utils/convert-utils.js';

export const generateTextureMaps = async img => {
  // if (!img) {
  //   debugger;
  //   img = await loadImage('/images/fluffy.png');
  // }
  const canvas = img2canvas(img);
  const blob = await canvas2blob(canvas);
  const [
    normalImage,
    roughnessImage,
    displacementImage,
  ] = await Promise.all([
    'n',
    'r',
    'd',
  ].map(async shortname => {
    const res = await fetch(`https://stable-diffusion.webaverse.com/material?mode=seamless&map=${shortname}`, {
      method: 'post',
      body: blob,
    });
    if (res.ok) {
      const img2Blob = await res.blob();
      const img2 = await blob2img(img2Blob);
      
      // debugging
      // console.log('got response', img2, URL.createObjectURL(img2Blob));
      document.body.appendChild(img2);
      
      return img2;
    } else {
      throw new Error('invalid status: ' + res.status);
    }
  }));
  return {
    normalImage,
    roughnessImage,
    displacementImage,
  };
};