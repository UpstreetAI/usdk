"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  PHProvider: () => PHProvider,
  PostHogPageview: () => PostHogPageview,
  captureEvent: () => captureEvent,
  getPostHog: () => getPostHog,
  initNextTelemetry: () => initNextTelemetry,
  initTelemetry: () => initTelemetry
});
module.exports = __toCommonJS(src_exports);

// src/core.ts
var import_posthog_js = __toESM(require("posthog-js"));
function initTelemetry(apiKey, apiHost, bootstrapData = {}) {
  import_posthog_js.default.init(apiKey, {
    api_host: apiHost,
    bootstrap: bootstrapData,
    capture_pageview: false,
    loaded: (posthog2) => {
      if (process.env.NODE_ENV === "development")
        posthog2.debug();
    }
  });
}
function captureEvent(event, properties = {}) {
  import_posthog_js.default.capture(event, properties);
}
function getPostHog() {
  return import_posthog_js.default;
}

// src/next/index.tsx
var import_react = require("react");
var import_navigation = require("next/navigation");
var import_cookies_next = require("cookies-next");
var import_react2 = require("posthog-js/react");
var import_jsx_runtime = require("react/jsx-runtime");
function initNextTelemetry() {
  const flags = (0, import_cookies_next.getCookie)("bootstrapData");
  let bootstrapData = {};
  if (flags) {
    bootstrapData = JSON.parse(flags);
  }
  const posthog2 = getPostHog();
  posthog2.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    bootstrap: bootstrapData
  });
}
function PostHogPageview() {
  const pathname = (0, import_navigation.usePathname)();
  const searchParams = (0, import_navigation.useSearchParams)();
  (0, import_react.useEffect)(() => {
    const posthog2 = getPostHog();
    if (pathname && typeof window !== "undefined") {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog2.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, {});
}
function PHProvider({ children }) {
  const posthog2 = getPostHog();
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react2.PostHogProvider, { client: posthog2, children });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PHProvider,
  PostHogPageview,
  captureEvent,
  getPostHog,
  initNextTelemetry,
  initTelemetry
});
