// import { z } from 'zod';
// import { zodResponseFormat } from 'openai/helpers/zod';
// import dedent from 'dedent';
import {
  aiProxyHost,
  // dinoEndpoint,
  // samEndpoint,
  // depthEndpoint,
  // backgroundRemoverEndpoint,
} from './const/endpoints.js';
// import { blobToDataUrl } from './base64.mjs';

export const generateSound = async (prompt: string, {
  duration_seconds,
  prompt_influence,
}: {
  duration_seconds?: number,
  prompt_influence?: number,
} = {}, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const res = await fetch(`https://${aiProxyHost}/api/ai/sound-generation`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      // 'OpenAI-Beta': 'assistants=v1',
      Authorization: `Bearer ${jwt}`,
    },

    body: JSON.stringify({
      text: prompt,
      duration_seconds,
      prompt_influence,
    }),
    // signal,
  });
  if (res.ok) {
    const blob = await res.blob();
    return blob;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }

  // const res = await fetch(`${backgroundRemoverEndpoint}`, {
  //   method: 'POST',
  //   body: blob,
  //   headers: {
  //     'Content-Type': blob.type,
  //     'Authorization': `Bearer ${jwt}`,
  //     'Format': 'image/webp',
  //     'Quality': 0.8 + '',
  //     'Type': 'foreground',
  //   },
  // });
};