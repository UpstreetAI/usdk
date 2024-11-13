import { aiProxyHost } from './endpoints.js';
import { getCleanJwt } from './utils/jwt-util.js';

//

export const generateImage = async ({
  prompt,
  negativePrompt,

  steps,
}) => {
  const j = {
    prompt,
    negative_prompt: negativePrompt,

    steps,
  };

  const numRetries = 3;
  for (let i = 0; i < numRetries; i++) {
    const jwt = getCleanJwt();
    const res = await fetch(`https://${aiProxyHost}/sdapi/v1/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
    });
    if (res.ok) {
      const json = await res.json();
      const { images } = json;
      const imageBase64 = images[0];
      const dataUrl = `data:image/png;base64,${imageBase64}`;

      const res2 = await fetch(dataUrl);
      const blob = await res2.blob();
      return blob;
    } else {
      console.warn('failed to generate image, retrying', res, i);
      continue;
    }
  }
  throw new Error('failed to generate image after retries');
};

//

const imageHdModel = 'dall-e-3';
export const generateImageHd = async ({
  prompt,
  width = 1024,
  // width = 1792,
  height = 1024,
  quality = 'hd',
}) => {
  const jwt = getCleanJwt();
  const u = `https://${aiProxyHost}/api/ai/images/generations`;
  const j = {
    model: imageHdModel,
    prompt,
    n: 1,
    size: `${width}x${height}`,
    // "quality": "hd",
    quality,
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
    const json = await res.json();
    const { error } = json;
    console.log('got error', { error });
    throw new Error(`image generation error: ${error}`);
  }
};

//

const animateDiffModel = 'mistoonAnime_v20';
export const generateGif = async ({ prompt, negativePrompt }) => {
  const fd = new FormData();
  fd.append('prompt', prompt);
  fd.append('n_prompt', negativePrompt);
  fd.append('model', animateDiffModel);
  const res = await fetch(`https://${aiProxyHost}/animatediff`, {
    method: 'POST',
    body: fd,
  });
  if (res.ok) {
    const blob = await res.blob();
    return blob;
  } else {
    console.warn('invalid status code for generateGif', res.status);
    throw new Error('invalid status code for generateGif');
  }
};

//

export const setSdModel = async (model) => {
  const j = {
    sd_model_checkpoint: model,
  };
  const jwt = getCleanJwt();
  const res = await fetch(`https://${aiProxyHost}/sdapi/v1/options`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(j),
  });
  if (res.ok) {
    // nothing
  } else {
    console.warn('invalid status code for setSdModel', res.status);
    throw new Error('invalid status code for setSdModel');
  }
};

//

export const interrogateDeepBooru = async (blob) => {
  const imageBase64 = await new Promise((accept, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      accept(fr.result);
    };
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

  const j = {
    image: imageBase64,
    model: 'deepdanbooru',
  };
  const jwt = getCleanJwt();
  const res = await fetch(`https://${aiProxyHost}/sdapi/v1/interrogate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(j),
  });
  if (res.ok) {
    const j = await res.json();
    const { caption } = j;
    return caption;
  } else {
    console.warn('invalid status code for interrogateDeepBooru', res.status);
    throw new Error('invalid status code for interrogateDeepBooru');
  }
};

//

const genders = ['male', 'female'];
export const interrogatePromptGender = async (prompt) => {
  const promptModel = 'gpt-3.5-turbo-1106';
  const messages = [
    {
      role: 'system',
      content: `\
You are a gender classifier for text.
For each message from the user, reply with either "male" or "female" (without quotes).
Choose your best guess. Do not reply with anything else.
`,
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const jwt = getCleanJwt();
  const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },

    body: JSON.stringify({
      model: promptModel,
      messages,

      // stop: ['\n'],

      // response_format: {
      //   type: 'json_object',
      // },

      // stream,
    }),
    // signal,
  });
  const json = await res.json();
  let result = json?.choices?.[0]?.message?.content;
  if (!genders.includes(result)) {
    const oldResult = result;
    result = genders[Math.floor(Math.random() * genders.length)];
    console.warn('failed to interrogate gender, defaulting', {
      json,
      prompt,
      oldResult,
      result,
    });
  }
  return result;
};

//

export const img2img = async ({
  prompt,
  negativePrompt,

  width,
  height,

  image,
  mask,
  controlnetImage,

  controlnetWeight = 1,

  seed,
  subseed,
  steps,
  cfg_scale,

  inpaint_full_res = 1, // ["Whole picture", "Only masked"]
  inpainting_fill = 1, // ['fill', 'original', 'latent noise', 'latent nothing']
  mask_blur_x = 0,
  mask_blur_y = 0,

  denoising_strength,
}) => {
  const j = {
    prompt,
    negative_prompt: negativePrompt,

    width,
    height,

    init_images: [image],
    mask,

    seed,
    subseed,
    steps,
    // cfg_scale,

    mask_blur_x,
    mask_blur_y,

    inpaint_full_res,
    inpainting_fill,

    denoising_strength,
  };
  if (controlnetImage) {
    j.alwayson_scripts = {
      controlnet: {
        args: [
          {
            enabled: true,
            module: 'none',
            // "model": "canny",
            model: 'control_v11p_sd15_openpose [cab727d4]',
            weight: controlnetWeight,
            // "image": self.read_image(),
            image: controlnetImage,
            resize_mode: 1,
            lowvram: false,
            processor_res: 512,
            threshold_a: 64,
            threshold_b: 64,
            guidance_start: 0.0,
            guidance_end: 1.0,
            control_mode: 0,
            pixel_perfect: false,
          },
        ],
      },
    };
  }
  if (cfg_scale !== undefined) {
    j.cfg_scale = cfg_scale;
  }

  const numRetries = 3;
  for (let i = 0; i < numRetries; i++) {
    const jwt = getCleanJwt();
    const res = await fetch(`https://${aiProxyHost}/sdapi/v1/img2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(j),
    });
    if (res.ok) {
      const json = await res.json();
      const { images } = json;
      const imageBase64 = images[0];
      const dataUrl = `data:image/png;base64,${imageBase64}`;

      const res2 = await fetch(dataUrl);
      const blob = await res2.blob();
      return blob;
    } else {
      console.warn('failed to generate image, retrying', res, i);
      continue;
    }
  }
  throw new Error('failed to generate image after retries');
};

//

export const remBg = async (blob) => {
  const imageBase64 = await new Promise((accept, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      accept(fr.result);
    };
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });

  const j = {
    input_image: imageBase64,
    model: 'u2net',
  };
  const jwt = getCleanJwt();
  const res = await fetch(`https://${aiProxyHost}/rembg`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(j),
  });
  if (res.ok) {
    const j = await res.json();
    const { image } = j;
    const dataUrl = `data:image/png;base64,${image}`;
    const res2 = await fetch(dataUrl);
    const blob2 = await res2.blob();
    return blob2;
  } else {
    console.warn('invalid status code for interrogateDeepBooru', res.status);
    throw new Error('invalid status code for interrogateDeepBooru');
  }
};
