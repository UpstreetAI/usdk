import { aiProxyHost, llavaEndpointUrl } from './endpoints.js';
import { QueueManager } from './managers/queue/queue-manager.js';
import { getCleanJwt } from './utils/jwt-util.js';

export const imageCaptioning = async (blob) => {
  // if (!blob) {
  //   throw new Error('no blob');
  // }

  // const response = await fetch(`https://${aiProxyHost}/api/caption`, {
  //   method: 'POST',
  //   body: blob,
  // });
  // const text = await response.text();
  // return text;
  return await llava(blob, 'What is this, in one sentence?');
};

//

export const vqa = async (blob, prompt) => {
  // if (!blob) {
  //   throw new Error('no blob');
  // }

  const jwt = getCleanJwt();
  const res = await fetch(`https://${aiProxyHost}/api/vqa`, {
    method: 'POST',
    body: blob,
    headers: {
      // 'X-Text': text,
      prompt,
      Authorization: `Bearer ${jwt}`,
    },
  });
  const answer = await res.text();
  return answer;
  // const result = await res.json();
  // const {
  //   answer,
  // } = result;
  // return answer;
};

//

export const getTopSegmentBoxes = (
  segmentationResult,
  { maxBoxes = 3, minArea = 0.01, maxArea = 0.8 } = {}
) => {
  const [width, height] = segmentationResult.dims;
  const totalArea = width * height;

  return segmentationResult
    .sort((a, b) => {
      const [x1a, y1a, wa, ha] = a;
      const [x1b, y1b, wb, hb] = b;

      const aArea = wa * ha;
      const bArea = wb * hb;
      return bArea - aArea;
    })
    .filter((s) => {
      const [x, y, w, h] = s;
      const area = w * h;
      const isMin = area >= minArea * totalArea;
      const isMax = area <= maxArea * totalArea;
      /* console.log('check', {
      ratio: area / totalArea,
      isMin,
      isMax,
    }); */
      return isMin && isMax;
    })
    .slice(0, maxBoxes);
};

