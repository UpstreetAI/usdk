import { aiProxyHost } from "./endpoints.mjs";

const fetchImageGenerationFns = {
  openai: async ({ prompt, opts }) => {
    const jwt = getCleanJwt();
    opts = opts || {};
    
    const {
      model = 'dall-e-3',
      width = 1024,
      height = 1024,
      quality = 'hd',
    } = {
      model: opts.model ?? 'dall-e-3',
      width: opts.width ?? 1024,
      height: opts.height ?? 1024,
      quality: opts.quality ?? 'hd',
    };

    const u = `https://${aiProxyHost}/api/ai/images/generations`;
    const j = {
      prompt,
      model,
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
      const arrayBuffer = await res.arrayBuffer();
      return arrayBuffer;
    } else {
      const json = await res.json();
      const { error } = json;
      console.log('got generate image error', error);
      throw new Error(`image generation error: ${error}`);
    }
  },
};

export const fetchImageGeneration = async (prompt, opts) => {
  opts = opts || {};
  opts.model = opts.model || 'openai:dall-e-3';

  const model = opts.model;
  const match = model.match(/^(.+?):/);

  if (match) {
    const modelType = match[1];
    const fn = fetchImageGenerationFns[modelType];
    if (fn) {
      const res = await fn({ prompt, opts });
      return res;
    } else {
      throw new Error('invalid model type: ' + JSON.stringify(modelType));
    }
  } else {
    throw new Error('invalid model: ' + JSON.stringify(model));
  }
};
