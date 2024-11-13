export async function getDepthField(blob, {
  forceFov,
} = {}) {
  const u2 = new URL('https://ai-proxy.isekaichat.workers.dev/deepCalib/predictFov');
  const res2 = await fetch(u2, {
    method: 'POST',
    body: blob,
    mode: 'cors',
  });
  const j = await res2.json();
  console.log('got fov json', j);
  const {
    distortion,
    focalLength,
    fov,
  } = j;
  
  const u = new URL('https://ai-proxy.isekaichat.workers.dev/zoeDepth');
  /* if (forceFov !== undefined) {
    u.searchParams.set('forceFov', forceFov);
  } */
  const res = await fetch(u, {
    method: 'POST',
    body: blob,
    mode: 'cors',
  });
  if (res.ok) {
    const headers = Object.fromEntries(res.headers.entries());
    const depthFieldArrayBuffer = await res.arrayBuffer();
    // const depthField = new Float32Array(depthFieldArrayBuffer);
    // for (let i = 0; i < depthField.length; i++) {
    //   depthField[i] = 1/depthField[i];
    // }

    // const width = parseInt(headers['x-width'], 10);
    // const height = parseInt(headers['x-height'], 10);
    // console.log('got depth 1', {
    //   headers,
    //   depthFieldArrayBuffer,
    //   width,
    //   height,
    // });

    // const pointCloud = reconstructPointCloudFromDepthField(depthFieldArrayBuffer, width, height, fov);
    // console.log('got depth 2', {
    //   pointCloud,
    // });
    // debugger;

    headers['x-fov'] = fov + '';
    return {
      headers,
      arrayBuffer: depthFieldArrayBuffer,
    };
  } else {
    const text = await res.text();
    console.warn('depth field request error', {res, text});
    debugger;
  }

  /* // const u = new URL(`${location.protocol}//${location.host}/api/depth/depthfield`);
  const u = new URL('https://ai-proxy.isekaichat.workers.dev/api/depth/depthfield');
  if (forceFov !== undefined) {
    u.searchParams.set('forceFov', forceFov);
  }
  const res = await fetch(u, {
    method: 'POST',
    body: blob,
    // headers: {
    //   'Content-Type': 'image/png',
    // },
    mode: 'cors',
  });
  if (res.ok) {
    const headers = Object.fromEntries(res.headers.entries());
    const arrayBuffer = await res.arrayBuffer();
    return {
      headers,
      arrayBuffer,
    };
  } else {
    console.warn('depth field request error', res);
    debugger;
  } */
}