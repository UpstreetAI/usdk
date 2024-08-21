import { env } from '@/lib/env';
export const dev = !env.NEXT_PUBLIC_VERCEL_BRANCH_URL || /\-git\-dev/.test(env.NEXT_PUBLIC_VERCEL_BRANCH_URL);