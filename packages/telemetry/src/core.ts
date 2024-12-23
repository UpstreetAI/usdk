// packages/telemetry/posthog/core.ts
import posthog from "posthog-js";

export function initTelemetry(apiKey: string, apiHost: string, bootstrapData: Record<string, unknown> = {}) {
  posthog.init(apiKey, {
    api_host: apiHost,
    bootstrap: bootstrapData,
    capture_pageview: false,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
  });
}

export function captureEvent(event: string, properties: Record<string, unknown> = {}) {
  posthog.capture(event, properties);
}

export function getPostHog() {
  return posthog;
}