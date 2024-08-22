import { LoginRedirect } from '@/components/login-redirect';
import AgentEditor from './editor';

export default async function NewPage() {
  return (
    <>
      <LoginRedirect />
      <AgentEditor />
    </>
  );
}
