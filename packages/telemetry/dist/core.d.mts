import * as posthog_js from 'posthog-js';

declare function initTelemetry(apiKey: string, apiHost: string, bootstrapData?: Record<string, unknown>): void;
declare function captureEvent(event: string, properties?: Record<string, unknown>): void;
declare function getPostHog(): posthog_js.PostHog;

export { captureEvent, getPostHog, initTelemetry };
