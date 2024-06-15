import SignupForm from '@/components/signup-form'
import { getUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function SignupPage() {
  const user = await getUser()

  if (user) {
    redirect('/')
  }

  return (
    <main className="flex flex-col p-4">
      <SignupForm />
    </main>
  )
}
