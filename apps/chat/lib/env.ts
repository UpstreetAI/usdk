export function getEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_UPSTREET_LOGIN_URL: process.env.NEXT_PUBLIC_UPSTREET_LOGIN_URL,
  };
}
export const env = getEnv();