import { LoginRedirect } from '@/components/login-redirect';
import Builder from './builder';
import { waitForUser } from '@/utils/supabase/server';

export default async function NewPage() {
  const user = await waitForUser();

  return (
    <>
      <LoginRedirect />
      <Builder user={user} />
    </>
  );
}
