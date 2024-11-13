import { aiProxyHost } from '../endpoints.js';
import { blob2img } from '../util.js';
import { getCleanJwt } from '../utils/jwt-util.js';

const backgroundRemoverEndpoint = `https://${aiProxyHost}/backgroundRemover`;
export const removeBackground = async (imageBlob) => {
  const jwt = getCleanJwt();
  const res = await fetch(backgroundRemoverEndpoint, {
    method: 'POST',
    body: imageBlob,
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  if (res.ok) {
    const resultBlob = await res.blob();
    return resultBlob;
  } else {
    const text = await res.text();
    throw new Error('background removal error: ' + text);
  }
};

const animesegEndpoint = `https://${aiProxyHost}/animeseg/api/rmbg_fn`;
export const removeBackgroundAnime = async (imageBlob) => {
  const jwt = getCleanJwt();
  const imageBlobDataUrl = await new Promise((accept, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      accept(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageBlob);
  });

  // const fd = new FormData();
  // fd.append('input_img', imageBlob);  // imageBlob is the actual Blob of the image
  // fd.append('model_image_size', 0);  // Assuming 1024 is the desired image size

  // console.log('got data url', imageBlobDataUrl);

  const res = await fetch(animesegEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    // body: fd,
    // body: JSON.stringify({
    //   data: {
    //     img: imageBlobDataUrl,
    //     img_size: 0,
    //   },
    // }),
    body: JSON.stringify({
      data: [
        // {
        //   name: 'image.png',
        //   // data: imageBlobDataUrl.match(/,([\s\S]*)$/)[1],
        //   data: imageBlobDataUrl,
        //   path: '/tmp/fake.png',
        // },
        // imageBlobDataUrl,
        imageBlobDataUrl.replace(/^.*?,/, ''),
        1024,
      ],
    }),
  });
  if (res.ok) {
    console.log('get json 1');
    const resultJson = await res.json();
    console.log('get json 2', {
      resultJson,
    });
    const { data } = resultJson;
    const [
      // maskBase64,
      imgBase64,
    ] = data;
    console.log('got image', {
      imgBase64,
    });
    const res2 = await fetch(imgBase64);
    const blob = await res2.blob();
    return blob;
  } else {
    const text = await res.text();
    throw new Error('background removal error: ' + text);
  }
};
globalThis.testAnimeBgRemoval = async () => {
  const res = await fetch('/images/rari.png');
  const blob = await res.blob();

  const blob2 = await removeBackgroundAnime(blob);
  console.log('got blob 2', blob2);
  const img = await blob2img(blob2);
  img.style.cssText = `\
    position: fixed;
    top: 0;
    left: 0;
    width: 256px;
  `;
  document.body.appendChild(img);
};
