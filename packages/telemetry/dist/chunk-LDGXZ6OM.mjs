import {
  getPostHog
} from "./chunk-5QZDFBHC.mjs";

// src/next/index.tsx
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { PostHogProvider } from "posthog-js/react";
function initNextTelemetry() {
  const flags = getCookie("bootstrapData");
  let bootstrapData = {};
  if (flags) {
    bootstrapData = JSON.parse(flags);
  }
  const posthog = getPostHog();
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    bootstrap: bootstrapData
  });
}
function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    const posthog = getPostHog();
    if (pathname && typeof window !== "undefined") {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);
  return null;
}
function PHProvider({ children }) {
  const posthog = getPostHog();
  return /* @__PURE__ */ React.createElement(PostHogProvider, { client: posthog }, children);
}

export {
  initNextTelemetry,
  PostHogPageview,
  PHProvider
};
