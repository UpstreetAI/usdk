import AuthToken from '@/components/login-auth-token'
// import LoginForm from '@/components/login-form'
import { waitForUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const user = await waitForUser()

  if (user) {
    redirect('/')
  }
  else {
    
  }

  return (
    <main className="flex flex-col p-4">
      <AuthToken />
    </main>
  )
}
