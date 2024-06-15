import AuthToken from '@/components/login-auth-token'
// import LoginForm from '@/components/login-form'
import { getUser } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const user = await getUser()

  if (user) {
    redirect('/')
  }

  return (
    <main className="flex flex-col p-4">
      <AuthToken />
      {/*<LoginForm />*/}
    </main>
  )
}
