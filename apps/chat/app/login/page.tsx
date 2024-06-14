import { auth } from '@/auth'
import AuthToken from '@/components/login-auth-token'
// import LoginForm from '@/components/login-form'
import { Session } from '@/lib/types'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = (await auth()) as Session

  if (session) {
    redirect('/')
  }

  return (
    <main className="flex flex-col p-4">
      <AuthToken />
      {/*<LoginForm />*/}
    </main>
  )
}
