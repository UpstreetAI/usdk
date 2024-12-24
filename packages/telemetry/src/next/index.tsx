// packages/telemetry/src/next/index.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { getPostHog } from "../core";
import { PostHogProvider } from "posthog-js/react";

export function initNextTelemetry() {
  const flags = getCookie("bootstrapData");
  let bootstrapData = {};
  if (flags) {
    bootstrapData = JSON.parse(flags as string);
  }

  const posthog = getPostHog();
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    bootstrap: bootstrapData,
  });
}

export function PostHogPageview(): JSX.Element {
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

  return <></>;
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  const posthog = getPostHog();
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
