export class HistoryManager extends EventTarget {
  constructor({
    url = location.href,
  } = {}) {
    super();

    this.#url = url;

    this.#listen();
  }
  #url;

  #listen() {
    // listen for popstate
    const popstate = e => {
      const url = location.href;
      this.#url = url;
      this.dispatchEvent(new MessageEvent('urlchange', {
        data: {
          url,
        },
      }));
    };
    globalThis.addEventListener('popstate', popstate);
  }

  getUrl() {
    return this.#url;
  }
  pushUrl(url) {
    // use pushState to update url without reloading
    history.pushState(null, null, url);

    // dispatch fake popstate event
    globalThis.dispatchEvent(new MessageEvent('popstate'));
  }
  replaceUrl(url) {
    // use replaceState to update url without reloading
    history.replaceState(null, null, url);

    // dispatch fake popstate event
    globalThis.dispatchEvent(new MessageEvent('popstate'));
  }
}