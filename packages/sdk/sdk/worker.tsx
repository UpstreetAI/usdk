globalThis.onmessage = (event: any) => {
  console.log('got event', event);

  globalThis.postMessage({
    method: 'pong',
    data: event.data,
  });
};