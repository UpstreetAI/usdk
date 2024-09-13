import { defaultQuality } from '../defaults.mjs';
// import { detect } from './vision.mjs';
import { aiProxyHost } from './endpoints.mjs';
// import {
//   WebPDemuxer,
// } from 'usdk/sdk/src/devices/muxing.mjs';
import {
  blobToDataUrl,
} from './base64.mjs';

export const imageSizes = [
  "square_hd",
  "square",
  "portrait_4_3",
  "portrait_16_9",
  "landscape_4_3",
  "landscape_16_9",
];

export const fetchImageGeneration = async (prompt, opts, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const {
    model = 'black-forest-labs:flux',
    image_size = 'landscape_4_3', // "square_hd", "square", "portrait_4_3", "portrait_16_9", "landscape_4_3", "landscape_16_9"
  } = opts ?? {};
  if (model === 'black-forest-labs:flux') {
    const u = `https://${aiProxyHost}/api/fal-ai/flux/dev`;
    const j = {
      prompt,
      image_size,
    };

    const res = await fetch(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
    });
    if (res.ok) {
      const blob = await res.blob();
      blob.seed = res.headers.get('X-Seed');
      return blob;
    } else {
      const text = await res.text();
      console.log('got generate image error', text);
      throw new Error(`image generation error: ${text}`);
    }
  } else if (model === 'openai:dall-e-3') {
    const {
      width = 1024, // [1024, 1792]
      height = 1024,
      quality = 'hd', // ['hd', 'standard']
    } = opts ?? {};
    const u = `https://${aiProxyHost}/api/ai/images/generations`;
    const j = {
      prompt,
      model: 'dall-e-3',
      size: `${width}x${height}`,
      quality,
      n: 1,
    };
    const res = await fetch(u, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
    });
    if (res.ok) {
      const blob = await res.blob();
      return blob;
    } else {
      const text = await res.text();
      // const { error } = json;
      console.log('got generate image error', text);
      throw new Error(`image generation error: ${text}`);
    }
  } else {
    throw new Error('unknown image generation model: ' + model);
  }
};

export const inpaintImage = async (blob, maskBlob, {
  prompt = '',
  quality = defaultQuality,
  lossless = false,
} = {}, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const u = `https://${aiProxyHost}/api/ai-aux/flux-inpaint`;
  const fd = new FormData();
  fd.append('image', blob);
  fd.append('mask', maskBlob);
  fd.append('prompt', prompt);
  if (typeof quality === 'number') {
    fd.append('quality', JSON.stringify(Math.round(quality * 100)));
  }
  if (lossless) {
    fd.append('lossless', JSON.stringify(true));
  }
  const res = await fetch(u, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: fd,
  });
  if (res.ok) {
    const blob = await res.blob();
    return blob;
  } else {
    const text = await res.text();
    console.log('got inpaint image error', text);
    throw new Error(`inpaint image error: ${text}`);
  }
};

const characterImageSizeFlux = 'portrait_4_3';
export const generateCharacterImage = async (prompt, opts, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const {
    stylePrompt = `full body shot, front view, facing viewer, standing straight, arms at side, neutral expression, high resolution, flcl anime style`,
    seed,
    guidance_scale,
  } = opts ?? {};

  const fullPrompt = [
    stylePrompt,
    prompt,
  ].filter(Boolean).join('\n');
  const blob = await fetchImageGeneration(fullPrompt, {
    image_size: characterImageSizeFlux,
    seed,
    guidance_scale,
  }, {
    jwt,
  });

  return {
    fullPrompt,
    blob,
  };
};

const backgroundImageSizeFlux = 'square_hd';
export const generateBackgroundImage = async (prompt, opts, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const {
    stylePrompt = `flcl anime style background art`,
    seed,
    guidance_scale,
  } = opts ?? {};

  const fullPrompt = [
    stylePrompt,
    prompt,
  ].filter(Boolean).join('\n');
  const blob = await fetchImageGeneration(fullPrompt, {
    image_size: backgroundImageSizeFlux,
    seed,
    guidance_scale,
  }, {
    jwt,
  });

  return {
    fullPrompt,
    blob,
  };
};

export const generateEmotionImages = async (blob, prompt, opts, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const {
    stylePrompt = `full body shot, front view, facing viewer, standing straight, arms at side, neutral expression, high resolution, flcl anime style`,
    emotions = [
      // 'neutral',
      'happy',
      'sad',
      'angry',
      'surprised',
      // 'eyes closed',
      'joy',
      'sorrow',
      // 'embarrassed',
      // 'disgusted',
      // 'fearful',
      // 'confused',
    ],
    strength = 0.8,
    image_size = characterImageSizeFlux,
    num_inference_steps,
    seed,
    guidance_scale,
  } = opts ?? {};

  // read the blob as a data url
  const image_url = await blobToDataUrl(blob);

  const imageBlobPromises = emotions.map(async emotion => {
    const fullPrompt = [
      stylePrompt,
      prompt,
      `${emotion} facial expression`,
    ].filter(Boolean).join('\n');
    const req = await fetch(`https://${aiProxyHost}/fal-ai/flux/dev/image-to-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        image_url,
        prompt: fullPrompt,
        strength,
        image_size,
        num_inference_steps,
        seed,
        guidance_scale,
      }),
    });
    const blob = await req.blob();
    // console.log('returned blob', blob);
    return blob;
  });
  const imageBlobs = await Promise.all(imageBlobPromises);
  return imageBlobs;

  // const headBoxes = await detect(blob, {
  //   queries: [
  //     'head',
  //   ],
  // }, {
  //   jwt,
  // });
  // console.log('got head boxes', blob, {
  //   headBoxes,
  // });
};

export const generate360Images = async (blob, {
  jwt,
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const fd = new FormData();
  fd.append('image', blob, 'avatar.jpg');

  const res2 = await fetch(`https://${aiProxyHost}/api/ai-aux/sv3d`, {
    method: 'POST',
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
    body: fd,
  });
  if (res2.ok)  {
    const imagesBase64 = await res2.json();
    const images = await Promise.all(imagesBase64.map(async (imageBase64/*, index*/) => {
      const res = await fetch(imageBase64);
      if (res.ok) {
        const blob = await res.blob();
        // console.log(`/tmp/avatar-${index}.png`);
        // const ab = await blob.arrayBuffer();
        // const b = Buffer.from(ab);
        // fs.writeFileSync(`/tmp/avatar-${index}.png`, b);
        return blob;
      } else {
        console.warn('invalid status', res.status);
        throw new Error('invalid status: ' + res.status);
      }
    }));
    return images;
  } else {
    const text = await res2.text();
    console.warn('invalid status', res2.status, text);
    throw new Error(`generate 360 image error: ${text}`);
  }
};