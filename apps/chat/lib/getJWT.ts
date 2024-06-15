const cookieName = 'auth-jwt'


export async function getJWT() {
  if (typeof window === 'undefined') { // Server
    const { cookies } = await import('next/headers')
    const cookieStore = cookies()

    return cookieStore.get(cookieName)?.value
  } else { // Client
    const cookie = await import('cookie')

    return cookie.parse(document.cookie)[cookieName]
  }
}
