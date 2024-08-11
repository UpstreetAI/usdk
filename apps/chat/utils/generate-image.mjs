import { aiProxyHost } from './const/endpoints.js';

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

    console.log('call u', u);
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
    const jwt = getCleanJwt();

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