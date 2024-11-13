/*
this file loads React ui plugins into an iframe that floats above the engine.
*/

//

const iframeUrl = 'views/iframe.html';
export class UIManager {
  constructor({
    iframe,
    ioBus,
    plugins = [],
  }) {
    this.iframe = iframe;
    this.ioBus = ioBus;

    this.loadPromise = (async () => {
      if (plugins.length > 0) {
        const load = async e => {
          cleanup();

          await this.ioBus.request('loadUiPlugins', {
            plugins,
          });
        };
        this.iframe.addEventListener('load', load, {once: true});
        const error = e => {
          console.warn('iframe error', e);
          cleanup();
        };
        this.iframe.addEventListener('error', error, {once: true});

        this.iframe.src = iframeUrl;

        const cleanup = () => {
          this.iframe.removeEventListener('load', load);
          this.iframe.removeEventListener('error', error);
        };
      }
    })();
  }
  update(timestamp, timeDiff) {
    // for (const diorama of dioramas) {
    //   diorama.update(timestamp, timeDiff);
    // }
  }
  async waitForLoad() {
    // dioramaRenderer = new DioramaRenderer();
    // return dioramaRenderer.waitForLoad();
    await this.loadPromise;
  }
}