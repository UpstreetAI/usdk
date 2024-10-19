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
  connect({
    profile,
  } = {}) {
    return new ReactAgentsMultiplayerConnection({
      url: this.url,
      profile,
    });
  }
}

export class ReactAgentsMultiplayerConnection extends EventTarget {
  static logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };
  static defaultLogLevel = ReactAgentsMultiplayerConnection.logLevels.info;
  url;
  // profile;
  ws;
  constructor({
    url,
    profile,
  }) {
    super();

    this.url = url;
    // this.profile = profile;
  }
}