// import * as THREE from 'three';
import {
  removeBackground,
} from './background-removal-client.js';
import {
  aiProxyHost,
} from '../endpoints.js';
import { getCleanJwt } from '../utils/jwt-util.js';

//

export const angleTick = 45;
export const angleTickRadians = angleTick * Math.PI / 180;
export const numAngles = 360 / angleTick;

export const itemSliceSize = 256;
export const itemCanvasWidth = 1024;
export const itemCanvasHeight = itemCanvasWidth / 2;

export const numSlicesPerRow = itemCanvasWidth / itemSliceSize;
export const numSlicesPerCol = itemCanvasHeight / itemSliceSize;

// {
//   // ensure that the slices will fit
//   const fitSlices = Math.floor(itemCanvasWidth * itemCanvasHeight / itemSliceSize / itemSliceSize);
//   if (fitSlices < numAngles) {
//     throw new Error('not enough space in canvas');
//   }
// }

//

export const generateView = async ({
  blob,
  polarAngle = 0,
  azimuthAngle = 0,
  seed = 42,
}) => {
  // use fetch

  // const arrayBuffer = await blob.arrayBuffer();
  // const uint8Array = new Uint8Array(arrayBuffer);
  const imageBase64 = await new Promise((accept, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = function() {
      var base64data = reader.result;                
      // console.log(base64data);
      accept(base64data);
    };
  });
  
  const jwt = getCleanJwt();
  const url = `https://${aiProxyHost}/api/zero123/run/generate_view`;

  const zoom = 0;
  const preprocessImage = true;
  const diffusionGuidanceScale = 3;
  const numSamples = 1;
  const steps = 75;

  const spec = {
    data: [
      // 0: number, // represents selected value of 'Polar angle (vertical rotation in degrees)' Slider component
      polarAngle,
      // 0: number, // represents selected value of 'Azimuth angle (horizontal rotation in degrees)' Slider component
      azimuthAngle,
      // 0: number, // represents selected value of 'Zoom (relative distance from center)' Slider component
      zoom,
      // data: image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg== : string, // represents image data as base64 string of 'Input image of single object' Image component
      imageBase64,
      // true: boolean, // represents checked status of 'Preprocess image automatically (remove background and recenter object)' Checkbox component
      preprocessImage,
      seed,
      // 3: number, // represents selected value of 'Diffusion guidance scale' Slider component
      diffusionGuidanceScale,
      // 4: number, // represents selected value of 'Number of samples to generate' Slider component
      numSamples,
      // 75: number, // represents selected value of 'Number of diffusion inference steps' Slider component
      steps,
    ],
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(spec),
  });
  const j = await res.json();
  // console.log('got j', j);
  const {
    // "data": [
      // string, // represents HTML rendering of markdown of the Markdown component
      // undefined, // represents undefined of 'Relationship between input (green) and output (blue) camera poses' Plot component
      // string, // represents image data as base64 string of 'Preprocessed input image' Image component
      // Array<{ name: string } | [{ name: string }, string]>, // represents list of objects, with filename and optional caption, of 'Generated images from specified new viewpoint' Gallery component
    // ],
    // "duration": (float) // number of seconds to run function call
    data,
    duration,
  } = j;
  const [
    markdown,
    relationship,
    inputImage,
    objects,
    imageUrl,
  ] = data;

  // const img = new Image();
  // img.src = imageUrl;
  // img.crossOrigin = 'Anonymous';
  // img.style.cssText = `\
  //   position: fixed;
  //   top: 0;
  //   left: 0;
  // `;
  // document.body.appendChild(img);

  const res2 = await fetch(imageUrl);
  const blob2 = await res2.blob();
  return blob2;
};

//

export const generate360Views = async (baseBlob, {
  debug = false,
} = {}) => {
  const result = [];

  const _previewBlob = (blob, i) => {
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    img.classList.add('preview-' + i);
    img.style.cssText = `\
      position: fixed;
      top: 62px;
      left: ${i * 128}px;
      width: ${128}px;
      height: ${128}px;
      z-index: 1;
    `;
    document.body.appendChild(img);
  };

  // expand the blob to square size, with the image in the center
  // const baseImage = await createImageBitmap(baseBlob);
  /* const baseBlobSquareCanvas = (() => {
    const squareCanvas = document.createElement('canvas');
    const size = baseImage.height;
    squareCanvas.width = size;
    squareCanvas.height = size;
    const squareContext = squareCanvas.getContext('2d');

    // clear to white
    squareContext.fillStyle = '#FFF';
    squareContext.fillRect(0, 0, squareCanvas.width, squareCanvas.height);

    // draw the image in the center, with padding factor on the height
    const padFactor = 0.1;
    const x = (squareCanvas.width - baseImage.width) / 2;
    const y = squareCanvas.height * padFactor;
    const w = baseImage.width;
    const h = squareCanvas.height * (1 - padFactor * 2);
    squareContext.drawImage(baseImage, x, y, w, h);

    // squareCanvas.style.cssText = `\
    //   position: absolute;
    //   top: 0;
    //   left: 0;
    //   z-index: 2;
    // `;
    // document.body.appendChild(squareCanvas);

    return squareCanvas;
  })();
  const baseBlobSquareBlob = await new Promise((accept, reject) => {
    baseBlobSquareCanvas.toBlob(accept);
  }); */

  // first slice is special, since we don't transform it
  {
    const foregroundBaseBlob = await removeBackground(baseBlob);
    // const foregroundBaseBlob = baseBlob;
    const slice = await createImageBitmap(foregroundBaseBlob);
    debug && _previewBlob(foregroundBaseBlob, 0);
    result.push(slice);
  }

  // remaining slices
  for (let i = 1; i < numAngles; i++) {
    const azimuthAngle = i * angleTick;
    const polarAngle = 0;

    const viewImgBlob = await generateView({
      blob: baseBlob,
      polarAngle,
      azimuthAngle,
    });
    const foregroundViewImgBlob = await removeBackground(viewImgBlob);
    // const foregroundViewImgBlob = viewImgBlob;
    debug && _previewBlob(foregroundViewImgBlob, i);

    const slice = await createImageBitmap(foregroundViewImgBlob);
    result.push(slice);
  }

  return result;
};

//

export const drawSlices = (slices, {
  // debug = false,
  renderWidth = itemCanvasWidth,
} = {}) => {
  const renderHeight = renderWidth / 2;
  const renderSliceWidth = renderWidth / numSlicesPerRow;

  // draw slices to frame canvas
  const canvas = document.createElement('canvas');
  canvas.width = renderWidth;
  canvas.height = renderHeight;
  const ctx = canvas.getContext('2d');

  /* if (debug) {
    canvas.style.cssText = `\
      position: fixed;
      top: 0;
      left: 0;
      width: ${1024}px;
      height: ${512}px;
      z-index: 1;
    `;
    document.body.appendChild(canvas);
  } */

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];

    const x = i % numSlicesPerRow;
    const y = Math.floor(i / numSlicesPerRow);
    console.log('draw image', [
      slice,
      x * renderSliceWidth,
      y * renderSliceWidth,
      renderSliceWidth,
      renderSliceWidth,
    ]);
    ctx.drawImage(
      slice,
      x * renderSliceWidth,
      y * renderSliceWidth,
      renderSliceWidth,
      renderSliceWidth,
    );
  }

  return canvas;
};