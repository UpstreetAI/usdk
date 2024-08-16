import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import dedent from 'dedent';
import {
  aiProxyHost,
  dinoEndpoint,
  samEndpoint,
  depthEndpoint,
  backgroundRemoverEndpoint,
} from '@/utils/const/endpoints.js';
import {
  defaultOpenAIModel,
} from '@/utils/const/defaults.js';
import { blobToDataUrl } from '@/utils/base64.mjs';

export const describe = async (blob: Blob, query = dedent`\
  Describe the image.
  Do NOT start with "This is an image of..." or anything similar.
`, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }
  const dataUrl = await blobToDataUrl(blob);
  const messages = [
    {
      role: 'user',
      content: [
        {
          "type": "text",
          "text": query,
        },
        {
          "type": "image_url",
          "image_url": {
            // "url": `data:image/webp;base64,${base64}`,
            "url": dataUrl,
          }
        }
      ],
    },
  ];
  const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      // 'OpenAI-Beta': 'assistants=v1',
      Authorization: `Bearer ${jwt}`,
    },

    body: JSON.stringify({
      model: defaultOpenAIModel,
      messages,

      // stream,
    }),
    // signal,
  });
  if (res.ok) {
    const j = await res.json();
    return j.choices[0].message.content;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const describeJson = async (blob: Blob, hint = '', format: z.ZodTypeAny = z.string(), {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }
  const query = dedent`\
    Describe the image using the given JSON format.
    Do NOT start with "This is an image of..." or anything similar.
  ` + (hint ? `\n${hint}` : '');
  const dataUrl = await blobToDataUrl(blob);
  const messages = [
    {
      role: 'user',
      content: [
        {
          "type": "text",
          "text": query,
        },
        {
          "type": "image_url",
          "image_url": {
            // "url": `data:image/webp;base64,${base64}`,
            "url": dataUrl,
          }
        }
      ],
    },
  ];
  const res = await fetch(`https://${aiProxyHost}/api/ai/chat/completions`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
      // 'OpenAI-Beta': 'assistants=v1',
      Authorization: `Bearer ${jwt}`,
    },

    body: JSON.stringify({
      model: defaultOpenAIModel,
      messages,

      response_format: zodResponseFormat(format, 'json_description'),

      // stream,
    }),
    // signal,
  });
  if (res.ok) {
    const j = await res.json();
    const s = j.choices[0].message.content;
    const o = JSON.parse(s);
    return o;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const getDepth = async (blob: Blob, {
  type = 'indoor', // ['indoor', 'outdoor']
} = {}, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }
  const fd = new FormData();
  fd.append('image', blob);
  if (type) {
    fd.append('type', type);
  }
  const res = await fetch(`${depthEndpoint}/depthanything`, {
    method: 'POST',
    body: fd,
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.arrayBuffer();
    return new Float32Array(j);
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const detect = async (blob: Blob, {
  queries = [],
} = {}, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }
  const fd = new FormData();
  fd.append('image', blob);
  fd.append('query', JSON.stringify(queries));
  const res = await fetch(`${dinoEndpoint}/dino`, {
    method: 'POST',
    body: fd,
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.json();
    return j;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const segment = async (blob: Blob, {
  point_coords, // [[x, y], ...] 
  point_labels, // [0|1, ...]
  box, // [x1, y1, x2, y2]
}: {
  point_coords?: [number, number][],
  point_labels?: (0|1)[],
  box?: [number, number, number, number],
} = {}, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }
  const fd = new FormData();
  fd.append('image', blob);
  if (point_coords) {
    fd.append('point_coords', JSON.stringify(point_coords));
  }
  if (point_labels) {
    fd.append('point_labels', JSON.stringify(point_labels));
  }
  if (box) {
    fd.append('box', JSON.stringify(box));
  }
  const res = await fetch(`${samEndpoint}/sam2`, {
    method: 'POST',
    body: fd,
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.arrayBuffer();
    return new Uint8Array(j);
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const segmentAll = async (blob: Blob, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }
  const fd = new FormData();
  fd.append('image', blob);
  const res = await fetch(`${samEndpoint}/autosam2`, {
    method: 'POST',
    body: fd,
    headers: {
      // 'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const j = await res.arrayBuffer();
    return new Uint8Array(j);
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const removeBackground = async (blob: Blob, {
  jwt = '',
} = {}) => {
  if (!jwt) {
    throw new Error('no jwt');
  }

  const res = await fetch(`${backgroundRemoverEndpoint}`, {
    method: 'POST',
    body: blob,
    headers: {
      'Content-Type': blob.type,
      'Authorization': `Bearer ${jwt}`,
      'Format': 'image/webp',
      'Quality': 0.8 + '',
      'Type': 'foreground',
    },
  });
  if (res.ok) {
    const blob = await res.blob();
    return blob;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};