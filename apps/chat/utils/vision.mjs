import {
  aiProxyHost,
  dinoEndpoint,
  samEndpoint,
  depthEndpoint,
} from './const/endpoints.js';
import { blobToDataUrl } from './base64.mjs';

export const describe = async (blob, query = `What's in this image?`, {
  jwt,
} = {}) => {
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
      model: 'gpt-4o',
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
export const getDepth = async (blob, {
  type, // ['indoor', 'outdoor']
} = {}, {
  jwt,
} = {}) => {
  const fd = new FormData();
  fd.append('image', blob);
  if (type) {
    fd.append('type', type);
  }
  const res = await fetch(`${depthEndpoint}/depthanything`, {
    method: 'POST',
    body: fd,
  });
  if (res.ok) {
    const j = await res.arrayBuffer();
    return new Float32Array(j);
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const detect = async (blob, {
  queries = [],
} = {}, {
  jwt,
} = {}) => {
  const fd = new FormData();
  fd.append('image', blob);
  fd.append('query', JSON.stringify(queries));
  const res = await fetch(`${dinoEndpoint}/dino`, {
    method: 'POST',
    body: fd,
  });
  if (res.ok) {
    const j = await res.json();
    return j;
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const segment = async (blob, {
  point_coords, // [[x, y], ...] 
  point_labels, // [0|1, ...]
  box, // [x1, y1, x2, y2]
} = {}, {
  jwt,
} = {}) => {
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
  });
  if (res.ok) {
    const j = await res.arrayBuffer();
    return new Uint8Array(j);
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};
export const segmentAll = async (blob) => {
  const fd = new FormData();
  fd.append('image', blob);
  const res = await fetch(`${samEndpoint}/autosam2`, {
    method: 'POST',
    body: fd,
  });
  if (res.ok) {
    const j = await res.arrayBuffer();
    return new Uint8Array(j);
  } else {
    const text = await res.text();
    throw new Error('invalid status code: ' + res.status + ': ' + text);
  }
};