import Home from '@/components/home';
import { waitForUser } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function IndexPage() {

  const user = await waitForUser()

  if (user) {
    return (
      <Home />
    );
  }
  else {
    redirect("/explore")
  }
}
