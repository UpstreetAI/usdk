import { env, environment } from '@/lib/env';

export default function VersionPage() {
  const version = {
    environment,
    commitRef: env?.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ?? null,
    commitSha: env?.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? null,
    commitPreviousSha: env?.NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA ?? null,
    commitMessage: env?.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE ?? null,
    env: env ?? {},
  };
  const versionString = JSON.stringify(version, null, 2);
  return (
    <pre>
      {versionString}
    </pre>
  );
}
