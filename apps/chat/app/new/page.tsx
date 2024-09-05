import { LoginRedirect } from '@/components/login-redirect';
import AgentEditor from './editor';
import { waitForUser } from '@/utils/supabase/server';

async function NewPageInner() {
  const user = await waitForUser();
  return (
    <AgentEditor user={user} />
  );
}

export default async function NewPage() {
  return (
    <>
      <LoginRedirect />
      <NewPageInner />
    </>
  );
}
