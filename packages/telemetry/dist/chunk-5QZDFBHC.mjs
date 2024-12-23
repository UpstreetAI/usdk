// src/core.ts
import posthog from "posthog-js";
function initTelemetry(apiKey, apiHost, bootstrapData = {}) {
  posthog.init(apiKey, {
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
  posthog.capture(event, properties);
}
function getPostHog() {
  return posthog;
}

export {
  initTelemetry,
  captureEvent,
  getPostHog
};
