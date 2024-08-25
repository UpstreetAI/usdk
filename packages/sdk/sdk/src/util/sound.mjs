import { aiProxyHost } from './endpoints.mjs';

export const generateSound = async (prompt, {
  duration_seconds = undefined,
  prompt_influence = undefined,
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
};