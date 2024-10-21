export class ReactAgentsClient {
  url;
  constructor(url) {
    this.url = url;
  }
  async join(room, {
    only = false,
  } = {}) {
    const u = `${this.url}/join`;
    const joinReq = await fetch(u, {
      method: 'POST',
      body: JSON.stringify({
        room,
        only,
      }),
    });
    if (joinReq.ok) {
      const joinJson = await joinReq.json();
      // console.log('join json', joinJson);
    } else {
      const text = await joinReq.text();
      console.warn(
        'failed to join, status code: ' + joinReq.status + ': ' + text,
      );
      process.exit(1);
    }
  }
}
