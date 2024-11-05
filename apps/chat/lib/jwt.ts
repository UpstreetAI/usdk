const cookieName = 'auth-jwt'

export async function getJWT() {
  if (typeof window === 'undefined') { // Server
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    return cookieStore.get(cookieName)?.value ?? '';
  } else { // Client
    const cookie = await import('cookie');
    return cookie.parse(document.cookie)[cookieName] ?? '';
  }
}

const maxAgeMax = 365 * 24 * 60 * 60; // 1 year
export async function setJWT(jwt: string) {
  if (typeof window === 'undefined') { // Server
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    cookieStore.set(cookieName, jwt, {
      maxAge: maxAgeMax,
    });
  } else { // Client
    const cookie = await import('cookie');
    document.cookie = cookie.serialize(cookieName, jwt, {
      maxAge: maxAgeMax,
    });
  }
}
