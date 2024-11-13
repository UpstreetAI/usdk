export class Router extends EventTarget {
  constructor() {
    super();

    this.routeHandlers = [];
  }
  registerRouteHandler(routeHandler) {
    this.routeHandlers.push(routeHandler);
  }
  async load() {
    await this.setUrl(new URL(location.href));
  }
  async setUrl(u) {
    for (let i = 0; i < this.routeHandlers.length; i++) {
      const routeHandler = this.routeHandlers[i];
      let route, error;
      try {
        route = await routeHandler(u);
      } catch(err) {
        error = err;
      }
      if (route) {
        const e = new MessageEvent('route', {
          data: route,
        });

        let promise = Promise.resolve();
        e.waitUntil = p => {
          promise = p;
        };
        this.dispatchEvent(e);

        await promise;

        break;
      } else if (error) {
        const e = new MessageEvent('error', {
          data: error,
        });
        this.dispatchEvent(e);
        break;
      }
    }
  }
  async replaceUrl(u) {
    // console.log('replace url', u);
    history.replaceState({}, '', u.href);
    await this.setUrl(u);
  }
}