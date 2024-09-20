import { LoginRedirect } from '@/components/login-redirect';
import AgentEditor from './editor';
import { waitForUser } from '@/utils/supabase/server';
import { DevRedirect } from '@/components/development/Dev';

async function NewPageInner() {
  const user = await waitForUser();
  return (
    <AgentEditor user={user} />
  );
}

export default async function NewPage() {
  return (
    <>
      <DevRedirect />
      <LoginRedirect />
      <NewPageInner />
    </>
  );
}
