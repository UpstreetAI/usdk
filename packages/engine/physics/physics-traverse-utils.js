export const getOwnerApp = (app) => {
  for (;;) {
    let ownerApp;
    if (app.parent?.isApp) {
      app = app.parent;
    } else if (app.parent?.isAppManager && (ownerApp = app.parent.getOwnerApp()) !== void 0) {
      app = ownerApp;
    } else {
      break;
    }
  }
  return app;
};
export const getOwnerScn = (app) => {
  for (;;) {
    // let ownerApp;
    if (app.type === 'scn') {
      return app;
    } else if (app.parent) {
      app = app.parent;
    // } else if (app.parent?.isAppManager && (ownerApp = app.parent.getOwnerApp()) !== void 0) {
    //   app = ownerApp;
    } else {
      break;
    }
  }
  return null;
};