export const imageSegmentation = async (
  blob,
  segmentBoxFilter = getTopSegmentBoxes
) => {
  const fd = new FormData();
  fd.append('img_file', blob, 'image.jpg');

  const jwt = getCleanJwt();
  const res = await fetch(
    `https://${aiProxyHost}/api/imageSegmentation/get_boxes`,
    {
      method: 'POST',
      body: fd,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  let dims = res.headers.get('X-Dims');
  if (!dims) {
    throw new Error('no dimensions');
  }
  dims = JSON.parse(dims);

  let result = await res.json();
  result.dims = dims;

  result = segmentBoxFilter(result);

  return result;
};
export const imageSegmentationMulti = async ({
  blob,
  // imageBitmapPromise,
  segmentBoxFilter = getTopSegmentBoxes,
}) => {
  const [boxes, imageBitmap] = await Promise.all([
    imageSegmentation(blob, segmentBoxFilter),
    createImageBitmap(blob),
    // imageBitmapPromise,
  ]);

  const queueManager = new QueueManager({
    parallelism: 2,
  });

  const segmentCaptions = [];
  const targetMaxSize = 512;
  for (let i = 0; i < boxes.length; i++) {
    const [x1, y1, w, h] = boxes[i];

    // compute resize height, maintaining aspect ratio
    let w2, h2;
    if (w > h) {
      w2 = targetMaxSize;
      h2 = (targetMaxSize * h) / w;
    } else {
      h2 = targetMaxSize;
      w2 = (targetMaxSize * w) / h;
    }

    const canvas = document.createElement('canvas');
    canvas.width = w2;
    canvas.height = h2;
    const ctx = canvas.getContext('2d');
    // ctx.drawImage(tempCanvas, x1, y1, w, h, 0, 0, w2, h2);
    ctx.drawImage(imageBitmap, x1, y1, w, h, 0, 0, w2, h2);

    const blob = await new Promise((accept, reject) => {
      canvas.toBlob(accept);
    });

    // console.log('caption 1', blob);
    const label = await queueManager.waitForTurn(async () => {
      return imageCaptioning(blob);
    });

    // console.log('caption 2', {caption});
    const caption = {
      bbox: [x1, y1, w, h],
      label,
    };
    console.log('caption', i, caption);
    segmentCaptions.push(caption);

    // const p = createImageBitmap(tempCanvas, x1, y1, w, h, {
    //   resizeWidth: w2,
    //   resizeHeight: h2,
    // });
    // promises.push(p);
  }
  return segmentCaptions;
};

//

export const imageSelection = async (
  blob, // Blob
  points, // [[x, y], ...]
  labels, // [[1], ...] of {0,1} of same length as points. 0 means background, 1 means foreground
  bbox // [x1, y1, x2, y2]
) => {
  const fd = new FormData();
  fd.append('img_file', blob, blob.name ?? 'image.jpg');
  fd.append('points', JSON.stringify(points));
  fd.append('labels', JSON.stringify(labels));
  if (bbox) {
    fd.append('bbox', JSON.stringify(bbox));
  }

  const jwt = getCleanJwt();
  const res = await fetch(
    `https://${aiProxyHost}/api/imageSegmentation/get_point_mask`,
    {
      method: 'POST',
      body: fd,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const dimsString = res.headers.get('X-Dims');

  const dimsJson = JSON.parse(dimsString);
  const bboxString = res.headers.get('X-Bbox');
  const bboxJson = JSON.parse(bboxString);
  const arrayBuffer = await res.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return {
    dims: dimsJson,
    bbox: bboxJson,
    uint8Array,
  };
};

export const imageFind = async (blob, prompt, { promptWeight } = {}) => {
  const fd = new FormData();
  fd.append('input_image', blob, blob.name ?? 'image.jpg');
  fd.append('text_prompt', prompt);
  if (typeof promptWeight === 'number') {
    fd.append('text_threshold', 1 - promptWeight);
  }

  const jwt = getCleanJwt();
  const res = await fetch(`https://${aiProxyHost}/api/gsa/gsa_main`, {
    method: 'POST',
    body: fd,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  const j = await res.json();
  console.log('image find boxes', j);
  return j;

  /* const dimsString = res.headers.get('X-Dims');

  const dimsJson = JSON.parse(dimsString);
  const bboxString = res.headers.get('X-Bbox');
  const bboxJson = JSON.parse(bboxString);
  const arrayBuffer = await res.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  return {
    dims: dimsJson,
    bbox: bboxJson,
    uint8Array,
  }; */
};

//

const visionModelName = `gpt-4-vision-preview`;
export const vision = async (
  blob,
  prompt = 'Describe the most important features of this image, in up to 3 sentences.'
) => {
  // read blob as base64
  const base64_image = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

  const jwt = getCleanJwt();
  const u = `https://${aiProxyHost}/api/ai/chat/completions`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwt}`,
  };
  const j = {
    model: visionModelName,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            // "text": "What's in this image?"
            text: prompt,
          },
          {
            type: 'image_url',
            image_url: {
              // "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
              url: base64_image,
            },
          },
        ],
      },
    ],
    // "max_tokens": 300,
  };
  const res = await fetch(u, {
    method: 'POST',
    headers,
    body: JSON.stringify(j),
  });
  const json = await res.json();
  const text = json.choices[0].message.content;
  return text;
};

export async function llava(blob, prompt) {
  let dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  // extract the raw data
  let rawData = dataUrl.split(',')[1];

  const prompt2 = `A chat between a human and an artificial intelligence assistant. The assistant responds with accurate answers to the human's questions. USER: <image>\n${prompt} ASSISTANT:`;
  let p = {
    // 'model': 'llava-v1.5-13b',
    // 'model': 'mistralai/Mistral-7B-v0.1',
    // 'model': 'BakLLaVA-1',
    prompt: prompt2,
    temperature: 0.2,
    top_p: 0.7,
    max_new_tokens: 512,
    stop: '</s>',
    images: [rawData],
  };
  const jwt = getCleanJwt();
  const res = await fetch(llavaEndpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(p),
  });
  // print the streaming response as string
  const reader = res.body.getReader();
  let resultUint8Array;
  while (true) {
    let { done, value } = await reader.read();
    if (value !== undefined) {
      resultUint8Array = value;
    }
    if (done) {
      break;
    }
  }
  // console.log('got result 1', resultUint8Array);
  // const resultSlice = resultUint8Array.slice(0, -1);
  // console.log('got result 2', resultSlice);
  const decoder = new TextDecoder();
  let resultString = decoder.decode(resultUint8Array);
  const match = resultString.match(/([^\0]*)\0$/);
  // console.log('got match', match);
  resultString = match[1];
  console.log('got result string', { resultString });
  const resultJson = JSON.parse(resultString);
  const text = resultJson.text;
  const textSlice = text.slice(prompt2.length);
  return textSlice;
}

//

export async function ocr(imageBlob) {
  const jwt = getCleanJwt();
  const ocrUrl = `https://${aiProxyHost}/api/ocr`;
  const res = await fetch(ocrUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: imageBlob,
  });
  const text = await res.text();
  return text;
}

//

class VideoStreamReader extends EventTarget {
  constructor(video) {
    super();

    this.video = video;

    this.canvas = document.createElement('canvas');
    // this.canvas.width = this.video.videoWidth;
    // this.canvas.height = this.video.videoHeight;
    this.ctx = this.canvas.getContext('2d');

    this.blob = null;

    this.videoFrameCallback = null;
    this.abortController = new AbortController();

    this.#listen();
  }
  #listen() {
    const recurse = async () => {
      // console.log('recurse 1');

      // resize the canvas if needed
      if (
        this.canvas.width !== this.video.videoWidth ||
        this.canvas.height !== this.video.videoHeight
      ) {
        // debugger;
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      }
      this.ctx.drawImage(this.video, 0, 0);

      // read the video as a blob
      this.blob = await new Promise((accept, reject) => {
        this.canvas.toBlob(accept);
      });
      // check if aborted, return if it is
      if (this.abortController.signal.aborted) return;
      this.dispatchEvent(new MessageEvent('blobchange'));

      // recurse
      this.videoFrameCallback = this.video.requestVideoFrameCallback(recurse);
    };
    recurse();
  }
  close() {
    if (this.videoFrameCallback) {
      this.video.cancelVideoFrameCallback(this.videoFrameCallback);
      this.videoFrameCallback = null;
    }

    this.abortController.abort();
  }
  async read() {
    if (!this.blob) {
      await new Promise((accept, reject) => {
        this.addEventListener('blobchange', accept, { once: true });
      });
    }

    const { blob } = this;
    this.blob = null;

    return blob;
  }
}

export class VqaStream extends EventTarget {
  constructor({
    question = 'What is this?',
    video,
    // enable: {
    //   vqa = false,
    //   ocr = false,
    // } = {},
  } = {}) {
    if (!video) {
      console.warn('missing arguments', {
        video,
      });
      throw new Error('missing argments');
    }

    super();

    this.question = question;
    this.answer = '';
    this.text = '';
    this.video = video;
    this.enable = {
      vqa: false,
      ocr: false,
    };
    this.videoStreamReader = new VideoStreamReader(this.video);

    this.abortController = new AbortController();

    this.#listen();
  }
  getEnabled(key) {
    if (key in this.enable) {
      return this.enable[key];
    } else {
      throw new Error('invalid key: ' + key);
    }
  }
  setEnabled(key, value) {
    if (key in this.enable) {
      this.enable[key] = value;

      this.dispatchEvent(
        new MessageEvent('enabledchange', {
          data: {
            key,
            value,
          },
        })
      );
    } else {
      throw new Error('invalid key: ' + key);
    }
  }
  setQuestion(question) {
    this.question = question;

    this.dispatchEvent(
      new MessageEvent('questionchange', {
        data: {
          question: this.question,
        },
      })
    );
  }
  #listen() {
    // if (!(this.enable.vqa || this.enable.ocr)) {
    //   throw new Error('not enabled');
    // }

    const recurse = async () => {
      // read the video as a blob
      const blob = await this.videoStreamReader.read();
      // check if aborted, return if it is
      if (this.abortController.signal.aborted) return;

      // read the answer
      if (this.enable.vqa) {
        // console.log('vqa query 1', {
        //   question: this.question,
        // });
        const answer = await llava(blob, this.question);
        // check if aborted, return if it is
        if (this.abortController.signal.aborted) return;
        this.answer = answer;
        // console.log('vqa query 1', {
        //   question: this.question,
        //   answer: this.answer,
        // });
        this.dispatchEvent(
          new MessageEvent('answerchange', {
            data: {
              answer: this.answer,
            },
          })
        );
      }
      if (this.enable.ocr) {
        const text = await ocr(blob);
        // check if aborted, return if it is
        if (this.abortController.signal.aborted) return;
        this.text = text;
        this.dispatchEvent(
          new MessageEvent('textchange', {
            data: {
              text: this.text,
            },
          })
        );
      }

      // recurse
      recurse();
    };
    // console.log('video frame listen 1', this.video);
    // let videoFrameCallback = this.video.requestVideoFrameCallback(recurse);
    recurse();
  }
  close() {
    this.abortController.abort();
  }
}
